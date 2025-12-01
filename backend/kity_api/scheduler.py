from __future__ import annotations

import atexit
import logging
import os
from functools import partial

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from .config import Settings
from .extensionpay import sync_extensionpay_users
from .metrics import snapshot_user_count

logger = logging.getLogger(__name__)

_scheduler: BackgroundScheduler | None = None


def _should_start_scheduler() -> bool:
  """
  Avoid double-start when the Flask reloader is active.
  Start on the reloader child (WERKZEUG_RUN_MAIN == "true") or when no reloader is present.
  """
  main_flag = os.environ.get("WERKZEUG_RUN_MAIN")
  if main_flag is None:
    return True
  return main_flag.lower() == "true"


def start_scheduler(settings: Settings) -> None:
  global _scheduler

  if _scheduler:
    return

  if not _should_start_scheduler():
    logger.info("Skipping scheduler startup in Flask reloader parent process")
    return

  scheduler = BackgroundScheduler(timezone=settings.extpay_sync_timezone or "UTC")
  # ExtPay sync (optional)
  if settings.extpay_sync_enabled:
    if settings.extpay_sync_url and settings.extpay_api_key:
      job_fn = partial(sync_extensionpay_users, settings)
      scheduler.add_job(
        job_fn,
        CronTrigger(hour="12,22", minute=0, timezone=settings.extpay_sync_timezone),
        id="extpay-sync",
        max_instances=1,
        replace_existing=True,
      )
    else:
      logger.warning(
        "ExtPay sync scheduler skipped: missing EXTPAY_SYNC_URL or EXTPAY_API_KEY"
      )
  else:
    logger.info("ExtPay sync scheduler disabled (EXTPAY_SYNC_ENABLED=false)")

  # User count snapshots at 00:00 and 12:00 daily
  scheduler.add_job(
    partial(snapshot_user_count, settings),
    CronTrigger(hour="0,12", minute=0, timezone=settings.extpay_sync_timezone),
    id="user-count-snapshot",
    max_instances=1,
    replace_existing=True,
  )

  scheduler.start()
  atexit.register(lambda: scheduler.shutdown(wait=False))

  _scheduler = scheduler
  logger.info(
    "ExtPay sync scheduler started (runs at 12:00 and 22:00 %s)",
    settings.extpay_sync_timezone,
  )


__all__ = ["start_scheduler"]
