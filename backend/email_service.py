"""Order confirmation emails via Resend."""
import os
import logging
import asyncio
import resend

logger = logging.getLogger("ma-email")

_BRAND_GOLD = "#C9983F"
_BRAND_TEXT = "#111111"
_BRAND_MUTED = "#6F6A63"
_BRAND_BORDER = "#E5DED3"
_BRAND_WARM = "#F7F3EC"


def _gbp(value: float) -> str:
    try:
        return f"£{float(value):.2f}"
    except Exception:
        return f"£{value}"


def _build_html(order: dict) -> str:
    order_id_short = (order.get("id") or "")[:8].upper()
    items_rows = ""
    for it in order.get("items", []):
        items_rows += f"""
        <tr>
            <td style="padding:14px 0;border-bottom:1px solid {_BRAND_BORDER};vertical-align:top;width:72px">
                <img src="{it.get('image','')}" alt="" width="60" style="display:block;width:60px;height:72px;object-fit:cover;background:{_BRAND_WARM}">
            </td>
            <td style="padding:14px 12px;border-bottom:1px solid {_BRAND_BORDER};vertical-align:top">
                <div style="font-family:Georgia,serif;font-size:16px;color:{_BRAND_TEXT};line-height:1.3">{it.get('name','')}</div>
                <div style="font-size:12px;color:{_BRAND_MUTED};margin-top:4px">Qty {it.get('quantity',1)} · {_gbp(it.get('price',0))}</div>
            </td>
            <td style="padding:14px 0;border-bottom:1px solid {_BRAND_BORDER};vertical-align:top;text-align:right;font-size:14px;color:{_BRAND_TEXT};white-space:nowrap">
                {_gbp(it.get('line_total', it.get('price',0) * it.get('quantity',1)))}
            </td>
        </tr>
        """

    address = order.get("address") or {}
    addr_html = ""
    if address:
        line2 = address.get("address_line2") or ""
        addr_html = f"""
        <div style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:{_BRAND_MUTED};line-height:1.6">
            {address.get('first_name','')} {address.get('last_name','')}<br>
            {address.get('address_line1','')}{(' ' + line2) if line2 else ''}<br>
            {address.get('city','')}, {address.get('postcode','')}<br>
            {address.get('country','United Kingdom')}
        </div>
        """

    shipping_cost = order.get("shipping_cost", 0) or 0
    shipping_label = "Free" if shipping_cost == 0 else _gbp(shipping_cost)

    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Your MA Home Interiors Order</title></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:Helvetica,Arial,sans-serif">
  <div style="max-width:620px;margin:0 auto;background:#ffffff">
    <div style="text-align:center;padding:36px 24px 0;background:#ffffff">
      <div style="display:inline-block;width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,#D9A94B 0%,{_BRAND_GOLD} 50%,#A87E2C 100%);color:#fff;font-family:Georgia,serif;font-style:italic;font-size:24px;line-height:54px;font-weight:600">MA</div>
      <div style="font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.22em;color:{_BRAND_MUTED};margin-top:10px;text-transform:uppercase">MA Home Interiors</div>
    </div>

    <div style="padding:36px 36px 8px;text-align:center">
      <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.22em;color:{_BRAND_GOLD};text-transform:uppercase">Order Confirmed</div>
      <h1 style="font-family:Georgia,serif;font-weight:500;font-size:36px;color:{_BRAND_TEXT};margin:14px 0 8px;line-height:1.1">Thank you, {(address.get('first_name','') or 'friend').strip()}.</h1>
      <p style="font-size:14px;color:{_BRAND_MUTED};margin:0 0 8px;line-height:1.6">Your order has been received and is being prepared with care.</p>
      <div style="font-family:Georgia,serif;font-size:18px;color:{_BRAND_TEXT};margin-top:18px">Order <span style="color:{_BRAND_GOLD}">#{order_id_short}</span></div>
    </div>

    <div style="padding:24px 36px 12px">
      <div style="font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.22em;color:{_BRAND_TEXT};text-transform:uppercase;margin-bottom:6px">Order Summary</div>
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border-top:1px solid {_BRAND_BORDER}">
        {items_rows}
      </table>
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:14px">
        <tr><td style="padding:6px 0;font-size:13px;color:{_BRAND_MUTED}">Subtotal</td><td style="padding:6px 0;text-align:right;font-size:13px;color:{_BRAND_TEXT}">{_gbp(order.get('subtotal',0))}</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:{_BRAND_MUTED}">Shipping</td><td style="padding:6px 0;text-align:right;font-size:13px;color:{_BRAND_TEXT}">{shipping_label}</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:{_BRAND_MUTED}">Tax</td><td style="padding:6px 0;text-align:right;font-size:13px;color:{_BRAND_TEXT}">Included</td></tr>
        <tr><td colspan="2" style="border-top:1px solid {_BRAND_BORDER};padding-top:8px"></td></tr>
        <tr><td style="padding:6px 0;font-family:Georgia,serif;font-size:18px;color:{_BRAND_TEXT}">Total</td><td style="padding:6px 0;text-align:right;font-family:Georgia,serif;font-size:18px;color:{_BRAND_TEXT}">{_gbp(order.get('total',0))}</td></tr>
      </table>
    </div>

    {f'<div style="padding:24px 36px"><div style="font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.22em;color:{_BRAND_TEXT};text-transform:uppercase;margin-bottom:8px">Delivery Address</div>{addr_html}</div>' if addr_html else ''}

    <div style="padding:12px 36px 36px">
      <a href="{os.environ.get('FRONTEND_URL','')}/account/orders" style="display:inline-block;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.22em;color:#fff;background:{_BRAND_GOLD};border:1px solid {_BRAND_GOLD};padding:14px 24px;text-decoration:none;text-transform:uppercase">View Your Order →</a>
    </div>

    <div style="background:{_BRAND_WARM};padding:24px 36px;text-align:center">
      <div style="font-size:12px;color:{_BRAND_MUTED};line-height:1.6">Questions? Reply to this email and we'll be in touch.<br>MA Home Interiors · hello@ma-home.com</div>
    </div>
  </div>
</body></html>
"""


async def send_order_confirmation(order: dict, recipient_email: str | None = None) -> None:
    """Fire-and-forget order confirmation email. Logs errors instead of raising."""
    api_key = os.environ.get("RESEND_API_KEY")
    sender = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
    sender_name = os.environ.get("SENDER_NAME", "MA Home Interiors")
    if not api_key:
        logger.info("Skipping email — RESEND_API_KEY not configured.")
        return

    to_email = recipient_email or order.get("user_email")
    if not to_email:
        logger.warning("Skipping email — no recipient email.")
        return

    resend.api_key = api_key
    order_id_short = (order.get("id") or "")[:8].upper()
    params = {
        "from": f"{sender_name} <{sender}>",
        "to": [to_email],
        "subject": f"Your MA Home Interiors order #{order_id_short}",
        "html": _build_html(order),
    }

    def _send():
        try:
            resp = resend.Emails.send(params)
            logger.info("Order confirmation sent: order=%s to=%s id=%s", order_id_short, to_email, resp.get("id") if isinstance(resp, dict) else resp)
        except Exception as e:
            logger.error("Order confirmation failed: order=%s to=%s err=%s", order_id_short, to_email, e)

    # Resend's Python SDK is sync — run it off the event loop so we never block payment flow
    await asyncio.get_event_loop().run_in_executor(None, _send)
