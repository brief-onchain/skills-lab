# Deployment Memory (Local)

This repository uses **GitOps** for cloud deployment.

## Fixed Deployment Context

- App name: `skillshub-web`
- Deployment mode: `gitops`
- Target server alias: `genkiai-new`
- Remote repo path: `/opt/skillshub/skills-lab`
- Runtime app path: `/opt/skillshub/skills-lab/skillshub-web`
- Runtime manager: `pm2`
- Runtime process: `skillshub-web`
- Manual SSH deploy: `disabled` (no direct mutate from local scripts)

## Network / Domain / SSL

- Primary domain: `skillerhub.net`
- Secondary domain: `www.skillerhub.net`
- Entry IP: `138.226.240.77`
- Nginx site: `/etc/nginx/sites-available/skillerhub.net.conf`
- Certificate: `/etc/letsencrypt/live/skillerhub.net/`
- Certificate renew timer: `certbot.timer` (enabled on server)

## Last Verified (2026-03-03)

- HTTPS check:
  - `https://skillerhub.net` -> `HTTP/1.1 200 OK`
  - `https://www.skillerhub.net` -> `HTTP/1.1 200 OK`
- PM2:
  - `skillshub-web` status: `online`
  - `exec cwd`: `/opt/skillshub/skills-lab/skillshub-web`

## Ops Runbook

1. Pull latest code
   - `cd /opt/skillshub/skills-lab`
   - `git pull --ff-only origin main`
2. Build frontend
   - `cd /opt/skillshub/skills-lab/skillshub-web`
   - `npm ci && npm run build`
3. Restart app
   - `pm2 restart skillshub-web`
4. Verify
   - `pm2 show skillshub-web`
   - `curl -I https://skillerhub.net`
5. If cert/https issue
   - `nginx -t && systemctl reload nginx`
   - `certbot certificates`

## Next Ops TODO

1. Add one-click deploy script in repo (`ops/deploy-skillshub.sh`)
2. Add health check + alerting (PM2 restart spikes / HTTP 5xx)
3. Upgrade Next.js from `14.1.0` to patched version (security advisory warning observed)
4. Add weekly cert expiry check (cron or monitoring)
