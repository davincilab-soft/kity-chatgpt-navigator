from __future__ import annotations

from decimal import Decimal, InvalidOperation

import stripe
from flask import Blueprint, jsonify, request

from .config import Settings
from .storage import STATUS_VALUES, read_users, upsert_user
from .utils import string_or_null


def create_api_blueprint(settings: Settings) -> Blueprint:
  api = Blueprint("kity_api", __name__)

  if settings.stripe_secret_key:
    stripe.api_key = settings.stripe_secret_key

  @api.route("/users", methods=["POST"])
  def create_user_route():
    payload = request.get_json(silent=True) or {}
    email = string_or_null(payload.get("email"))
    name = string_or_null(payload.get("name"))
    user_status = string_or_null(payload.get("status"))
    trial_started_at = string_or_null(
      payload.get("trialStartedAt") or payload.get("trial_started_at")
    )
    subscription_started_at = string_or_null(
      payload.get("subscriptionStartedAt") or payload.get("subscription_started_at")
    )

    if not email:
      return jsonify({"error": "Email is required"}), 400

    try:
      record, created = upsert_user(
        settings=settings,
        email=email,
        name=name,
        status=user_status,
        trial_started_at=trial_started_at,
        subscription_started_at=subscription_started_at,
      )
    except ValueError as exc:
      return jsonify({"error": str(exc), "allowedStatuses": sorted(STATUS_VALUES)}), 400

    http_status = 201 if created else 200
    return jsonify({"user": record, "created": created}), http_status

  @api.route("/users", methods=["GET"])
  def list_users():
    users = read_users(settings)
    return jsonify({"users": users})

  @api.route("/donations/link", methods=["GET"])
  def donation_link():
    if settings.stripe_donation_link:
      return jsonify({"url": settings.stripe_donation_link})
    return jsonify({"error": "Donation link not configured"}), 503

  @api.route("/donations/checkout", methods=["POST"])
  def create_donation_checkout():
    if not settings.stripe_secret_key:
      return jsonify({"error": "Stripe is not configured"}), 503

    payload = request.get_json(silent=True) or {}
    amount = payload.get("amount")

    try:
      amount_decimal = Decimal(str(amount))
    except (InvalidOperation, TypeError):
      return jsonify({"error": "Invalid amount"}), 400

    if amount_decimal <= 0:
      return jsonify({"error": "Amount must be greater than zero"}), 400

    # Convert to smallest currency unit (cents) and enforce two decimal places.
    cents = int((amount_decimal * 100).quantize(Decimal("1")))

    try:
      session = stripe.checkout.Session.create(
        mode="payment",
        line_items=[
          {
            "price_data": {
              "currency": settings.stripe_currency,
              "product_data": {"name": "Kity Support"},
              "unit_amount": cents,
            },
            "quantity": 1,
          }
        ],
        success_url=settings.stripe_success_url,
        cancel_url=settings.stripe_cancel_url,
      )
    except stripe.error.StripeError as exc:  # type: ignore[attr-defined]
      return jsonify({"error": str(exc)}), 500

    return jsonify({"url": session.url})

  return api
