# Kite Access Token — Daily Refresh

Access tokens expire at **6:00 AM IST every day**. Run this once each morning before using the tool.

---

## Steps

### 1. Run the script

```bash
cd /Users/kushbhardwaj/Documents/github/TradingTool-3
python3 scripts/generate_kite_token.py
```

### 2. Log in on Zerodha

The script opens this URL in your browser automatically:
```
https://kite.zerodha.com/connect/login?v=3&api_key=6md1efchysjydws2
```
Enter your Zerodha credentials + TOTP.

### 3. Copy the redirect URL

After login, Zerodha redirects you to a URL like:
```
https://tradingtool-3-service.onrender.com/kite/callback?request_token=XXXXXXXXXXXXXXXX&status=success
```
Copy the **full URL** from your browser address bar.

> The page may show an error — that's fine. You only need the URL.

### 4. Paste into the script

Paste the full URL (or just the `request_token` value) when prompted.

### 5. Let the script patch the config

When asked `Patch this into localconfig.yaml automatically? [Y/n]` — press **Enter**.

The script writes the new token into:
```
service/src/main/resources/localconfig.yaml  →  kite.accessToken
```

### 6. Restart the backend

The backend reads `accessToken` at startup. Restart it to pick up the new token.
On startup you should see:
```
[InstrumentCache] Loaded XXXX NSE instruments at startup
```

---

## Environment variables (Render / production)

On Render, set `KITE_ACCESS_TOKEN` in the environment dashboard instead of using the config file.
The backend also auto-refreshes the cache after each `/kite/callback` login.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Search returns nothing | Cache empty — Kite not authenticated | Re-run token script, restart backend |
| `Token exchange failed` | Wrong `request_token` or already used | Re-do steps 2–4 (each `request_token` is one-time use) |
| `KiteException 403` | Token expired after 6 AM IST | Re-run token script |
