from __future__ import annotations

from typing import Any, Dict, Tuple

from flask import jsonify, request

from .config import Settings
from .storage import find_user_by_token, read_store


def require_auth(
  settings: Settings,
) -> Tuple[Dict[str, Any], Dict[str, Any]] | Tuple[Any, int]:
  header = request.headers.get("Authorization") or ""
  token = header.replace("Bearer", "").strip()
  if not token:
    return jsonify({"error": "Missing bearer token"}), 401

  store = read_store(settings)
  user = find_user_by_token(store["users"], token)
  if not user:
    return jsonify({"error": "Invalid token"}), 401

  return store, user
