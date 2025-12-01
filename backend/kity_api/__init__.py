from __future__ import annotations

from flask import Flask

from .config import load_settings
from .cors import attach_cors
from .routes import create_api_blueprint
from .scheduler import start_scheduler


def create_app() -> Flask:
  settings = load_settings()

  app = Flask(__name__)
  app.config["PORT"] = settings.port

  attach_cors(app, settings)

  api = create_api_blueprint(settings)
  app.register_blueprint(api)

  # Background jobs (ExtPay sync, user count snapshots)
  start_scheduler(settings)

  @app.route("/health", methods=["GET"])
  def health():
    return {"ok": True}

  return app
