"""Product catalog: seeded products + read endpoints."""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime, timezone

router = APIRouter(prefix="/api/products", tags=["products"])

# Seed data — luxury home interiors catalog
SEED_PRODUCTS = [
    {
        "id": "luna-table-lamp",
        "name": "Luna Table Lamp",
        "slug": "luna-table-lamp",
        "category": "Lighting",
        "price": 145.00,
        "currency": "GBP",
        "badge": "NEW",
        "is_new": True,
        "image": "https://images.unsplash.com/photo-1667312939978-64cf31718a6e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwaG9tZSUyMGRlY29yJTIwb2JqZWN0cyUyMG5ldXRyYWx8ZW58MHx8fHwxNzc5NDg3NTY0fDA&ixlib=rb-4.1.0&q=85",
        "gallery": [
            "https://images.unsplash.com/photo-1667312939978-64cf31718a6e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwaG9tZSUyMGRlY29yJTIwb2JqZWN0cyUyMG5ldXRyYWx8ZW58MHx8fHwxNzc5NDg3NTY0fDA&ixlib=rb-4.1.0&q=85",
            "https://images.unsplash.com/photo-1630330600342-c7c69cb08472?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwzfHxtaW5pbWFsaXN0JTIwaG9tZSUyMGRlY29yJTIwb2JqZWN0cyUyMG5ldXRyYWx8ZW58MHx8fHwxNzc5NDg3NTY0fDA&ixlib=rb-4.1.0&q=85",
        ],
        "short_description": "A softly curved bedside companion in matte ceramic with a warm linen shade.",
        "description": "The Luna Table Lamp pairs hand-thrown ceramic with a sculpted linen shade for a quietly luminous glow. Designed in our studio and finished by hand, each piece carries a subtle warmth that complements timeless interiors.",
        "materials": "Ceramic body, linen shade, brass fittings",
        "dimensions": "H 44cm × W 28cm × D 28cm",
        "care": "Wipe with a soft, dry cloth. Avoid abrasive cleaners.",
        "colours": ["Bone", "Sand", "Charcoal"],
        "in_stock": True,
        "tags": ["lighting", "bedroom", "living room"],
    },
    {
        "id": "nola-glass-pendant",
        "name": "Nola Glass Pendant Light",
        "slug": "nola-glass-pendant",
        "category": "Lighting",
        "price": 175.00,
        "currency": "GBP",
        "badge": "NEW",
        "is_new": True,
        "image": "https://images.pexels.com/photos/6207817/pexels-photo-6207817.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "gallery": ["https://images.pexels.com/photos/6207817/pexels-photo-6207817.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"],
        "short_description": "Mouth-blown smoked glass pendant with antique brass detail.",
        "description": "Mouth-blown by master glassmakers, the Nola Pendant casts a soft amber light through hand-tinted smoked glass. The antique brass canopy adds a quiet luxury to dining rooms and hallways.",
        "materials": "Mouth-blown smoked glass, antique brass",
        "dimensions": "H 32cm × Ø 24cm",
        "care": "Dust regularly. Clean glass with non-abrasive cloth.",
        "colours": ["Smoke", "Amber"],
        "in_stock": True,
        "tags": ["lighting", "pendant", "dining"],
    },
    {
        "id": "natura-coffee-table",
        "name": "Natura Coffee Table",
        "slug": "natura-coffee-table",
        "category": "Furniture",
        "price": 425.00,
        "currency": "GBP",
        "badge": "NEW",
        "is_new": True,
        "image": "https://images.unsplash.com/photo-1667400104789-f50a4cb393cf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHw0fHxtaW5pbWFsaXN0JTIwaG9tZSUyMGRlY29yJTIwb2JqZWN0cyUyMG5ldXRyYWx8ZW58MHx8fHwxNzc5NDg3NTY0fDA&ixlib=rb-4.1.0&q=85",
        "gallery": [
            "https://images.unsplash.com/photo-1667400104789-f50a4cb393cf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHw0fHxtaW5pbWFsaXN0JTIwaG9tZSUyMGRlY29yJTIwb2JqZWN0cyUyMG5ldXRyYWx8ZW58MHx8fHwxNzc5NDg3NTY0fDA&ixlib=rb-4.1.0&q=85",
            "https://images.pexels.com/photos/35110892/pexels-photo-35110892.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        ],
        "short_description": "Sculptural travertine coffee table with hand-rounded edges.",
        "description": "Carved from a single block of Italian travertine, the Natura Coffee Table balances heft with grace. Each piece is one-of-a-kind: the natural veining and warm tone make this a quiet centrepiece for considered living rooms.",
        "materials": "Solid Italian travertine, natural sealant",
        "dimensions": "H 36cm × W 120cm × D 70cm",
        "care": "Wipe with damp cloth. Reseal annually.",
        "colours": ["Cream Travertine"],
        "in_stock": True,
        "tags": ["furniture", "living room", "coffee table"],
    },
    {
        "id": "linen-cushion-cover",
        "name": "Linen Cushion Cover",
        "slug": "linen-cushion-cover",
        "category": "Textiles",
        "price": 42.00,
        "currency": "GBP",
        "badge": "NEW",
        "is_new": True,
        "image": "https://images.unsplash.com/photo-1579656592043-a20e25a4aa4b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBuZXV0cmFsJTIwYXJtY2hhaXIlMjBzaWRlJTIwdGFibGV8ZW58MHx8fHwxNzc5NDg3NTY0fDA&ixlib=rb-4.1.0&q=85",
        "gallery": ["https://images.unsplash.com/photo-1579656592043-a20e25a4aa4b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBuZXV0cmFsJTIwYXJtY2hhaXIlMjBzaWRlJTIwdGFibGV8ZW58MHx8fHwxNzc5NDg3NTY0fDA&ixlib=rb-4.1.0&q=85"],
        "short_description": "Stonewashed pure linen, finished with a hidden seam.",
        "description": "Cut from heavyweight European linen and stonewashed for a softened drape, the Linen Cushion Cover layers beautifully on sofas and beds. Hidden zip closure; insert sold separately.",
        "materials": "100% European linen",
        "dimensions": "50cm × 50cm",
        "care": "Machine wash cold, line dry.",
        "colours": ["Oat", "Clay", "Pebble", "Ivory"],
        "in_stock": True,
        "tags": ["textiles", "cushion", "sofa"],
    },
    {
        "id": "amber-scented-candle",
        "name": "Amber Scented Candle",
        "slug": "amber-scented-candle",
        "category": "Candles & Fragrance",
        "price": 28.00,
        "currency": "GBP",
        "badge": "NEW",
        "is_new": True,
        "image": "https://images.unsplash.com/photo-1630330600342-c7c69cb08472?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwzfHxtaW5pbWFsaXN0JTIwaG9tZSUyMGRlY29yJTIwb2JqZWN0cyUyMG5ldXRyYWx8ZW58MHx8fHwxNzc5NDg3NTY0fDA&ixlib=rb-4.1.0&q=85",
        "gallery": ["https://images.unsplash.com/photo-1630330600342-c7c69cb08472?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwzfHxtaW5pbWFsaXN0JTIwaG9tZSUyMGRlY29yJTIwb2JqZWN0cyUyMG5ldXRyYWx8ZW58MHx8fHwxNzc5NDg3NTY0fDA&ixlib=rb-4.1.0&q=85"],
        "short_description": "Hand-poured soy wax with notes of amber, cedar and vetiver.",
        "description": "A slow-burning soy wax candle housed in a hand-blown frosted vessel. Notes of amber resin, cedarwood and vetiver create a warm, grounding atmosphere — 48 hour burn time.",
        "materials": "Soy wax, cotton wick, glass vessel",
        "dimensions": "H 9cm × Ø 8cm — 220g",
        "care": "Trim wick to 5mm before each lighting.",
        "colours": ["Amber"],
        "in_stock": True,
        "tags": ["candles", "fragrance", "gift"],
    },
    {
        "id": "alba-ceramic-vase",
        "name": "Alba Ceramic Vase",
        "slug": "alba-ceramic-vase",
        "category": "Decor & Accessories",
        "price": 58.00,
        "currency": "GBP",
        "image": "https://images.unsplash.com/photo-1667312939934-60fc3bfa4ec0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwyfHxtaW5pbWFsaXN0JTIwaG9tZSUyMGRlY29yJTIwb2JqZWN0cyUyMG5ldXRyYWx8ZW58MHx8fHwxNzc5NDg3NTY0fDA&ixlib=rb-4.1.0&q=85",
        "gallery": ["https://images.unsplash.com/photo-1667312939934-60fc3bfa4ec0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwyfHxtaW5pbWFsaXN0JTIwaG9tZSUyMGRlY29yJTIwb2JqZWN0cyUyMG5ldXRyYWx8ZW58MHx8fHwxNzc5NDg3NTY0fDA&ixlib=rb-4.1.0&q=85"],
        "short_description": "Wheel-thrown ceramic vase with a matte chalk glaze.",
        "description": "An elegant tall vase wheel-thrown by hand, finished in a matte chalk glaze. The understated form holds dried branches and single stems with equal poise.",
        "materials": "Stoneware ceramic",
        "dimensions": "H 32cm × Ø 14cm",
        "care": "Hand wash only.",
        "colours": ["Chalk", "Sand"],
        "is_new": False,
        "in_stock": True,
        "tags": ["decor", "vase"],
    },
    {
        "id": "marlow-boucle-armchair",
        "name": "Marlow Bouclé Armchair",
        "slug": "marlow-boucle-armchair",
        "category": "Furniture",
        "price": 620.00,
        "currency": "GBP",
        "image": "https://images.unsplash.com/photo-1761330439771-c6a291fad061?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBuZXV0cmFsJTIwYXJtY2hhaXIlMjBzaWRlJTIwdGFibGV8ZW58MHx8fHwxNzc5NDg3NTY0fDA&ixlib=rb-4.1.0&q=85",
        "gallery": ["https://images.unsplash.com/photo-1761330439771-c6a291fad061?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBuZXV0cmFsJTIwYXJtY2hhaXIlMjBzaWRlJTIwdGFibGV8ZW58MHx8fHwxNzc5NDg3NTY0fDA&ixlib=rb-4.1.0&q=85"],
        "short_description": "Sculptural lounge chair upholstered in textured ivory bouclé.",
        "description": "A deep, inviting armchair upholstered in a textured bouclé fabric over a hardwood frame. The Marlow brings tactile softness to studies and reading corners.",
        "materials": "Bouclé upholstery, hardwood frame, foam fill",
        "dimensions": "H 78cm × W 84cm × D 82cm",
        "care": "Vacuum gently with upholstery attachment.",
        "colours": ["Ivory", "Oat"],
        "is_new": False,
        "in_stock": True,
        "tags": ["furniture", "armchair"],
    },
    {
        "id": "travertine-side-table",
        "name": "Travertine Side Table",
        "slug": "travertine-side-table",
        "category": "Furniture",
        "price": 295.00,
        "currency": "GBP",
        "image": "https://images.pexels.com/photos/35110892/pexels-photo-35110892.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "gallery": ["https://images.pexels.com/photos/35110892/pexels-photo-35110892.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"],
        "short_description": "A pedestal side table in solid travertine.",
        "description": "Hand-cut from a single block of travertine, this pedestal side table makes a sculptural moment beside any sofa or bed. Each piece reveals unique veining.",
        "materials": "Solid travertine",
        "dimensions": "H 50cm × Ø 40cm",
        "care": "Wipe with damp cloth. Reseal annually.",
        "colours": ["Cream Travertine"],
        "is_new": False,
        "in_stock": True,
        "tags": ["furniture", "side table"],
    },
    {
        "id": "stonewashed-throw",
        "name": "Stonewashed Throw",
        "slug": "stonewashed-throw",
        "category": "Textiles",
        "price": 75.00,
        "currency": "GBP",
        "image": "https://images.unsplash.com/photo-1774477178005-bff823e43be8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHw0fHxtb2Rlcm4lMjBuZXV0cmFsJTIwYXJtY2hhaXIlMjBzaWRlJTIwdGFibGV8ZW58MHx8fHwxNzc5NDg3NTY0fDA&ixlib=rb-4.1.0&q=85",
        "gallery": ["https://images.unsplash.com/photo-1774477178005-bff823e43be8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHw0fHxtb2Rlcm4lMjBuZXV0cmFsJTIwYXJtY2hhaXIlMjBzaWRlJTIwdGFibGV8ZW58MHx8fHwxNzc5NDg3NTY0fDA&ixlib=rb-4.1.0&q=85"],
        "short_description": "Stonewashed cotton throw with fringed edges.",
        "description": "Woven from soft brushed cotton and stonewashed for a lived-in feel, this throw lends warmth to sofas and beds. Hand-knotted fringe.",
        "materials": "100% brushed cotton",
        "dimensions": "130cm × 180cm",
        "care": "Machine wash cold.",
        "colours": ["Oat", "Clay", "Stone"],
        "is_new": False,
        "in_stock": True,
        "tags": ["textiles", "throw"],
    },
    {
        "id": "matte-dinner-plate-set",
        "name": "Matte Dinner Plate Set",
        "slug": "matte-dinner-plate-set",
        "category": "Tableware",
        "price": 89.00,
        "currency": "GBP",
        "image": "https://images.unsplash.com/photo-1632996547902-064471618ef0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHwyfHxjZXJhbWljJTIwdGFibGV3YXJlJTIwbGluZW4lMjBuZXV0cmFsfGVufDB8fHx8MTc3OTQ4NzU2NXww&ixlib=rb-4.1.0&q=85",
        "gallery": ["https://images.unsplash.com/photo-1632996547902-064471618ef0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHwyfHxjZXJhbWljJTIwdGFibGV3YXJlJTIwbGluZW4lMjBuZXV0cmFsfGVufDB8fHx8MTc3OTQ4NzU2NXww&ixlib=rb-4.1.0&q=85"],
        "short_description": "Set of four matte stoneware dinner plates.",
        "description": "A set of four hand-finished stoneware dinner plates in a soft matte glaze. The slightly uneven rim lends each plate a quietly artisanal feel.",
        "materials": "Stoneware",
        "dimensions": "Ø 27cm — set of 4",
        "care": "Dishwasher and microwave safe.",
        "colours": ["Bone", "Clay"],
        "is_new": False,
        "in_stock": True,
        "tags": ["tableware", "dining"],
    },
]


CATEGORIES = [
    {"id": "furniture", "name": "Furniture", "image": "https://images.unsplash.com/photo-1768144092684-c1a5dd6c7aad?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwbHV4dXJ5JTIwbGl2aW5nJTIwcm9vbSUyMGJlaWdlfGVufDB8fHx8MTc3OTQ4NzU2NHww&ixlib=rb-4.1.0&q=85"},
    {"id": "decor", "name": "Decor & Accessories", "image": "https://images.unsplash.com/photo-1667312939934-60fc3bfa4ec0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwyfHxtaW5pbWFsaXN0JTIwaG9tZSUyMGRlY29yJTIwb2JqZWN0cyUyMG5ldXRyYWx8ZW58MHx8fHwxNzc5NDg3NTY0fDA&ixlib=rb-4.1.0&q=85"},
    {"id": "tableware", "name": "Tableware", "image": "https://images.unsplash.com/photo-1770731206301-43a9683f3438?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHw0fHxjZXJhbWljJTIwdGFibGV3YXJlJTIwbGluZW4lMjBuZXV0cmFsfGVufDB8fHx8MTc3OTQ4NzU2NXww&ixlib=rb-4.1.0&q=85"},
    {"id": "candles", "name": "Candles & Fragrance", "image": "https://images.unsplash.com/photo-1667312939978-64cf31718a6e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwaG9tZSUyMGRlY29yJTIwb2JqZWN0cyUyMG5ldXRyYWx8ZW58MHx8fHwxNzc5NDg3NTY0fDA&ixlib=rb-4.1.0&q=85"},
    {"id": "textiles", "name": "Textiles & Soft Furnishings", "image": "https://images.unsplash.com/photo-1579656592043-a20e25a4aa4b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBuZXV0cmFsJTIwYXJtY2hhaXIlMjBzaWRlJTIwdGFibGV8ZW58MHx8fHwxNzc5NDg3NTY0fDA&ixlib=rb-4.1.0&q=85"},
]


COLLECTIONS = [
    {
        "id": "modern-neutral",
        "name": "The Modern Neutral",
        "subtitle": "Soft tones, sculptural forms, and timeless textures for a calm, considered home.",
        "image": "https://images.unsplash.com/photo-1761330439741-3dcf41ee766b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHw0fHxtaW5pbWFsJTIwbHV4dXJ5JTIwbGl2aW5nJTIwcm9vbSUyMGJlaWdlfGVufDB8fHx8MTc3OTQ4NzU2NHww&ixlib=rb-4.1.0&q=85",
        "product_ids": ["natura-coffee-table", "marlow-boucle-armchair", "linen-cushion-cover", "stonewashed-throw", "luna-table-lamp"],
    },
    {
        "id": "warm-minimalist",
        "name": "Warm Minimalist",
        "subtitle": "Pared-back forms warmed by tactile textiles and the soft glow of considered lighting.",
        "image": "https://images.unsplash.com/photo-1768144092684-c1a5dd6c7aad?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwbHV4dXJ5JTIwbGl2aW5nJTIwcm9vbSUyMGJlaWdlfGVufDB8fHx8MTc3OTQ4NzU2NHww&ixlib=rb-4.1.0&q=85",
        "product_ids": ["alba-ceramic-vase", "amber-scented-candle", "travertine-side-table", "matte-dinner-plate-set"],
    },
    {
        "id": "contemporary-elegance",
        "name": "Contemporary Elegance",
        "subtitle": "Sculptural lighting, statement furniture, and material richness.",
        "image": "https://images.unsplash.com/photo-1771888703723-01d85da1dae1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwyfHxtaW5pbWFsJTIwbHV4dXJ5JTIwbGl2aW5nJTIwcm9vbSUyMGJlaWdlfGVufDB8fHx8MTc3OTQ4NzU2NHww&ixlib=rb-4.1.0&q=85",
        "product_ids": ["nola-glass-pendant", "marlow-boucle-armchair", "natura-coffee-table"],
    },
    {
        "id": "layered-comfort",
        "name": "Layered Comfort",
        "subtitle": "Soft textures piled high — for an embrace of warmth in any room.",
        "image": "https://images.unsplash.com/photo-1769736436858-65a86b395ef7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjBuZXV0cmFsJTIwYXJtY2hhaXIlMjBzaWRlJTIwdGFibGV8ZW58MHx8fHwxNzc5NDg3NTY0fDA&ixlib=rb-4.1.0&q=85",
        "product_ids": ["stonewashed-throw", "linen-cushion-cover", "luna-table-lamp", "amber-scented-candle"],
    },
]


async def seed_catalog(db):
    """Idempotent seed of products & collections."""
    for p in SEED_PRODUCTS:
        await db.products.update_one({"id": p["id"]}, {"$set": p}, upsert=True)
    for c in COLLECTIONS:
        await db.collections.update_one({"id": c["id"]}, {"$set": c}, upsert=True)
    await db.products.create_index("id", unique=True)
    await db.products.create_index("slug")
    await db.products.create_index("category")


@router.get("")
async def list_products(
    category: Optional[str] = None,
    is_new: Optional[bool] = None,
    sort: Optional[str] = Query(None, regex="^(price_asc|price_desc|newest|featured)$"),
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    limit: int = 60,
):
    from server import db
    query: dict = {}
    if category and category != "All":
        query["category"] = category
    if is_new is not None:
        query["is_new"] = is_new
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}},
        ]
    if min_price is not None or max_price is not None:
        pr: dict = {}
        if min_price is not None:
            pr["$gte"] = min_price
        if max_price is not None:
            pr["$lte"] = max_price
        query["price"] = pr

    cursor = db.products.find(query, {"_id": 0})
    if sort == "price_asc":
        cursor = cursor.sort("price", 1)
    elif sort == "price_desc":
        cursor = cursor.sort("price", -1)
    elif sort == "newest":
        cursor = cursor.sort("is_new", -1)
    items = await cursor.to_list(limit)
    return {"items": items, "total": len(items)}


@router.get("/categories")
async def list_categories():
    return {"items": CATEGORIES}


@router.get("/collections")
async def list_collections():
    from server import db
    items = await db.collections.find({}, {"_id": 0}).to_list(20)
    return {"items": items}


@router.get("/collections/{collection_id}")
async def get_collection(collection_id: str):
    from server import db
    col = await db.collections.find_one({"id": collection_id}, {"_id": 0})
    if not col:
        raise HTTPException(404, "Collection not found")
    products = await db.products.find({"id": {"$in": col.get("product_ids", [])}}, {"_id": 0}).to_list(50)
    return {"collection": col, "products": products}


@router.get("/{slug}")
async def get_product(slug: str):
    from server import db
    product = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not product:
        # try by id
        product = await db.products.find_one({"id": slug}, {"_id": 0})
    if not product:
        raise HTTPException(404, "Product not found")
    # related
    related = await db.products.find(
        {"category": product["category"], "id": {"$ne": product["id"]}}, {"_id": 0}
    ).to_list(4)
    return {"product": product, "related": related}
