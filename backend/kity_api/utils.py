from __future__ import annotations

from datetime import datetime
from typing import Any, Optional


def string_or_null(value: Any) -> Optional[str]:
  if not isinstance(value, str):
    return None
  trimmed = value.strip()
  return trimmed or None


def to_datetime(value: Any) -> Optional[datetime]:
  if not value:
    return None
  if isinstance(value, datetime):
    return value
  try:
    return datetime.fromisoformat(value)
  except Exception:
    return None


def to_iso(value: Optional[datetime]) -> Optional[str]:
  return value.isoformat() if value else None
