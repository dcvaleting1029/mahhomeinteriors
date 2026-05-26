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


# ---------- ADMIN: SHIP ORDER ----------
class ShipOrderIn(BaseModel):
    tracking_number: Optional[str] = None
    carrier: Optional[str] = None


@router.post("/admin/orders/{order_id}/ship")
async def admin_ship_order(order_id: str, payload: ShipOrderIn, user: dict = Depends(get_current_user)):
    """Mark an order as shipped (admin only) and email the customer."""
    from server import db
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin access required.")
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(404, "Order not found.")
    updates = {
        "status": "shipped",
        "shipped_at": datetime.now(timezone.utc).isoformat(),
    }
    if payload.tracking_number:
        updates["tracking_number"] = payload.tracking_number
    if payload.carrier:
        updates["carrier"] = payload.carrier
    await db.orders.update_one({"id": order_id}, {"$set": updates})
    order.update(updates)
    # Fire-and-forget shipping email
    try:
        from email_service import send_shipping_email
        import asyncio as _asyncio
        _asyncio.create_task(send_shipping_email(order, payload.tracking_number, payload.carrier))
    except Exception:
        pass
    return {"ok": True, "order": order}
