# MA Home Interiors — PRD

## Problem statement (user provided)
Build a complete luxury e-commerce website for a home interiors brand called MA Home Interiors / LIORA Home Interiors. The homepage should match the supplied white-background editorial reference. Build matching product, collection, cart, checkout, customer account, login, signup and dashboard pages. Use elegant serif headings + clean sans body, locked palette (white/beige/gold/dark), refined product photography. Implement product/cart/wishlist/checkout/auth/order flows. Production-quality, ready to connect to real products/payments.

## User-confirmed choices
- Brand: MA Home Interiors (gold MA monogram + name)
- Auth: Custom JWT email/password
- Payments: Stripe test mode
- Imagery: Curated Unsplash/Pexels
- Scope: Prioritize Homepage + Shop + PDP + Cart + Checkout + Auth + Dashboard with high polish

## Architecture
- Frontend: React 19 + react-router-dom + Tailwind + shadcn/ui (Accordion, Toaster)
- Backend: FastAPI + Motor (MongoDB) + bcrypt + PyJWT + emergentintegrations StripeCheckout
- Database: MongoDB via MONGO_URL/DB_NAME env vars
- Auth: JWT in httpOnly cookies (samesite=none, secure, withCredentials axios)
- Payments: Stripe-hosted checkout (sk_test_emergent) with server-side price computation, webhook + polling
- Fonts: Cormorant Garamond (serif headings) + Manrope (sans body)
- Palette: locked to user values (#FFFFFF, #F7F3EC, #EAE1D4, #C8B79F, #C9983F, #111111, #6F6A63, #E5DED3)

## Personas
- Browsing visitor → no auth needed, can browse, add to cart, checkout as guest
- Registered customer → JWT-protected dashboard with orders, wishlist, addresses, profile/password

## What's implemented (2026-02 v1)
- Homepage with hero ("Beautiful Spaces. Designed for You."), benefits bar, 5 category cards, NEW IN carousel, Why Choose + Trustpilot card, Shop the Look (4 looks), newsletter strip, rich footer + payment marks
- Shop page with sidebar filters (Category, Price, Colour, Material, Availability), sort, product grid + mobile filter drawer
- Collections list page + Collection detail page
- Product detail page with gallery + thumbnails, colour selector, qty, Add to Cart, Buy It Now, accordion (Description/Dimensions/Materials & Care/Delivery & Returns), related products
- Cart drawer (slide from right) + Cart page (with discount field placeholder)
- Multi-step Checkout (Contact → Delivery → Payment → Review) with Stripe test-mode redirect
- Payment Success page (polls /api/checkout/status with retry/backoff, clears cart on paid) + Payment Failed page
- Auth pages: Login (split-screen with image, remember me, prefilled test creds), Signup (with confirm + marketing + terms), Forgot Password
- Customer Dashboard with sidebar nav: Overview, Orders, Order detail with timeline, Wishlist, Addresses (full CRUD), Account Details (profile + password)
- Wishlist (localStorage-backed; heart on cards + PDP)
- Sticky blurred header on scroll, mobile hamburger drawer
- 10 seeded products (Luna Lamp, Nola Pendant, Natura Coffee Table, Linen Cushion, Amber Candle, Alba Vase, Marlow Armchair, Travertine Side Table, Stonewashed Throw, Matte Plate Set), 5 categories, 4 collections, admin + customer test users (idempotent seed)
- Backend tests pass 30/31 (97%); Stripe status endpoint hardened with retry + soft-pending fallback

## Backlog
### P1 (next polish)
- Journal page + About page (deferred)
- Quick-view modal on product cards
- Wishlist sync to backend for logged-in users (currently localStorage only)
- Order email notifications (Resend/SendGrid)
- Product search results page improvements (faceting)
### P2 (future)
- Admin product CRUD UI
- Sets / bundles page (deferred per scope)
- Trade Program form
- Reviews submission flow
- True i18n / multi-currency

## Known limitations
- emergentintegrations Stripe proxy occasionally cannot retrieve a session immediately after creation; frontend polls gracefully and webhook still finalizes orders on real payment completion.
