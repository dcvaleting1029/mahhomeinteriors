"""MA Home Interiors backend regression tests."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://elegant-home-store-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

CUSTOMER_EMAIL = "customer@mahomeinteriors.com"
CUSTOMER_PASSWORD = "customer12345"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def auth_session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(f"{API}/auth/login", json={"email": CUSTOMER_EMAIL, "password": CUSTOMER_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"auth failed: {r.status_code} {r.text}")
    return s


# ---------- HEALTH ----------
class TestHealth:
    def test_root(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "ok"


# ---------- AUTH ----------
class TestAuth:
    def test_login_seeded_customer(self, session):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": CUSTOMER_EMAIL, "password": CUSTOMER_PASSWORD})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == CUSTOMER_EMAIL
        assert "access_token" in s.cookies

    def test_me_with_cookie(self, auth_session):
        r = auth_session.get(f"{API}/auth/me")
        assert r.status_code == 200
        assert r.json()["email"] == CUSTOMER_EMAIL

    def test_me_without_cookie(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_login_invalid(self, session):
        r = requests.post(f"{API}/auth/login", json={"email": CUSTOMER_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_register_and_logout(self):
        s = requests.Session()
        email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        r = s.post(f"{API}/auth/register", json={
            "first_name": "Test", "last_name": "User",
            "email": email, "password": "password123", "marketing_opt_in": False,
        })
        assert r.status_code == 200, r.text
        assert r.json()["email"] == email
        assert "access_token" in s.cookies
        # me works
        rm = s.get(f"{API}/auth/me")
        assert rm.status_code == 200
        # logout
        rl = s.post(f"{API}/auth/logout")
        assert rl.status_code == 200

    def test_register_duplicate(self):
        r = requests.post(f"{API}/auth/register", json={
            "first_name": "Dup", "last_name": "User",
            "email": CUSTOMER_EMAIL, "password": "password123",
        })
        assert r.status_code == 400

    def test_forgot_password_ok(self):
        r = requests.post(f"{API}/auth/forgot-password", json={"email": "anything@example.com"})
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_change_password_wrong_current(self, auth_session):
        r = auth_session.post(f"{API}/auth/change-password", json={
            "current_password": "wrongpass", "new_password": "newpass123"
        })
        assert r.status_code == 400


# ---------- PRODUCTS ----------
class TestProducts:
    def test_list_products(self, session):
        r = session.get(f"{API}/products")
        assert r.status_code == 200
        data = r.json()
        assert "items" in data
        assert len(data["items"]) >= 10
        p = data["items"][0]
        for k in ("id", "name", "price", "category"):
            assert k in p

    def test_filter_is_new(self, session):
        r = session.get(f"{API}/products", params={"is_new": "true"})
        assert r.status_code == 200
        items = r.json()["items"]
        assert all(p.get("is_new") is True for p in items)
        assert len(items) >= 5

    def test_filter_category(self, session):
        r = session.get(f"{API}/products", params={"category": "Lighting"})
        assert r.status_code == 200
        items = r.json()["items"]
        assert all(p["category"] == "Lighting" for p in items)

    def test_filter_max_price(self, session):
        r = session.get(f"{API}/products", params={"max_price": 100})
        assert r.status_code == 200
        items = r.json()["items"]
        assert all(p["price"] <= 100 for p in items)

    def test_search(self, session):
        r = session.get(f"{API}/products", params={"search": "lamp"})
        assert r.status_code == 200
        assert len(r.json()["items"]) >= 1

    def test_sort_price_asc(self, session):
        r = session.get(f"{API}/products", params={"sort": "price_asc"})
        assert r.status_code == 200
        prices = [p["price"] for p in r.json()["items"]]
        assert prices == sorted(prices)

    def test_categories(self, session):
        r = session.get(f"{API}/products/categories")
        assert r.status_code == 200
        items = r.json()["items"]
        assert len(items) == 5

    def test_collections(self, session):
        r = session.get(f"{API}/products/collections")
        assert r.status_code == 200
        items = r.json()["items"]
        assert len(items) == 4

    def test_collection_detail(self, session):
        r = session.get(f"{API}/products/collections/modern-neutral")
        assert r.status_code == 200
        data = r.json()
        assert data["collection"]["id"] == "modern-neutral"
        assert len(data["products"]) >= 1

    def test_get_product_by_slug(self, session):
        r = session.get(f"{API}/products/luna-table-lamp")
        assert r.status_code == 200
        data = r.json()
        assert data["product"]["id"] == "luna-table-lamp"
        assert isinstance(data["related"], list)

    def test_get_product_not_found(self, session):
        r = session.get(f"{API}/products/nope-xyz")
        assert r.status_code == 404


# ---------- ADDRESSES ----------
class TestAddresses:
    created_id = None

    def test_addr_crud(self, auth_session):
        # CREATE
        payload = {
            "label": "TEST_Home", "first_name": "Test", "last_name": "User",
            "address_line1": "1 Test Lane", "city": "London", "postcode": "SW1A 1AA",
            "country": "United Kingdom", "is_default": True,
        }
        r = auth_session.post(f"{API}/addresses", json=payload)
        assert r.status_code == 200, r.text
        addr = r.json()
        assert addr["address_line1"] == "1 Test Lane"
        addr_id = addr["id"]

        # LIST
        rl = auth_session.get(f"{API}/addresses")
        assert rl.status_code == 200
        assert any(a["id"] == addr_id for a in rl.json()["items"])

        # PATCH
        payload2 = {**payload, "city": "Manchester"}
        rp = auth_session.patch(f"{API}/addresses/{addr_id}", json=payload2)
        assert rp.status_code == 200
        assert rp.json()["city"] == "Manchester"

        # DELETE
        rd = auth_session.delete(f"{API}/addresses/{addr_id}")
        assert rd.status_code == 200

        # 404 after delete
        rd2 = auth_session.delete(f"{API}/addresses/{addr_id}")
        assert rd2.status_code == 404

    def test_addresses_requires_auth(self):
        r = requests.get(f"{API}/addresses")
        assert r.status_code == 401


# ---------- WISHLIST ----------
class TestWishlist:
    def test_wishlist_flow(self, auth_session):
        # add
        r = auth_session.post(f"{API}/wishlist", json={"product_id": "luna-table-lamp"})
        assert r.status_code == 200
        # idempotent add
        r2 = auth_session.post(f"{API}/wishlist", json={"product_id": "luna-table-lamp"})
        assert r2.status_code == 200
        # list contains the product
        rl = auth_session.get(f"{API}/wishlist")
        assert rl.status_code == 200
        ids = [p["id"] for p in rl.json()["items"]]
        assert "luna-table-lamp" in ids
        # remove
        rd = auth_session.delete(f"{API}/wishlist/luna-table-lamp")
        assert rd.status_code == 200
        # confirm removed
        rl2 = auth_session.get(f"{API}/wishlist")
        assert "luna-table-lamp" not in [p["id"] for p in rl2.json()["items"]]


# ---------- ORDERS ----------
class TestOrders:
    def test_orders_list_requires_auth(self):
        r = requests.get(f"{API}/orders")
        assert r.status_code == 401

    def test_orders_list_empty_ok(self, auth_session):
        r = auth_session.get(f"{API}/orders")
        assert r.status_code == 200
        assert isinstance(r.json()["items"], list)

    def test_order_not_found(self, auth_session):
        r = auth_session.get(f"{API}/orders/non-existent-id")
        assert r.status_code == 404


# ---------- CHECKOUT (Stripe) ----------
class TestCheckout:
    def test_create_session_guest(self):
        s = requests.Session()
        r = s.post(f"{API}/checkout/session", json={
            "items": [{"product_id": "luna-table-lamp", "quantity": 1}],
            "shipping_method": "standard",
            "origin_url": "https://elegant-home-store-1.preview.emergentagent.com",
            "contact_email": "guest@example.com",
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert "url" in data and data["url"].startswith("http")
        assert "session_id" in data
        # backend computed total = 145 + 4.99 shipping (under £100 threshold? no, 145>=100 so free)
        assert data["subtotal"] == 145.0
        assert data["shipping_cost"] == 0.0
        assert data["total"] == 145.0
        # session status
        sid = data["session_id"]
        rs = s.get(f"{API}/checkout/status/{sid}")
        assert rs.status_code == 200
        sd = rs.json()
        assert "payment_status" in sd
        assert "status" in sd

    def test_shipping_under_threshold(self):
        # candle £28 < £100 threshold → shipping £4.99
        r = requests.post(f"{API}/checkout/session", json={
            "items": [{"product_id": "amber-scented-candle", "quantity": 1}],
            "shipping_method": "standard",
            "origin_url": "https://elegant-home-store-1.preview.emergentagent.com",
            "contact_email": "guest@example.com",
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["subtotal"] == 28.0
        assert data["shipping_cost"] == 4.99
        assert data["total"] == 32.99

    def test_express_shipping(self):
        r = requests.post(f"{API}/checkout/session", json={
            "items": [{"product_id": "amber-scented-candle", "quantity": 1}],
            "shipping_method": "express",
            "origin_url": "https://elegant-home-store-1.preview.emergentagent.com",
            "contact_email": "guest@example.com",
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["shipping_cost"] == 6.99

    def test_invalid_product(self):
        r = requests.post(f"{API}/checkout/session", json={
            "items": [{"product_id": "non-existent", "quantity": 1}],
            "shipping_method": "standard",
            "origin_url": "https://elegant-home-store-1.preview.emergentagent.com",
            "contact_email": "g@example.com",
        })
        assert r.status_code == 400

    def test_empty_cart(self):
        r = requests.post(f"{API}/checkout/session", json={
            "items": [], "shipping_method": "standard",
            "origin_url": "https://x.example.com", "contact_email": "g@example.com",
        })
        assert r.status_code == 400
