"""Product catalog: seeded products + read endpoints."""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional

router = APIRouter(prefix="/api/products", tags=["products"])

# Seed data — sourced from premierhousewares.com (product names + imagery)
# Pricing set to reflect luxury retail positioning (GBP).
SEED_PRODUCTS = [
    # ---------------- KITCHEN & DINING ----------------
    {
        "id": "elmira-16pc-black-dinner-set",
        "name": "Elmira 16 Piece Black Stoneware Dinner Set",
        "slug": "elmira-16pc-black-dinner-set",
        "category": "Kitchen & Dining",
        "price": 125.00,
        "currency": "GBP",
        "is_new": True,
        "on_sale": False,
        "image": "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/5077/images/200075/0723384__63567.1762346105.386.513.jpg?c=1",
        "gallery": [
            "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/5077/images/200075/0723384__63567.1762346105.386.513.jpg?c=1",
        ],
        "short_description": "Sixteen-piece reactive-glaze stoneware set in a deep matte black — service for four.",
        "description": "A characterful 16-piece stoneware dinner set finished in a quietly luxurious matte black reactive glaze. Each piece is dishwasher and microwave safe — designed for everyday rituals and dinners that linger.",
        "materials": "Reactive-glaze stoneware",
        "dimensions": "Dinner plate Ø 27cm · Side plate Ø 21cm · Bowl Ø 16cm · Mug 350ml",
        "care": "Dishwasher and microwave safe.",
        "colours": ["Black"],
        "in_stock": True,
        "tags": ["dinner set", "kitchen", "dining", "stoneware"],
    },
    {
        "id": "avie-16pc-marble-dinner-set",
        "name": "Avie 16 Piece White & Grey Marble Effect Dinner Set",
        "slug": "avie-16pc-marble-dinner-set",
        "category": "Kitchen & Dining",
        "price": 79.00,
        "original_price": 98.00,
        "currency": "GBP",
        "is_new": False,
        "on_sale": True,
        "image": "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/5104/images/145329/0723415__02969.1754512404.386.513.jpg?c=1",
        "gallery": [
            "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/5104/images/145329/0723415__02969.1754512404.386.513.jpg?c=1",
        ],
        "short_description": "A refined 16-piece dinner set in a soft white and grey marble print.",
        "description": "Veined like the finest Carrara marble yet hardwearing enough for the everyday, the Avie 16-piece set brings quiet sophistication to dining. Service for four with plates, bowls and mugs.",
        "materials": "Porcelain",
        "dimensions": "Dinner plate Ø 26.5cm · Side plate Ø 19cm · Bowl Ø 15cm · Mug 320ml",
        "care": "Dishwasher and microwave safe.",
        "colours": ["Marble"],
        "in_stock": True,
        "tags": ["dinner set", "marble", "tableware"],
    },
    {
        "id": "elmira-12pc-pink-dinner-set",
        "name": "Elmira 12 Piece Pink Stoneware Dinner Set",
        "slug": "elmira-12pc-pink-dinner-set",
        "category": "Kitchen & Dining",
        "price": 105.00,
        "currency": "GBP",
        "is_new": False,
        "on_sale": False,
        "image": "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/5078/images/144164/0723388__89956.1754512146.386.513.jpg?c=1",
        "gallery": [
            "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/5078/images/144164/0723388__89956.1754512146.386.513.jpg?c=1",
        ],
        "short_description": "Twelve-piece stoneware in a soft, dusky pink finish.",
        "description": "Hand-glazed in a quiet, dusky pink — the Elmira pink set adds warmth and ease to any table. Each piece is finished with a subtle reactive shimmer, no two are exactly alike.",
        "materials": "Reactive-glaze stoneware",
        "dimensions": "Service for four — plates, bowls, mugs",
        "care": "Dishwasher and microwave safe.",
        "colours": ["Dusky Pink"],
        "in_stock": True,
        "tags": ["dinner set", "stoneware", "pink"],
    },
    {
        "id": "galene-fluted-grey-glass-bowl",
        "name": "Galene Fluted Grey Glass Pedestal Bowl",
        "slug": "galene-fluted-grey-glass-bowl",
        "category": "Kitchen & Dining",
        "price": 38.00,
        "currency": "GBP",
        "is_new": True,
        "on_sale": False,
        "image": "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/17829/images/212519/5509240__88594.1776184231.386.513.jpg?c=1",
        "gallery": [
            "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/17829/images/212519/5509240__88594.1776184231.386.513.jpg?c=1",
        ],
        "short_description": "A fluted smoke-grey glass pedestal bowl with quiet, sculptural presence.",
        "description": "Mouth-blown and hand-finished, the Galene pedestal bowl plays with light through its softly fluted body. A fruit bowl, a centrepiece, or a quietly elegant catch-all.",
        "materials": "Mouth-blown glass",
        "dimensions": "H 14cm × Ø 24cm",
        "care": "Hand wash only.",
        "colours": ["Smoke Grey"],
        "in_stock": True,
        "tags": ["bowl", "glass", "dining", "decor"],
    },
    {
        "id": "maya-12pc-blue-white-dinner-set",
        "name": "Maya 12 Piece Blue & White Dinner Set",
        "slug": "maya-12pc-blue-white-dinner-set",
        "category": "Kitchen & Dining",
        "price": 92.00,
        "currency": "GBP",
        "is_new": False,
        "on_sale": False,
        "image": "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/4895/images/137441/0723029_1__98877.1767250416.386.513.jpg?c=1",
        "gallery": [
            "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/4895/images/137441/0723029_1__98877.1767250416.386.513.jpg?c=1",
        ],
        "short_description": "A heritage-inspired blue and white dinner set with hand-finished detailing.",
        "description": "A nod to traditional blue and white ceramics, the Maya set blends timeless detail with modern proportions. Twelve pieces — service for four.",
        "materials": "Stoneware",
        "dimensions": "Dinner plate Ø 26.5cm · Side plate Ø 19cm · Bowl Ø 15cm",
        "care": "Dishwasher and microwave safe.",
        "colours": ["Blue & White"],
        "in_stock": True,
        "tags": ["dinner set", "blue", "heritage"],
    },

    # ---------------- HOME LIVING ----------------
    {
        "id": "montreal-boucle-lounge-chair",
        "name": "Montreal Black Bouclé Effect Curved Lounge Chair",
        "slug": "montreal-boucle-lounge-chair",
        "category": "Home Living",
        "price": 620.00,
        "currency": "GBP",
        "is_new": True,
        "on_sale": False,
        "image": "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/3297/images/194591/2406937_01__95556.1758955306.386.513.jpg?c=1",
        "gallery": [
            "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/3297/images/194591/2406937_01__95556.1758955306.386.513.jpg?c=1",
        ],
        "short_description": "Sculptural curved lounge chair upholstered in textured black bouclé with a swivel base.",
        "description": "The Montreal lounge chair pairs a low-slung curved silhouette with a tactile black bouclé fabric and a slim swivel base. A statement piece for considered living rooms and quiet reading corners.",
        "materials": "Bouclé upholstery, hardwood frame, swivel metal base",
        "dimensions": "H 76cm × W 84cm × D 80cm",
        "care": "Vacuum gently with upholstery attachment.",
        "colours": ["Black"],
        "in_stock": True,
        "tags": ["furniture", "chair", "lounge", "bouclé"],
    },
    {
        "id": "winton-travertine-side-table",
        "name": "Winton Travertine Top Side Table",
        "slug": "winton-travertine-side-table",
        "category": "Home Living",
        "price": 295.00,
        "currency": "GBP",
        "is_new": True,
        "on_sale": False,
        "image": "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/17391/images/201474/5529856__52376.1772713449.386.513.jpg?c=1",
        "gallery": [
            "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/17391/images/201474/5529856__52376.1772713449.386.513.jpg?c=1",
        ],
        "short_description": "A sculptural travertine side table on a slim black acacia wood frame.",
        "description": "Hand-cut from a single block of natural travertine and balanced on a fine black acacia wood frame, the Winton side table is a moment of quiet sculpture beside any sofa or bed.",
        "materials": "Travertine, black acacia wood",
        "dimensions": "H 55cm × Ø 40cm",
        "care": "Wipe with damp cloth. Reseal annually.",
        "colours": ["Travertine / Black"],
        "in_stock": True,
        "tags": ["furniture", "side table", "travertine"],
    },
    {
        "id": "lara-black-gold-table-lamp",
        "name": "Lara Black Shade & Gold Finish Table Lamp",
        "slug": "lara-black-gold-table-lamp",
        "category": "Home Living",
        "price": 145.00,
        "currency": "GBP",
        "is_new": True,
        "on_sale": False,
        "image": "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/13032/images/117611/5511750__20392.1754506308.386.513.jpg?c=1",
        "gallery": [
            "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/13032/images/117611/5511750__20392.1754506308.386.513.jpg?c=1",
        ],
        "short_description": "A refined black linen shade table lamp set on a brushed gold metal frame.",
        "description": "An understated tabletop companion combining a deep black linen drum shade with a slim brushed gold frame. The Lara casts a warm, ambient glow — ideal for hallways, bedrooms and sideboards.",
        "materials": "Linen shade, brushed gold-finish metal frame",
        "dimensions": "H 56cm × Ø 30cm",
        "care": "Dust regularly with a soft cloth.",
        "colours": ["Black / Gold"],
        "in_stock": True,
        "tags": ["lighting", "table lamp", "gold"],
    },
    {
        "id": "faye-velvet-chair",
        "name": "Faye Black Velvet Chair",
        "slug": "faye-velvet-chair",
        "category": "Home Living",
        "price": 465.00,
        "original_price": 580.00,
        "currency": "GBP",
        "is_new": False,
        "on_sale": True,
        "image": "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/14662/images/196255/5528841_01__90025.1759131102.386.513.jpg?c=1",
        "gallery": [
            "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/14662/images/196255/5528841_01__90025.1759131102.386.513.jpg?c=1",
        ],
        "short_description": "A deep black velvet accent chair with tapered legs and a sculpted back.",
        "description": "Upholstered in heavyweight black velvet over a hardwood frame, the Faye chair brings tactile depth to corners and bedrooms. Sculpted back, slim tapered legs.",
        "materials": "Velvet upholstery, hardwood frame",
        "dimensions": "H 82cm × W 66cm × D 70cm",
        "care": "Vacuum gently. Avoid direct sunlight.",
        "colours": ["Black"],
        "in_stock": True,
        "tags": ["furniture", "chair", "velvet"],
    },
    {
        "id": "tibor-mango-wood-sculpture",
        "name": "Tibor Black Mango Wood Sculpture with Travertine Base",
        "slug": "tibor-mango-wood-sculpture",
        "category": "Home Living",
        "price": 85.00,
        "currency": "GBP",
        "is_new": True,
        "on_sale": False,
        "image": "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/17384/images/193840/5506970__32677.1758178854.386.513.jpg?c=1",
        "gallery": [
            "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/17384/images/193840/5506970__32677.1758178854.386.513.jpg?c=1",
        ],
        "short_description": "A hand-carved black mango wood sculpture balanced on a travertine base.",
        "description": "An organic, hand-carved silhouette in deep black mango wood, anchored by a chunk of natural travertine. Each piece is one-of-a-kind.",
        "materials": "Mango wood, travertine",
        "dimensions": "H 38cm × W 12cm × D 12cm",
        "care": "Dust regularly. Avoid prolonged moisture.",
        "colours": ["Black / Travertine"],
        "in_stock": True,
        "tags": ["decor", "sculpture", "mango wood"],
    },
    {
        "id": "sanai-cotton-mache-planter",
        "name": "Sanai Cotton Mache Large Black Planter",
        "slug": "sanai-cotton-mache-planter",
        "category": "Home Living",
        "price": 68.00,
        "currency": "GBP",
        "is_new": False,
        "on_sale": False,
        "image": "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/12230/images/195303/5506890_02__94102.1758967286.386.513.jpg?c=1",
        "gallery": [
            "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/12230/images/195303/5506890_02__94102.1758967286.386.513.jpg?c=1",
        ],
        "short_description": "A handmade cotton mache planter in a deep matte black finish.",
        "description": "Hand-shaped from layered cotton mache and finished in a matte black wash, the Sanai planter holds large indoor specimens with quiet drama.",
        "materials": "Cotton mache",
        "dimensions": "H 32cm × Ø 36cm",
        "care": "Wipe with damp cloth. Avoid soaking.",
        "colours": ["Black"],
        "in_stock": True,
        "tags": ["decor", "planter", "indoor"],
    },
    {
        "id": "astratto-textured-wall-art",
        "name": "Astratto Abstract Black & Cream Textured Wall Art",
        "slug": "astratto-textured-wall-art",
        "category": "Home Living",
        "price": 125.00,
        "currency": "GBP",
        "is_new": True,
        "on_sale": False,
        "image": "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/13413/images/136387/5521152__77415.1754510457.386.513.jpg?c=1",
        "gallery": [
            "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/13413/images/136387/5521152__77415.1754510457.386.513.jpg?c=1",
        ],
        "short_description": "An abstract black and cream textured wall canvas — quietly modern.",
        "description": "Hand-finished textured canvas with bold black gestures over a soft cream ground. The Astratto print brings a quietly modern focal point to entryways and living rooms.",
        "materials": "Textured canvas, wooden frame",
        "dimensions": "H 90cm × W 60cm",
        "care": "Dust regularly. Avoid direct sunlight.",
        "colours": ["Black / Cream"],
        "in_stock": True,
        "tags": ["wall art", "decor", "abstract"],
    },
    {
        "id": "imperia-glass-coffee-table",
        "name": "Imperia Round Grey Glass & Ceramic Coffee Table",
        "slug": "imperia-glass-coffee-table",
        "category": "Home Living",
        "price": 265.00,
        "original_price": 325.00,
        "currency": "GBP",
        "is_new": False,
        "on_sale": True,
        "image": "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/14685/images/196393/5528864_01__43398.1759132428.386.513.jpg?c=1",
        "gallery": [
            "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/14685/images/196393/5528864_01__43398.1759132428.386.513.jpg?c=1",
        ],
        "short_description": "A sculptural round coffee table with a smoke-grey glass top on a ceramic pedestal.",
        "description": "The Imperia pairs a rich grey glass top with a hand-finished ceramic pedestal. A sculptural anchor for any living space.",
        "materials": "Tempered glass, ceramic pedestal",
        "dimensions": "H 38cm × Ø 80cm",
        "care": "Wipe with damp cloth. Avoid abrasive cleaners.",
        "colours": ["Smoke Grey"],
        "in_stock": True,
        "tags": ["furniture", "coffee table", "glass"],
    },
]


CATEGORIES = [
    {
        "id": "kitchen-and-dining",
        "name": "Kitchen & Dining",
        "image": "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/5077/images/200075/0723384__63567.1762346105.386.513.jpg?c=1",
    },
    {
        "id": "home-living",
        "name": "Home Living",
        "image": "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/3297/images/194591/2406937_01__95556.1758955306.386.513.jpg?c=1",
    },
    {
        "id": "new-arrivals",
        "name": "New Arrivals",
        "image": "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/17391/images/201474/5529856__52376.1772713449.386.513.jpg?c=1",
        "is_filter": True,
        "filter": "new",
    },
    {
        "id": "sale",
        "name": "Sale",
        "image": "https://cdn11.bigcommerce.com/s-9eixvcjw2b/products/14685/images/196393/5528864_01__43398.1759132428.386.513.jpg?c=1",
        "is_filter": True,
        "filter": "sale",
    },
]


COLLECTIONS = [
    {
        "id": "modern-neutral",
        "name": "The Modern Neutral",
        "subtitle": "Soft tones, sculptural forms, and timeless textures for a calm, considered home.",
        "image": "https://images.unsplash.com/photo-1761330439741-3dcf41ee766b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHw0fHxtaW5pbWFsJTIwbHV4dXJ5JTIwbGl2aW5nJTIwcm9vbSUyMGJlaWdlfGVufDB8fHx8MTc3OTQ4NzU2NHww&ixlib=rb-4.1.0&q=85",
        "product_ids": ["winton-travertine-side-table", "montreal-boucle-lounge-chair", "lara-black-gold-table-lamp", "tibor-mango-wood-sculpture"],
    },
    {
        "id": "warm-minimalist",
        "name": "Warm Minimalist",
        "subtitle": "Pared-back forms warmed by tactile textiles and the soft glow of considered lighting.",
        "image": "https://images.unsplash.com/photo-1768144092684-c1a5dd6c7aad?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwbHV4dXJ5JTIwbGl2aW5nJTIwcm9vbSUyMGJlaWdlfGVufDB8fHx8MTc3OTQ4NzU2NHww&ixlib=rb-4.1.0&q=85",
        "product_ids": ["sanai-cotton-mache-planter", "astratto-textured-wall-art", "galene-fluted-grey-glass-bowl", "lara-black-gold-table-lamp"],
    },
    {
        "id": "contemporary-elegance",
        "name": "Contemporary Elegance",
        "subtitle": "Sculptural lighting, statement furniture, and material richness.",
        "image": "https://images.unsplash.com/photo-1771888703723-01d85da1dae1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwyfHxtaW5pbWFsJTIwbHV4dXJ5JTIwbGl2aW5nJTIwcm9vbSUyMGJlaWdlfGVufDB8fHx8MTc3OTQ4NzU2NHww&ixlib=rb-4.1.0&q=85",
        "product_ids": ["faye-velvet-chair", "imperia-glass-coffee-table", "montreal-boucle-lounge-chair"],
    },
    {
        "id": "the-host-edit",
        "name": "The Host Edit",
        "subtitle": "Curated tableware and dining essentials for hosting in style.",
        "image": "https://images.unsplash.com/photo-1769736436858-65a86b395ef7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjBuZXV0cmFsJTIwYXJtY2hhaXIlMjBzaWRlJTIwdGFibGV8ZW58MHx8fHwxNzc5NDg3NTY0fDA&ixlib=rb-4.1.0&q=85",
        "product_ids": ["elmira-16pc-black-dinner-set", "avie-16pc-marble-dinner-set", "maya-12pc-blue-white-dinner-set", "galene-fluted-grey-glass-bowl"],
    },
]


async def seed_catalog(db):
    """Idempotent seed of products & collections. Replaces existing seed data."""
    # Clear old seed data so renaming/removal of products takes effect
    await db.products.delete_many({})
    await db.collections.delete_many({})
    for p in SEED_PRODUCTS:
        await db.products.insert_one({**p})
    for c in COLLECTIONS:
        await db.collections.insert_one({**c})
    await db.products.create_index("id", unique=True)
    await db.products.create_index("slug")
    await db.products.create_index("category")


@router.get("")
async def list_products(
    category: Optional[str] = None,
    is_new: Optional[bool] = None,
    on_sale: Optional[bool] = None,
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
    if on_sale is not None:
        query["on_sale"] = on_sale
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
        product = await db.products.find_one({"id": slug}, {"_id": 0})
    if not product:
        raise HTTPException(404, "Product not found")
    related = await db.products.find(
        {"category": product["category"], "id": {"$ne": product["id"]}}, {"_id": 0}
    ).to_list(4)
    return {"product": product, "related": related}
