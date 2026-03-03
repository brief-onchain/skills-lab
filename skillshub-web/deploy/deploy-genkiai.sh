#!/usr/bin/env bash
set -euo pipefail

cat <<'MSG'
GitOps Mode Enabled (manual SSH deploy disabled)

Deployment memory:
- Mode: GitOps
- App: skillshub-web
- Server alias: genkiai-new
- Remote path: /opt/skillshub/skillshub-web
- Service: skillshub-web

How to deploy now:
1. Push to your GitHub repo branch (usually main).
2. Let GitOps controller/runner on genkiai pull and deploy.
3. Check runtime on server:
   - systemctl status skillshub-web
   - journalctl -u skillshub-web -n 100 --no-pager

Note:
- This script intentionally does not execute remote changes.
MSG
