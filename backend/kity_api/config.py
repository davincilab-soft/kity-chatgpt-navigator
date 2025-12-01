from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import List


@dataclass
class Settings:
  port: int
  allowed_origins: List[str]
  extension_origin: str
  data_dir: Path
  db_path: Path
  extpay_api_key: str | None
  extpay_sync_url: str | None
  extpay_sync_timeout: float
  extpay_sync_enabled: bool
  extpay_sync_timezone: str
  stripe_secret_key: str | None
  stripe_success_url: str
  stripe_cancel_url: str
  stripe_currency: str
  stripe_donation_link: str | None


def load_settings() -> Settings:
  base_dir = Path(__file__).resolve().parent.parent
  data_dir = base_dir / "data"

  allowed_env = [
    origin.strip()
    for origin in os.environ.get("ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
  ]

  loopback_defaults = [
    "http://localhost:8787",
    "http://127.0.0.1:8787",
  ]

  allowed = allowed_env or loopback_defaults

  return Settings(
    port=int(os.environ.get("PORT", "8787")),
    allowed_origins=allowed,
    extension_origin=os.environ.get(
      "EXTENSION_ORIGIN", "chrome-extension://<your-extension-id>"
    ),
    data_dir=data_dir,
    db_path=data_dir / "users.db",
    extpay_api_key=os.environ.get("EXTPAY_API_KEY"),
    extpay_sync_url=os.environ.get("EXTPAY_SYNC_URL"),
    extpay_sync_timeout=float(os.environ.get("EXTPAY_SYNC_TIMEOUT", "15")),
    extpay_sync_enabled=os.environ.get("EXTPAY_SYNC_ENABLED", "false").lower()
    in {"1", "true", "yes", "on"},
    extpay_sync_timezone=os.environ.get("EXTPAY_SYNC_TIMEZONE", "UTC"),
    stripe_secret_key=os.environ.get("STRIPE_SECRET_KEY"),
    stripe_success_url=os.environ.get(
      "STRIPE_SUCCESS_URL",
      "https://kity.software/thank-you",
    ),
    stripe_cancel_url=os.environ.get(
      "STRIPE_CANCEL_URL",
      "https://kity.software/support",
    ),
    stripe_currency=os.environ.get("STRIPE_CURRENCY", "usd").lower(),
    stripe_donation_link=os.environ.get("STRIPE_DONATION_LINK"),
  )
