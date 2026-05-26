"""Coupon codes — seed + validation + checkout application."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

router = APIRouter(prefix="/api/coupons", tags=["coupons"])


# Seed catalog of valid codes (case-insensitive). Idempotent on startup.
SEED_COUPONS = [
    {
        "code": "WELCOME10",
        "description": "10% off your first order",
        "discount_type": "percent",
        "discount_value": 10,
        "min_subtotal": 0,
        "active": True,
    },
    {
        "code": "SAVE20",
        "description": "20% off orders over £200",
        "discount_type": "percent",
        "discount_value": 20,
        "min_subtotal": 200,
        "active": True,
    },
    {
        "code": "FREESHIP",
        "description": "Free shipping on any order",
        "discount_type": "free_shipping",
        "discount_value": 0,
        "min_subtotal": 0,
        "active": True,
    },
]


async def seed_coupons(db):
    """Idempotent seed of coupon codes."""
    for c in SEED_COUPONS:
        await db.coupons.update_one(
            {"code": c["code"]},
            {"$set": c},
            upsert=True,
        )
    await db.coupons.create_index("code", unique=True)


class ValidateIn(BaseModel):
    code: str = Field(min_length=1, max_length=40)
    subtotal: float = Field(ge=0)


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


async def lookup_and_apply(db, code: Optional[str], subtotal: float) -> Optional[dict]:
    """Look up coupon by code, validate, and return application details. Returns None if invalid."""
    if not code:
        return None
    coupon = await db.coupons.find_one({"code": code.strip().upper(), "active": True}, {"_id": 0})
    if not coupon:
        return None
    if subtotal < float(coupon.get("min_subtotal", 0)):
        return None
    applied = _compute_discount(coupon, subtotal)
    return {
        "code": coupon["code"],
        "description": coupon.get("description", ""),
        "discount_type": coupon["discount_type"],
        "discount_value": coupon["discount_value"],
        **applied,
    }


@router.post("/validate")
async def validate_coupon(payload: ValidateIn):
    from server import db
    code = payload.code.strip().upper()
    coupon = await db.coupons.find_one({"code": code, "active": True}, {"_id": 0})
    if not coupon:
        raise HTTPException(400, "That code isn't valid.")
    if payload.subtotal < float(coupon.get("min_subtotal", 0)):
        raise HTTPException(400, f"Spend over £{coupon['min_subtotal']:.0f} to use this code.")
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
