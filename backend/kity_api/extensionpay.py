from __future__ import annotations

import logging
from typing import Dict, Iterable, List, Optional, Tuple

import requests

from .config import Settings
from .storage import STATUS_VALUES, DEFAULT_STATUS, upsert_user
from .utils import string_or_null

logger = logging.getLogger(__name__)


def map_extpay_status(
  status: Optional[str], plan_nickname: Optional[str] = None
) -> str:
  """Map ExtensionPay/Stripe style statuses into our internal status values."""
  normalized = (status or "").strip().lower().replace(" ", "_")
  plan = (plan_nickname or "").strip().lower()

  if normalized in {"trial", "trialing", "active_trial"}:
    return "active_trial"
  if normalized in {"trial_ended", "canceled", "cancelled", "ended_trial"}:
    return "ended_trial"
  if "month" in plan or normalized in {"paid_monthly", "monthly"}:
    return "paid_monthly"
  if "year" in plan or "annual" in plan or normalized in {"paid_annually", "yearly"}:
    return "paid_annually"
  if normalized in STATUS_VALUES:
    return normalized
  return DEFAULT_STATUS


def fetch_extensionpay_payload(settings: Settings) -> List[Dict[str, object]]:
  if not settings.extpay_sync_url or not settings.extpay_api_key:
    raise RuntimeError("ExtPay sync URL or API key missing; set EXTPAY_SYNC_URL and EXTPAY_API_KEY")

  headers = {
    "Authorization": f"Bearer {settings.extpay_api_key}",
    "Accept": "application/json",
  }
  resp = requests.get(
    settings.extpay_sync_url,
    headers=headers,
    timeout=settings.extpay_sync_timeout,
  )
  resp.raise_for_status()
  data = resp.json()

  # Accept either a top-level list or {"users": [...]}
  if isinstance(data, list):
    return data  # type: ignore[return-value]
  users = data.get("users") or []
  if not isinstance(users, Iterable):
    raise RuntimeError("Unexpected ExtPay response shape; expected a list of users")
  return list(users)  # type: ignore[arg-type]


def sync_extensionpay_users(settings: Settings) -> Tuple[int, int, List[str]]:
  """
  Pull users from ExtensionPay and upsert into our DB.
  Returns (created_count, updated_count, errors).
  """
  created = 0
  updated = 0
  errors: List[str] = []

  try:
    payload = fetch_extensionpay_payload(settings)
  except Exception as exc:  # pragma: no cover - network error handling
    logger.exception("ExtPay sync failed to fetch payload: %s", exc)
    return created, updated, [str(exc)]

  for idx, entry in enumerate(payload):
    try:
      email = string_or_null(entry.get("email")) if isinstance(entry, dict) else None
      if not email:
        errors.append(f"[{idx}] missing email")
        continue

      name = string_or_null(entry.get("name") if isinstance(entry, dict) else None)
      trial_started_at = (
        entry.get("trialStartedAt")  # type: ignore[union-attr]
        if isinstance(entry, dict)
        else None
      ) or (entry.get("trial_started_at") if isinstance(entry, dict) else None)
      subscription_started_at = (
        entry.get("subscriptionStartedAt")  # type: ignore[union-attr]
        if isinstance(entry, dict)
        else None
      ) or (entry.get("subscription_started_at") if isinstance(entry, dict) else None)

      plan = (
        entry.get("planNickname")
        if isinstance(entry, dict)
        else None
      ) or (entry.get("plan") if isinstance(entry, dict) else None)
      raw_status = (
        entry.get("status")
        if isinstance(entry, dict)
        else None
      ) or (entry.get("planStatus") if isinstance(entry, dict) else None)

      status = map_extpay_status(raw_status, plan_nickname=plan)

      record, was_created = upsert_user(
        settings=settings,
        email=email,
        name=name,
        status=status,
        trial_started_at=trial_started_at,
        subscription_started_at=subscription_started_at,
      )
      if was_created:
        created += 1
      else:
        updated += 1
      logger.debug("ExtPay sync applied user %s (created=%s)", record["email"], was_created)
    except Exception as exc:  # pragma: no cover - defensive logging
      logger.exception("ExtPay sync failed for entry %s: %s", idx, exc)
      errors.append(f"[{idx}] {exc}")

  return created, updated, errors


__all__ = ["sync_extensionpay_users", "map_extpay_status"]
