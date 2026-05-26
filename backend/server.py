"""MA Home Interiors — FastAPI backend."""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import asyncio
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

# Mongo
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]


# Abandoned-bag config
ABANDONED_AFTER_MINUTES = int(os.environ.get("ABANDONED_AFTER_MINUTES", "60"))
ABANDONED_SCAN_INTERVAL_SECONDS = int(os.environ.get("ABANDONED_SCAN_INTERVAL_SECONDS", "600"))  # 10 min


async def _abandoned_bag_loop():
    """Periodically scan for unpaid orders older than threshold and email customers."""
    from email_service import send_abandoned_bag_email
    log = logging.getLogger("ma-abandoned")
    while True:
        try:
            await asyncio.sleep(ABANDONED_SCAN_INTERVAL_SECONDS)
            cutoff = (datetime.now(timezone.utc) - timedelta(minutes=ABANDONED_AFTER_MINUTES)).isoformat()
            cursor = db.orders.find({
                "status": "pending_payment",
                "created_at": {"$lt": cutoff},
                "abandoned_email_sent": {"$ne": True},
                "user_email": {"$exists": True, "$ne": None},
            }, {"_id": 0})
            count = 0
            async for order in cursor:
                # Don't re-engage orders that completed via a later webhook
                if order.get("payment_status") == "paid":
                    continue
                await send_abandoned_bag_email(order)
                await db.orders.update_one(
                    {"id": order["id"]},
                    {"$set": {"abandoned_email_sent": True, "abandoned_emailed_at": datetime.now(timezone.utc).isoformat()}},
                )
                count += 1
            if count:
                log.info("Abandoned-bag pass: emailed %d orders", count)
        except asyncio.CancelledError:
            break
        except Exception as e:
            log.warning("Abandoned-bag loop error: %s", e)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    from products import seed_catalog
    from auth import hash_password, verify_password
    import uuid

    await db.users.create_index("email", unique=True)
    await seed_catalog(db)

    # Seed admin + a test customer
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@mahomeinteriors.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin12345")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "first_name": "Admin",
            "last_name": "MA",
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "marketing_opt_in": False,
        })
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    test_email = "customer@mahomeinteriors.com"
    if not await db.users.find_one({"email": test_email}):
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "first_name": "Eleanor",
            "last_name": "Ashford",
            "email": test_email,
            "password_hash": hash_password("customer12345"),
            "role": "customer",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "marketing_opt_in": True,
        })

    # Background tasks
    abandoned_task = asyncio.create_task(_abandoned_bag_loop())

    yield

    abandoned_task.cancel()
    try:
        await abandoned_task
    except asyncio.CancelledError:
        pass
    client.close()


app = FastAPI(lifespan=lifespan, title="MA Home Interiors API")

# Routers
from auth import router as auth_router
from products import router as products_router
from orders import router as orders_router
from payments import router as payments_router

app.include_router(auth_router)
app.include_router(products_router)
app.include_router(orders_router)
app.include_router(payments_router)


@app.get("/api/")
async def root():
    return {"name": "MA Home Interiors API", "status": "ok"}


# CORS
origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("ma-backend")
