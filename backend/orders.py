"""Orders, Addresses, Wishlist endpoints."""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from auth import get_current_user

router = APIRouter(prefix="/api", tags=["account"])


class Address(BaseModel):
    id: Optional[str] = None
    label: str = Field(default="Home")
    first_name: str
    last_name: str
    address_line1: str
    address_line2: Optional[str] = ""
    city: str
    postcode: str
    country: str = "United Kingdom"
    phone: Optional[str] = ""
    is_default: bool = False


class WishlistItemIn(BaseModel):
    product_id: str


# ---------- ORDERS ----------
@router.get("/orders")
async def list_orders(user: dict = Depends(get_current_user)):
    from server import db
    items = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"items": items}


@router.get("/orders/{order_id}")
async def get_order(order_id: str, user: dict = Depends(get_current_user)):
    from server import db
    order = await db.orders.find_one({"id": order_id, "user_id": user["id"]}, {"_id": 0})
    if not order:
        raise HTTPException(404, "Order not found")
    return order


# ---------- ADDRESSES ----------
@router.get("/addresses")
async def list_addresses(user: dict = Depends(get_current_user)):
    from server import db
    items = await db.addresses.find({"user_id": user["id"]}, {"_id": 0}).to_list(50)
    return {"items": items}


@router.post("/addresses")
async def create_address(payload: Address, user: dict = Depends(get_current_user)):
    from server import db
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["user_id"] = user["id"]
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    if doc.get("is_default"):
        await db.addresses.update_many({"user_id": user["id"]}, {"$set": {"is_default": False}})
    await db.addresses.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.patch("/addresses/{address_id}")
async def update_address(address_id: str, payload: Address, user: dict = Depends(get_current_user)):
    from server import db
    updates = payload.model_dump(exclude_unset=True, exclude={"id"})
    if updates.get("is_default"):
        await db.addresses.update_many({"user_id": user["id"]}, {"$set": {"is_default": False}})
    res = await db.addresses.update_one({"id": address_id, "user_id": user["id"]}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(404, "Address not found")
    doc = await db.addresses.find_one({"id": address_id}, {"_id": 0})
    return doc


@router.delete("/addresses/{address_id}")
async def delete_address(address_id: str, user: dict = Depends(get_current_user)):
    from server import db
    res = await db.addresses.delete_one({"id": address_id, "user_id": user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(404, "Address not found")
    return {"ok": True}


# ---------- WISHLIST ----------
@router.get("/wishlist")
async def get_wishlist(user: dict = Depends(get_current_user)):
    from server import db
    items = await db.wishlists.find({"user_id": user["id"]}, {"_id": 0}).to_list(200)
    product_ids = [i["product_id"] for i in items]
    products = await db.products.find({"id": {"$in": product_ids}}, {"_id": 0}).to_list(200)
    return {"items": products}


@router.post("/wishlist")
async def add_to_wishlist(payload: WishlistItemIn, user: dict = Depends(get_current_user)):
    from server import db
    existing = await db.wishlists.find_one({"user_id": user["id"], "product_id": payload.product_id})
    if existing:
        return {"ok": True, "already": True}
    await db.wishlists.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "product_id": payload.product_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"ok": True}


@router.delete("/wishlist/{product_id}")
async def remove_from_wishlist(product_id: str, user: dict = Depends(get_current_user)):
    from server import db
    await db.wishlists.delete_one({"user_id": user["id"], "product_id": product_id})
    return {"ok": True}


# ---------- ADMIN: FULFILLMENT PIPELINE ----------
ORDER_STATUSES = ["pending_payment", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"]

# Status that triggers a customer email
EMAIL_ON_STATUS = {"shipped", "delivered"}

# Carrier registry — tracking URL built from {tracking_number}
CARRIERS = {
    "Royal Mail":      "https://www.royalmail.com/track-your-item#/tracking-results/{tn}",
    "Royal Mail Tracked 24": "https://www.royalmail.com/track-your-item#/tracking-results/{tn}",
    "Royal Mail Tracked 48": "https://www.royalmail.com/track-your-item#/tracking-results/{tn}",
    "DPD":             "https://track.dpd.co.uk/parcels/{tn}",
    "Evri":            "https://www.evri.com/track/parcel/{tn}",
    "Parcelforce":     "https://www.parcelforce.com/track-trace?trackNumber={tn}",
    "Yodel":           "https://www.yodel.co.uk/tracking/{tn}",
    "DHL":             "https://www.dhl.com/gb-en/home/tracking/tracking-parcel.html?submit=1&tracking-id={tn}",
    "UPS":             "https://www.ups.com/track?tracknum={tn}",
    "FedEx":           "https://www.fedex.com/fedextrack/?trknbr={tn}",
}


def _tracking_url(carrier: str | None, tracking_number: str | None) -> str | None:
    if not carrier or not tracking_number:
        return None
    tpl = CARRIERS.get(carrier)
    if not tpl:
        # Fuzzy match: try case-insensitive prefix match against known carriers
        c_low = carrier.lower()
        for name, t in CARRIERS.items():
            if c_low.startswith(name.lower()) or name.lower() in c_low:
                tpl = t
                break
    if not tpl:
        return None
    return tpl.format(tn=tracking_number.strip())


class StatusUpdateIn(BaseModel):
    status: str
    note: Optional[str] = ""
    carrier: Optional[str] = None
    tracking_number: Optional[str] = None
    estimated_delivery: Optional[str] = None


@router.post("/admin/orders/{order_id}/status")
async def admin_update_order_status(order_id: str, payload: StatusUpdateIn, user: dict = Depends(get_current_user)):
    """Move an order through the fulfillment pipeline. Emits emails on shipped + delivered."""
    from server import db
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin access required.")
    if payload.status not in ORDER_STATUSES:
        raise HTTPException(400, f"Invalid status. Must be one of {ORDER_STATUSES}")
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(404, "Order not found.")

    now = datetime.now(timezone.utc).isoformat()
    updates: dict = {"status": payload.status, "updated_at": now}

    # Carrier + tracking — only update if provided
    if payload.carrier:
        updates["carrier"] = payload.carrier
    if payload.tracking_number:
        updates["tracking_number"] = payload.tracking_number.strip()
    if payload.estimated_delivery:
        updates["estimated_delivery"] = payload.estimated_delivery

    # Auto-build tracking URL when both carrier + number are known
    carrier_now = updates.get("carrier") or order.get("carrier")
    tn_now = updates.get("tracking_number") or order.get("tracking_number")
    tracking_url = _tracking_url(carrier_now, tn_now)
    if tracking_url:
        updates["tracking_url"] = tracking_url

    # Per-status timestamps
    stamp_field = {
        "processing": "processing_at",
        "packed": "packed_at",
        "shipped": "shipped_at",
        "out_for_delivery": "out_for_delivery_at",
        "delivered": "delivered_at",
        "cancelled": "cancelled_at",
    }.get(payload.status)
    if stamp_field:
        updates[stamp_field] = now

    # Timeline event log
    timeline = list(order.get("timeline") or [])
    timeline.append({"status": payload.status, "at": now, "note": payload.note or ""})
    updates["timeline"] = timeline

    await db.orders.update_one({"id": order_id}, {"$set": updates})
    order.update(updates)

    # Fire-and-forget emails
    if payload.status in EMAIL_ON_STATUS:
        try:
            import asyncio as _asyncio
            if payload.status == "shipped":
                from email_service import send_shipping_email
                _asyncio.create_task(send_shipping_email(order, order.get("tracking_number"), order.get("carrier")))
            elif payload.status == "delivered":
                from email_service import send_delivered_email
                _asyncio.create_task(send_delivered_email(order))
        except Exception:
            pass

    return {"ok": True, "order": order}


# Legacy: keep /ship for backwards compatibility — delegates to /status
class ShipOrderIn(BaseModel):
    tracking_number: Optional[str] = None
    carrier: Optional[str] = None


@router.post("/admin/orders/{order_id}/ship")
async def admin_ship_order(order_id: str, payload: ShipOrderIn, user: dict = Depends(get_current_user)):
    return await admin_update_order_status(order_id, StatusUpdateIn(
        status="shipped",
        carrier=payload.carrier,
        tracking_number=payload.tracking_number,
    ), user)


@router.get("/admin/orders/queue")
async def admin_orders_queue(user: dict = Depends(get_current_user)):
    """Counts of orders awaiting next action, grouped by status. Used to power the admin queue dashboard."""
    from server import db
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin access required.")
    queue = {}
    for s in ["confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered"]:
        queue[s] = await db.orders.count_documents({"status": s})
    queue["all"] = await db.orders.count_documents({})
    return queue


@router.get("/admin/orders/{order_id}/packing-slip")
async def admin_packing_slip(order_id: str, user: dict = Depends(get_current_user)):
    """Return print-ready HTML packing slip / dispatch note."""
    from fastapi.responses import HTMLResponse
    from server import db
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin access required.")
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(404, "Order not found.")

    addr = order.get("address") or {}
    items_html = "".join([
        f"""<tr>
            <td style="padding:10px 6px;border-bottom:1px solid #E5DED3;">{it.get('name', '—')}</td>
            <td style="padding:10px 6px;border-bottom:1px solid #E5DED3;text-align:center;">{it.get('quantity', 1)}</td>
            <td style="padding:10px 6px;border-bottom:1px solid #E5DED3;text-align:right;font-family:monospace;font-size:11px;">{it.get('product_id', '')[:10]}</td>
        </tr>"""
        for it in (order.get('items') or [])
    ])

    html = f"""<!doctype html>
<html><head><meta charset="utf-8"><title>Packing Slip #{order['id'][:8].upper()}</title>
<style>
  @page {{ margin: 18mm; }}
  body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color:#111; max-width:780px; margin:0 auto; padding:24px; }}
  .gold {{ color:#C9983F; }}
  h1 {{ font-family: Georgia, serif; font-size: 28px; margin: 0 0 4px; }}
  .eyebrow {{ font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:#6F6A63; }}
  .header {{ display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid #E5DED3; padding-bottom:24px; margin-bottom:24px; }}
  .row {{ display:flex; gap:24px; margin-bottom:28px; }}
  .col {{ flex:1; }}
  table {{ width:100%; border-collapse: collapse; }}
  th {{ text-align:left; padding:10px 6px; border-bottom:2px solid #111; font-size:11px; text-transform:uppercase; letter-spacing:0.15em; }}
  .actions {{ margin-top: 28px; text-align:right; font-size: 11px; color:#6F6A63; }}
  .print-btn {{ background:#111; color:#fff; border:none; padding:10px 24px; cursor:pointer; font-size:11px; letter-spacing:0.2em; text-transform:uppercase; }}
  @media print {{ .print-btn {{ display:none; }} }}
</style></head>
<body>
  <div class="header">
    <div>
      <div class="eyebrow">Dispatch Note</div>
      <h1>MA <span class="gold">Home Interiors</span></h1>
      <p style="font-size:12px;color:#6F6A63;margin:4px 0 0;">Glasgow, United Kingdom</p>
    </div>
    <div style="text-align:right;">
      <div class="eyebrow">Order</div>
      <p style="font-family:monospace;font-size:16px;margin:4px 0 0;">#{order['id'][:8].upper()}</p>
      <p style="font-size:12px;color:#6F6A63;">{datetime.fromisoformat(order.get('created_at', datetime.now(timezone.utc).isoformat()).replace('Z','+00:00')).strftime('%d %B %Y')}</p>
    </div>
  </div>

  <div class="row">
    <div class="col">
      <div class="eyebrow" style="margin-bottom:8px;">Deliver to</div>
      <p style="font-size:14px;line-height:1.6;margin:0;">
        <strong>{addr.get('first_name','')} {addr.get('last_name','')}</strong><br>
        {addr.get('address_line1','')}<br>
        {addr.get('address_line2','') and addr.get('address_line2')+'<br>' or ''}
        {addr.get('city','')}, {addr.get('postcode','')}<br>
        {addr.get('country','United Kingdom')}<br>
        {addr.get('phone','') and 'Tel: '+addr.get('phone') or ''}
      </p>
    </div>
    <div class="col">
      <div class="eyebrow" style="margin-bottom:8px;">Carrier</div>
      <p style="font-size:14px;line-height:1.6;margin:0;">
        {order.get('carrier') or '— to be confirmed —'}<br>
        {order.get('tracking_number') and 'Tracking: '+order.get('tracking_number') or ''}
      </p>
    </div>
  </div>

  <table>
    <thead><tr><th>Item</th><th style="text-align:center;">Qty</th><th style="text-align:right;">SKU</th></tr></thead>
    <tbody>{items_html}</tbody>
  </table>

  <p class="actions"><button class="print-btn" onclick="window.print()">Print this slip</button></p>
  <p style="font-size:10.5px;color:#6F6A63;text-align:center;margin-top:40px;">
    Thank you for supporting our family-built business — from our home in Glasgow to yours.
  </p>
</body></html>"""
    return HTMLResponse(content=html)


@router.get("/admin/orders")
async def admin_list_orders(user: dict = Depends(get_current_user)):
    """List all orders (admin only)."""
    from server import db
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin access required.")
    items = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"items": items}
