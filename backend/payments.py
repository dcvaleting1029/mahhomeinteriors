"""Stripe checkout payments using emergentintegrations."""
import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionResponse,
    CheckoutStatusResponse,
    CheckoutSessionRequest,
)

from auth import get_current_user
from email_service import send_order_confirmation
from coupons import lookup_and_apply as apply_coupon

router = APIRouter(prefix="/api", tags=["payments"])

# Allowed fixed shipping methods (price set on backend only)
SHIPPING_METHODS = {
    "standard": {"name": "Standard Delivery", "price": 0.00, "free_over": 100.0, "fallback_price": 4.99},
    "express": {"name": "Express Delivery", "price": 6.99},
}


class CartLine(BaseModel):
    product_id: str
    quantity: int = Field(ge=1, le=20)


class CheckoutIn(BaseModel):
    items: List[CartLine]
    shipping_method: str = "standard"
    origin_url: str
    contact_email: Optional[str] = None
    address: Optional[dict] = None
    coupon_code: Optional[str] = None


def _stripe(request: Request) -> StripeCheckout:
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    return StripeCheckout(api_key=os.environ["STRIPE_API_KEY"], webhook_url=webhook_url)


@router.post("/checkout/session")
async def create_checkout(payload: CheckoutIn, request: Request):
    from server import db

    if not payload.items:
        raise HTTPException(400, "Your cart is empty.")

    # Look up products on backend (DO NOT trust frontend prices)
    ids = [i.product_id for i in payload.items]
    products = await db.products.find({"id": {"$in": ids}}, {"_id": 0}).to_list(50)
    product_map = {p["id"]: p for p in products}

    subtotal = 0.0
    enriched: List[dict] = []
    for line in payload.items:
        p = product_map.get(line.product_id)
        if not p:
            raise HTTPException(400, f"Product not found: {line.product_id}")
        line_total = round(float(p["price"]) * line.quantity, 2)
        subtotal += line_total
        enriched.append({
            "product_id": p["id"],
            "name": p["name"],
            "price": float(p["price"]),
            "quantity": line.quantity,
            "image": p.get("image"),
            "line_total": line_total,
        })
    subtotal = round(subtotal, 2)

    # Coupon — server-side validation, do not trust frontend amounts
    coupon_info = await apply_coupon(db, payload.coupon_code, subtotal)
    discount_amount = float(coupon_info["discount_amount"]) if coupon_info else 0.0
    free_shipping = bool(coupon_info["free_shipping"]) if coupon_info else False

    # Shipping
    method = SHIPPING_METHODS.get(payload.shipping_method)
    if not method:
        raise HTTPException(400, "Invalid shipping method.")
    if free_shipping:
        shipping_cost = 0.0
    elif payload.shipping_method == "standard":
        shipping_cost = 0.0 if subtotal >= method["free_over"] else method["fallback_price"]
    else:
        shipping_cost = float(method["price"])
    shipping_cost = round(shipping_cost, 2)

    # VAT included in price (UK convention) — we don't add VAT separately
    tax = 0.0
    total = round(max(0.0, subtotal - discount_amount + shipping_cost + tax), 2)

    # Auth (optional — checkout works for guests)
    user_email = payload.contact_email
    user_id = None
    try:
        user = await get_current_user(request)
        user_id = user["id"]
        if not user_email:
            user_email = user["email"]
    except HTTPException:
        pass

    if not user_email:
        raise HTTPException(400, "Email is required for checkout.")

    # Generate session
    order_id = str(uuid.uuid4())
    success_url = f"{payload.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{payload.origin_url}/payment/failed?order_id={order_id}"

    stripe_checkout = _stripe(request)
    metadata = {
        "order_id": order_id,
        "user_email": user_email,
        "user_id": user_id or "guest",
        "shipping_method": payload.shipping_method,
        "coupon_code": (coupon_info["code"] if coupon_info else ""),
    }
    cs_req = CheckoutSessionRequest(
        amount=float(total),
        currency="gbp",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
    )
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(cs_req)

    # Record payment_transactions entry
    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "order_id": order_id,
        "user_id": user_id,
        "user_email": user_email,
        "amount": total,
        "currency": "gbp",
        "subtotal": subtotal,
        "shipping_cost": shipping_cost,
        "tax": tax,
        "metadata": metadata,
        "payment_status": "initiated",
        "status": "initiated",
        "items": enriched,
        "address": payload.address,
        "shipping_method": payload.shipping_method,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    # Pre-create a pending order doc (will be finalised on success)
    await db.orders.insert_one({
        "id": order_id,
        "user_id": user_id,
        "user_email": user_email,
        "session_id": session.session_id,
        "items": enriched,
        "subtotal": subtotal,
        "discount_amount": discount_amount,
        "coupon_code": coupon_info["code"] if coupon_info else None,
        "shipping_cost": shipping_cost,
        "tax": tax,
        "total": total,
        "currency": "gbp",
        "status": "pending_payment",
        "payment_status": "initiated",
        "address": payload.address,
        "shipping_method": payload.shipping_method,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {
        "url": session.url,
        "session_id": session.session_id,
        "order_id": order_id,
        "subtotal": subtotal,
        "discount_amount": discount_amount,
        "coupon_code": coupon_info["code"] if coupon_info else None,
        "shipping_cost": shipping_cost,
        "total": total,
    }


@router.get("/checkout/status/{session_id}")
async def checkout_status(session_id: str, request: Request):
    import asyncio
    from server import db
    stripe_checkout = _stripe(request)

    # Retry with backoff — Stripe sometimes 404s for ~1-2s after session creation
    last_err: Optional[Exception] = None
    status: Optional[CheckoutStatusResponse] = None
    for delay in (0.0, 0.6, 1.2, 2.0):
        if delay:
            await asyncio.sleep(delay)
        try:
            status = await stripe_checkout.get_checkout_status(session_id)
            last_err = None
            break
        except Exception as e:
            last_err = e
            continue

    if status is None:
        # Return a soft-pending payload so the frontend can keep polling
        existing = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        return {
            "session_id": session_id,
            "status": existing.get("status", "open") if existing else "open",
            "payment_status": existing.get("payment_status", "pending") if existing else "pending",
            "amount_total": int(round((existing.get("amount", 0) if existing else 0) * 100)),
            "currency": (existing.get("currency", "gbp") if existing else "gbp"),
            "order": await db.orders.find_one({"session_id": session_id}, {"_id": 0}),
            "error": str(last_err) if last_err else "unavailable",
        }

    tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    # Update only if state changed and not yet finalised
    if tx and tx.get("payment_status") != status.payment_status:
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "payment_status": status.payment_status,
                "status": status.status,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }},
        )
        # Finalise order on first successful paid event
        if status.payment_status == "paid":
            res = await db.orders.update_one(
                {"session_id": session_id, "status": "pending_payment"},
                {"$set": {
                    "status": "confirmed",
                    "payment_status": "paid",
                    "paid_at": datetime.now(timezone.utc).isoformat(),
                }},
            )
            # Send confirmation email exactly once
            if res.modified_count > 0:
                order_doc = await db.orders.find_one({"session_id": session_id}, {"_id": 0})
                if order_doc and not order_doc.get("confirmation_sent"):
                    await send_order_confirmation(order_doc, order_doc.get("user_email"))
                    await db.orders.update_one({"session_id": session_id}, {"$set": {"confirmation_sent": True}})

    order = await db.orders.find_one({"session_id": session_id}, {"_id": 0})
    return {
        "session_id": session_id,
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency,
        "order": order,
    }


@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    from server import db
    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    stripe_checkout = _stripe(request)
    try:
        event = await stripe_checkout.handle_webhook(body, signature)
    except Exception as e:
        raise HTTPException(400, f"Webhook error: {str(e)}")

    session_id = event.session_id
    if event.payment_status == "paid" and session_id:
        res = await db.orders.update_one(
            {"session_id": session_id, "status": "pending_payment"},
            {"$set": {
                "status": "confirmed",
                "payment_status": "paid",
                "paid_at": datetime.now(timezone.utc).isoformat(),
            }},
        )
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": event.payment_status, "status": "completed"}},
        )
        # Send confirmation email exactly once (webhook is the canonical source)
        if res.modified_count > 0:
            order_doc = await db.orders.find_one({"session_id": session_id}, {"_id": 0})
            if order_doc and not order_doc.get("confirmation_sent"):
                await send_order_confirmation(order_doc, order_doc.get("user_email"))
                await db.orders.update_one({"session_id": session_id}, {"$set": {"confirmation_sent": True}})
    return {"received": True}
