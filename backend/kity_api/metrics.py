from __future__ import annotations

import logging
from datetime import datetime, timezone

import sqlite3

from .config import Settings
from .storage import ensure_store, get_connection

logger = logging.getLogger(__name__)


def ensure_metrics_table(settings: Settings) -> None:
  """Create the user_counts table if it doesn't exist."""
  ensure_store(settings)
  with get_connection(settings) as conn:
    conn.execute(
      """
      CREATE TABLE IF NOT EXISTS user_counts (
        period_key TEXT PRIMARY KEY,
        total_users INTEGER NOT NULL,
        captured_at TEXT NOT NULL
      )
      """
    )


def snapshot_user_count(settings: Settings) -> None:
  """
  Count distinct users and store a twice-daily snapshot keyed by period (YYYY-MM-DDThh:00Z).
  Uses REPLACE to avoid duplicates for the same period.
  """
  ensure_metrics_table(settings)
  now = datetime.now(timezone.utc)
  period_key = now.strftime("%Y-%m-%dT%H:00:00Z")

  with get_connection(settings) as conn:
    total = conn.execute("SELECT COUNT(DISTINCT email) FROM users").fetchone()[0]
    conn.execute(
      """
      REPLACE INTO user_counts (period_key, total_users, captured_at)
      VALUES (?, ?, ?)
      """,
      (period_key, total, now.isoformat()),
    )
  logger.info("User count snapshot recorded for %s (total=%s)", period_key, total)


__all__ = ["snapshot_user_count", "ensure_metrics_table"]
