# e2e — Headless visual verification of the Vault redesign

Two scripts. One-time bootstrap (interactive login in your hands), then automated
headless verification.

## Files

- `auth-bootstrap.js` — opens a Chromium window, you log in normally, the script
  saves the resulting Supabase session + cookies to `/tmp/hridai-e2e-state.json`.
  Run once. Password stays between you and the window — never enters env vars,
  scripts, or Claude's transcript.
- `verify.js` — headless. Reuses the saved state, injects the `vault_redesign`
  flag, navigates each main Vault surface, snapshots them + extracts key DOM
  text. Writes screenshots and a JSON report to `/tmp/hridai-e2e/`.

## Usage

```bash
# One time:
node e2e/auth-bootstrap.js

# Then any time after a code change:
node e2e/verify.js                    # flag ON (default)
FLAG=off node e2e/verify.js           # flag OFF (regression baseline)
```

The saved auth state is on your machine only (`/tmp/hridai-e2e-state.json`).
Delete it to re-bootstrap.

## Env

| var          | default                       |
|--------------|-------------------------------|
| `APP_URL`    | `http://localhost:5174`       |
| `STATE_FILE` | `/tmp/hridai-e2e-state.json`  |
| `OUT_DIR`    | `/tmp/hridai-e2e`             |
| `FLAG`       | `on`                          |
