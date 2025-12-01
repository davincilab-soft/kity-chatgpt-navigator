from __future__ import annotations

import sqlite3
import uuid
from datetime import datetime
from typing import Dict, List, Optional

from .config import Settings
from .utils import to_datetime, to_iso

STATUS_VALUES = {
  "active_trial",
  "ended_trial",
  "paid_monthly",
  "paid_annually",
  "free_user",
}

DEFAULT_STATUS = "free_user"


def ensure_store(settings: Settings) -> None:
  """Create the SQLite database and users table if they don't exist."""
  settings.data_dir.mkdir(parents=True, exist_ok=True)
  with sqlite3.connect(settings.db_path) as conn:
    conn.execute(
      """
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        status TEXT NOT NULL,
        trial_started_at TEXT,
        subscription_started_at TEXT,
        created_at TEXT NOT NULL
      )
      """
    )


def get_connection(settings: Settings) -> sqlite3.Connection:
  ensure_store(settings)
  conn = sqlite3.connect(settings.db_path)
  conn.row_factory = sqlite3.Row
  return conn


def normalize_status(status: Optional[str], fallback: Optional[str] = None) -> str:
  if status is None:
    return fallback or DEFAULT_STATUS
  normalized = status.strip().lower().replace(" ", "_")
  if normalized not in STATUS_VALUES:
    raise ValueError(
      f"Invalid status '{status}'. Allowed: {', '.join(sorted(STATUS_VALUES))}"
    )
  return normalized


def normalize_iso(value: Optional[str], field_name: str) -> Optional[str]:
  if value is None:
    return None
  dt = to_datetime(value)
  if not dt:
    raise ValueError(f"Invalid ISO datetime for '{field_name}'")
  return to_iso(dt)


def row_to_user(row: sqlite3.Row) -> Dict[str, Optional[str]]:
  return {
    "id": row["id"],
    "email": row["email"],
    "name": row["name"],
    "status": row["status"],
    "trialStartedAt": row["trial_started_at"],
    "subscriptionStartedAt": row["subscription_started_at"],
    "createdAt": row["created_at"],
  }


def read_users(settings: Settings) -> List[Dict[str, Optional[str]]]:
  ensure_store(settings)
  with get_connection(settings) as conn:
    rows = conn.execute("SELECT * FROM users ORDER BY created_at DESC").fetchall()
  return [row_to_user(row) for row in rows]


def find_user_by_email(settings: Settings, email: str) -> Optional[Dict[str, Optional[str]]]:
  ensure_store(settings)
  with get_connection(settings) as conn:
    row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
  return row_to_user(row) if row else None


def upsert_user(
  settings: Settings,
  email: str,
  name: Optional[str] = None,
  status: Optional[str] = None,
  trial_started_at: Optional[str] = None,
  subscription_started_at: Optional[str] = None,
) -> tuple[Dict[str, Optional[str]], bool]:
  ensure_store(settings)
  clean_email = email.strip()
  with get_connection(settings) as conn:
    existing = conn.execute("SELECT * FROM users WHERE email = ?", (clean_email,)).fetchone()

    if existing:
      normalized_status = normalize_status(status, existing["status"])
      normalized_trial = (
        normalize_iso(trial_started_at, "trialStartedAt")
        if trial_started_at is not None
        else existing["trial_started_at"]
      )
      normalized_subscription = (
        normalize_iso(subscription_started_at, "subscriptionStartedAt")
        if subscription_started_at is not None
        else existing["subscription_started_at"]
      )
      conn.execute(
        """
        UPDATE users
        SET name = ?, status = ?, trial_started_at = ?, subscription_started_at = ?
        WHERE email = ?
        """,
        (
          name or existing["name"],
          normalized_status,
          normalized_trial,
          normalized_subscription,
          clean_email,
        ),
      )
      updated = conn.execute(
        "SELECT * FROM users WHERE email = ?", (clean_email,)
      ).fetchone()
      return row_to_user(updated), False

    normalized_status = normalize_status(status)
    normalized_trial = normalize_iso(trial_started_at, "trialStartedAt")
    normalized_subscription = normalize_iso(subscription_started_at, "subscriptionStartedAt")
    created_at = datetime.utcnow().isoformat()
    record_id = str(uuid.uuid4())

    conn.execute(
      """
      INSERT INTO users (
        id, email, name, status, trial_started_at, subscription_started_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      """,
      (
        record_id,
        clean_email,
        name,
        normalized_status,
        normalized_trial,
        normalized_subscription,
        created_at,
      ),
    )

    inserted = conn.execute(
      "SELECT * FROM users WHERE email = ?", (clean_email,)
    ).fetchone()
    return row_to_user(inserted), True


__all__ = [
  "upsert_user",
  "read_users",
  "find_user_by_email",
  "ensure_store",
  "STATUS_VALUES",
  "DEFAULT_STATUS",
]
