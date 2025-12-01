from __future__ import annotations

from dotenv import load_dotenv

from kity_api import create_app

# Load environment variables from .env file
load_dotenv()

app = create_app()

if __name__ == "__main__":
  app.run(host="0.0.0.0", port=app.config.get("PORT", 8787))
