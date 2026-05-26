"""Coupon codes — seed + validation + admin CRUD + checkout application."""
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional

from auth import get_current_user

router = APIRouter(prefix="/api/coupons", tags=["coupons"])


# Seed catalog of valid codes (case-insensitive). Inserted only when collection is empty.
SEED_COUPONS = [
    {
        "code": "WELCOME10",
        "description": "10% off your first order",
        "discount_type": "percent",
        "discount_value": 10,
        "min_subtotal": 0,
        "active": True,
        "expires_at": None,
        "usage_limit": None,
        "times_used": 0,
        "first_order_only": True,
    },
    {
        "code": "SAVE20",
        "description": "20% off orders over £200",
        "discount_type": "percent",
        "discount_value": 20,
        "min_subtotal": 200,
        "active": True,
        "expires_at": None,
        "usage_limit": 500,
        "times_used": 0,
        "first_order_only": False,
    },
    {
        "code": "FREESHIP",
        "description": "Free shipping on any order",
        "discount_type": "free_shipping",
        "discount_value": 0,
        "min_subtotal": 0,
        "active": True,
        "expires_at": None,
        "usage_limit": None,
        "times_used": 0,
        "first_order_only": False,
    },
]


async def seed_coupons(db):
    """Seed coupons only on first run; admin CRUD changes persist."""
    if await db.coupons.count_documents({}) == 0:
        for c in SEED_COUPONS:
            await db.coupons.insert_one({**c})
    await db.coupons.create_index("code", unique=True)


def _compute_discount(coupon: dict, subtotal: float) -> dict:
    """Return {discount_amount, free_shipping} given a valid coupon + subtotal."""
    if coupon["discount_type"] == "percent":
        amount = round(subtotal * (float(coupon["discount_value"]) / 100.0), 2)
        return {"discount_amount": amount, "free_shipping": False}
    if coupon["discount_type"] == "fixed":
        return {"discount_amount": min(subtotal, float(coupon["discount_value"])), "free_shipping": False}
    if coupon["discount_type"] == "free_shipping":
        return {"discount_amount": 0.0, "free_shipping": True}
    return {"discount_amount": 0.0, "free_shipping": False}


async def _validation_error(db, coupon: dict, subtotal: float, user_id: Optional[str]) -> Optional[str]:
    """Return a user-friendly rejection reason, or None if the coupon is valid."""
    if not coupon.get("active", True):
        return "That code isn't valid."
    expires_at = coupon.get("expires_at")
    if expires_at:
        try:
            if datetime.fromisoformat(expires_at.replace("Z", "+00:00")) < datetime.now(timezone.utc):
                return "That code has expired."
        except Exception:
            pass
    usage_limit = coupon.get("usage_limit")
    if usage_limit is not None and int(coupon.get("times_used", 0)) >= int(usage_limit):
        return "That code has been fully redeemed."
    if subtotal < float(coupon.get("min_subtotal", 0)):
        return f"Spend over £{coupon['min_subtotal']:.0f} to use this code."
    if coupon.get("first_order_only"):
        if not user_id:
            return "Sign in to use this first-order code."
        prior_paid = await db.orders.count_documents({"user_id": user_id, "payment_status": "paid"})
        if prior_paid > 0:
            return "This code is for first-time orders only."
    return None


async def lookup_and_apply(db, code: Optional[str], subtotal: float, user_id: Optional[str] = None) -> Optional[dict]:
    """Look up coupon by code, validate, and return application details. Returns None if invalid."""
    if not code:
        return None
    coupon = await db.coupons.find_one({"code": code.strip().upper()}, {"_id": 0})
    if not coupon:
        return None
    if await _validation_error(db, coupon, subtotal, user_id):
        return None
    applied = _compute_discount(coupon, subtotal)
    return {
        "code": coupon["code"],
        "description": coupon.get("description", ""),
        "discount_type": coupon["discount_type"],
        "discount_value": coupon["discount_value"],
        **applied,
    }


async def increment_usage(db, code: Optional[str]) -> None:
    if not code:
        return
    await db.coupons.update_one({"code": code.strip().upper()}, {"$inc": {"times_used": 1}})


# ---------- PUBLIC ENDPOINTS ----------
class ValidateIn(BaseModel):
    code: str = Field(min_length=1, max_length=40)
    subtotal: float = Field(ge=0)


@router.post("/validate")
async def validate_coupon(payload: ValidateIn):
    from server import db
    code = payload.code.strip().upper()
    coupon = await db.coupons.find_one({"code": code}, {"_id": 0})
    if not coupon:
        raise HTTPException(400, "That code isn't valid.")
    # Guest validation — first-order-only codes require auth (use /validate/auth instead)
    err = await _validation_error(db, coupon, payload.subtotal, None)
    if err:
        raise HTTPException(400, err)
    applied = _compute_discount(coupon, payload.subtotal)
    return {
        "ok": True,
        "code": coupon["code"],
        "description": coupon.get("description", ""),
        "discount_type": coupon["discount_type"],
        "discount_value": coupon["discount_value"],
        "min_subtotal": coupon.get("min_subtotal", 0),
        **applied,
    }


# A second validation endpoint that uses an authenticated session (for first-order codes).
@router.post("/validate/auth")
async def validate_coupon_auth(payload: ValidateIn, user: dict = Depends(get_current_user)):
    from server import db
    code = payload.code.strip().upper()
    coupon = await db.coupons.find_one({"code": code}, {"_id": 0})
    if not coupon:
        raise HTTPException(400, "That code isn't valid.")
    err = await _validation_error(db, coupon, payload.subtotal, user["id"])
    if err:
        raise HTTPException(400, err)
    applied = _compute_discount(coupon, payload.subtotal)
    return {
        "ok": True,
        "code": coupon["code"],
        "description": coupon.get("description", ""),
        "discount_type": coupon["discount_type"],
        "discount_value": coupon["discount_value"],
        "min_subtotal": coupon.get("min_subtotal", 0),
        **applied,
    }


# ---------- ADMIN ENDPOINTS ----------
def _require_admin(user: dict) -> None:
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin access required.")


class CouponIn(BaseModel):
    code: str = Field(min_length=1, max_length=40)
    description: str = ""
    discount_type: str = Field(pattern="^(percent|fixed|free_shipping)$")
    discount_value: float = 0
    min_subtotal: float = 0
    active: bool = True
    expires_at: Optional[str] = None  # ISO date
    usage_limit: Optional[int] = None
    first_order_only: bool = False


@router.get("/admin/all")
async def admin_list_coupons(user: dict = Depends(get_current_user)):
    _require_admin(user)
    from server import db
    items = await db.coupons.find({}, {"_id": 0}).to_list(500)
    return {"items": items}


@router.post("/admin")
async def admin_create_coupon(payload: CouponIn, user: dict = Depends(get_current_user)):
    _require_admin(user)
    from server import db
    code = payload.code.strip().upper()
    existing = await db.coupons.find_one({"code": code})
    if existing:
        raise HTTPException(400, "A code with that name already exists.")
    doc = payload.model_dump()
    doc["code"] = code
    doc["times_used"] = 0
    await db.coupons.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.patch("/admin/{code}")
async def admin_update_coupon(code: str, payload: CouponIn, user: dict = Depends(get_current_user)):
    _require_admin(user)
    from server import db
    existing = await db.coupons.find_one({"code": code.upper()})
    if not existing:
        raise HTTPException(404, "Coupon not found.")
    updates = payload.model_dump()
    updates["code"] = code.upper()  # don't allow code rename via PATCH
    updates.pop("times_used", None)
    await db.coupons.update_one({"code": code.upper()}, {"$set": updates})
    doc = await db.coupons.find_one({"code": code.upper()}, {"_id": 0})
    return doc


@router.delete("/admin/{code}")
async def admin_delete_coupon(code: str, user: dict = Depends(get_current_user)):
    _require_admin(user)
    from server import db
    res = await db.coupons.delete_one({"code": code.upper()})
    if res.deleted_count == 0:
        raise HTTPException(404, "Coupon not found.")
    return {"ok": True}
