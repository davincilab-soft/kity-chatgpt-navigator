from __future__ import annotations

from flask import Flask, request, make_response, jsonify

from .config import Settings


def is_origin_allowed(origin: str | None, settings: Settings) -> bool:
  if origin is None:
    return True
  if origin == settings.extension_origin:
    return True
  if origin.startswith("chrome-extension://"):
    return True
  return origin in settings.allowed_origins


def attach_cors(app: Flask, settings: Settings) -> None:
  @app.before_request
  def _enforce_cors():
    if request.method == "OPTIONS":
      response = make_response("", 204)
      return _add_cors_headers(response)

    origin = request.headers.get("Origin")
    if origin and not is_origin_allowed(origin, settings):
      return jsonify({"error": "Origin not allowed"}), 403
    return None

  @app.after_request
  def _add_cors_headers(response):
    origin = request.headers.get("Origin")
    if is_origin_allowed(origin, settings):
      response.headers["Access-Control-Allow-Origin"] = origin or "*"
      response.headers["Vary"] = "Origin"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return response
