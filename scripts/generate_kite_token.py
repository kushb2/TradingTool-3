#!/usr/bin/env python3
"""
Kite Connect — one-shot access token generator.

Steps:
  1. Opens the Kite login URL in your browser.
  2. You log in on Zerodha and get redirected to a URL that contains request_token.
  3. Paste that full redirect URL (or just the request_token) here.
  4. Script exchanges it for an access_token via Kite API.
  5. Prints the token and offers to patch it straight into localconfig.yaml.

Usage:
  python3 scripts/generate_kite_token.py

No external dependencies — pure Python stdlib.
"""

import hashlib
import json
import re
import urllib.parse
import urllib.request
import webbrowser

# ── Config ──────────────────────────────────────────────────────────────────

# Read from localconfig.yaml so you never have to hardcode values here.
# Falls back to prompting if the file isn't found.

LOCALCONFIG_PATH = "service/src/main/resources/localconfig.yaml"
KITE_SESSION_URL = "https://api.kite.trade/session/token"
KITE_LOGIN_BASE  = "https://kite.zerodha.com/connect/login?v=3&api_key="


def read_config_value(yaml_text: str, key: str) -> str:
    """Grab a value from our flat YAML like: key: "value" or key: value"""
    match = re.search(rf'^\s*{re.escape(key)}\s*:\s*["\']?([^"\'#\n]+)["\']?', yaml_text, re.MULTILINE)
    return match.group(1).strip() if match else ""


def load_kite_config() -> tuple[str, str]:
    try:
        with open(LOCALCONFIG_PATH) as f:
            text = f.read()
        api_key    = read_config_value(text, "apiKey")
        api_secret = read_config_value(text, "apiSecret")
        if api_key and api_secret:
            print(f"  Loaded api_key from {LOCALCONFIG_PATH}")
            return api_key, api_secret
    except FileNotFoundError:
        pass

    print(f"  Could not read {LOCALCONFIG_PATH} — enter values manually.")
    api_key    = input("  api_key    : ").strip()
    api_secret = input("  api_secret : ").strip()
    return api_key, api_secret


def compute_checksum(api_key: str, request_token: str, api_secret: str) -> str:
    """SHA-256 of api_key + request_token + api_secret (Kite spec)."""
    raw = api_key + request_token + api_secret
    return hashlib.sha256(raw.encode()).hexdigest()


def exchange_token(api_key: str, request_token: str, api_secret: str) -> str:
    checksum = compute_checksum(api_key, request_token, api_secret)
    payload  = urllib.parse.urlencode({
        "api_key":       api_key,
        "request_token": request_token,
        "checksum":      checksum,
    }).encode()
    req = urllib.request.Request(
        KITE_SESSION_URL,
        data=payload,
        method="POST",
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Kite-Version": "3",
        },
    )
    with urllib.request.urlopen(req) as resp:
        body = json.loads(resp.read())

    if body.get("status") != "success":
        raise RuntimeError(f"Kite API error: {body}")

    return body["data"]["access_token"]


def patch_localconfig(access_token: str) -> None:
    try:
        with open(LOCALCONFIG_PATH) as f:
            text = f.read()

        # Replace   accessToken: ""   or   accessToken: "old_value"
        updated = re.sub(
            r'(^\s*accessToken\s*:\s*)["\']?[^"\'#\n]*["\']?',
            rf'\g<1>"{access_token}"',
            text,
            flags=re.MULTILINE,
        )

        if updated == text:
            print("  WARNING: Could not find 'accessToken' line in localconfig.yaml — patch skipped.")
            return

        with open(LOCALCONFIG_PATH, "w") as f:
            f.write(updated)
        print(f"  Patched {LOCALCONFIG_PATH} with new accessToken.")
    except Exception as e:
        print(f"  Could not patch config: {e}")


def extract_request_token(raw: str) -> str:
    """
    Accepts either a full redirect URL like:
      https://host/kite/callback?request_token=abc123&status=success
    or just the bare token itself.
    """
    raw = raw.strip()
    # Try to parse as URL first
    match = re.search(r'[?&]request_token=([A-Za-z0-9]+)', raw)
    if match:
        return match.group(1)
    # Assume user pasted the raw token directly
    if re.fullmatch(r'[A-Za-z0-9]+', raw):
        return raw
    raise ValueError(f"Could not find request_token in: {raw}")


# ── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    print("\n─── Kite Connect token generator ───────────────────────────\n")

    api_key, api_secret = load_kite_config()

    login_url = KITE_LOGIN_BASE + api_key
    print(f"\n  Login URL:\n  {login_url}\n")
    print("  Opening in your browser...")
    webbrowser.open(login_url)

    print(
        "\n  After logging in, Zerodha redirects you to your registered callback URL.\n"
        "  The URL looks like:\n"
        "    https://your-host/kite/callback?request_token=XXXXXXXX&status=success\n"
    )
    raw = input("  Paste the full redirect URL (or just the request_token): ").strip()

    request_token = extract_request_token(raw)
    print(f"\n  request_token : {request_token}")
    print("  Exchanging for access_token...")

    access_token = exchange_token(api_key, request_token, api_secret)
    print(f"\n  ✓ access_token : {access_token}")

    answer = input("\n  Patch this into localconfig.yaml automatically? [Y/n]: ").strip().lower()
    if answer in ("", "y", "yes"):
        patch_localconfig(access_token)

    print("\n  Done. Restart the backend to pick up the new token.\n")


if __name__ == "__main__":
    main()
