#!/usr/bin/env python3
"""
Kite Connect — one-shot token refresh helper.

Flow:
  1. Opens the Kite login URL in your browser.
  2. You log in on Zerodha and get redirected to a URL that contains request_token.
  3. Paste that full redirect URL (or just the request_token) here.
  4. Script calls the backend /kite/callback endpoint.
  5. The backend exchanges the request_token and stores the access token in kite_tokens.

Usage:
  python3 scripts/generate_kite_token.py

No external dependencies — pure Python stdlib.
"""

import json
import re
import urllib.parse
import urllib.request
import webbrowser

LOCALCONFIG_PATH = "service/src/main/resources/localconfig.yaml"
KITE_LOGIN_BASE = "https://kite.zerodha.com/connect/login?v=3&api_key="


def read_config_value(yaml_text: str, key: str) -> str:
    """Grab a value from our flat YAML like: key: "value" or key: value."""
    match = re.search(
        rf'^\s*{re.escape(key)}\s*:\s*["\']?([^"\'#\n]+)["\']?',
        yaml_text,
        re.MULTILINE,
    )
    return match.group(1).strip() if match else ""


def load_kite_config() -> tuple[str, str]:
    try:
        with open(LOCALCONFIG_PATH, encoding="utf-8") as file_obj:
            text = file_obj.read()
    except FileNotFoundError:
        text = ""

    api_key = read_config_value(text, "apiKey")
    callback_base_url = read_config_value(text, "renderExternalUrl")

    if not api_key:
        api_key = input("  api_key: ").strip()

    if not callback_base_url:
        callback_base_url = input("  backend base URL: ").strip()

    return api_key, callback_base_url.rstrip("/")


def extract_request_token(raw: str) -> str:
    """
    Accept either a full redirect URL or just the bare request token.
    """
    value = raw.strip()
    match = re.search(r"[?&]request_token=([A-Za-z0-9]+)", value)
    if match:
        return match.group(1)
    if re.fullmatch(r"[A-Za-z0-9]+", value):
        return value
    raise ValueError(f"Could not find request_token in: {raw}")


def refresh_token(callback_base_url: str, request_token: str) -> dict[str, str]:
    callback_url = (
        f"{callback_base_url}/kite/callback?"
        + urllib.parse.urlencode({"request_token": request_token})
    )
    with urllib.request.urlopen(callback_url) as response:
        body = json.loads(response.read())

    if body.get("status") != "authenticated":
        raise RuntimeError(f"Unexpected callback response: {body}")

    return body


def main() -> None:
    print("\n--- Kite Connect token refresh --------------------------------\n")

    api_key, callback_base_url = load_kite_config()
    login_url = KITE_LOGIN_BASE + api_key

    print(f"  Login URL:\n  {login_url}\n")
    print("  Opening in your browser...")
    webbrowser.open(login_url)

    print(
        "\n  After logging in, Zerodha redirects you to your registered callback URL.\n"
        "  Paste that full URL here, or paste just the request_token value.\n"
    )
    raw_value = input("  Redirect URL or request_token: ").strip()
    request_token = extract_request_token(raw_value)

    print(f"\n  request_token: {request_token}")
    print(f"  Persisting token through {callback_base_url}/kite/callback ...")

    response = refresh_token(callback_base_url, request_token)
    print(
        "\n  Token saved to kite_tokens successfully.\n"
        f"  userId: {response.get('userId', '')}\n"
        "  Restart any local backend that should pick up the latest DB token.\n"
    )


if __name__ == "__main__":
    main()
