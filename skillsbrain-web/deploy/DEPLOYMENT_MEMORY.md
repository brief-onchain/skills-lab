# Deployment Memory (Local)

This repository uses **GitOps** for cloud deployment.

## Fixed Deployment Context

- App name: `skillsbrain-web`
- Deployment mode: `gitops`
- Target server alias: `genkiai-new`
- Remote app path: `/opt/skillsbrain/skillsbrain-web`
- Runtime service: `skillsbrain-web`
- Manual SSH deploy: `disabled` (no direct mutate from local scripts)

## Operator Notes

- Local code changes are only local until pushed to GitHub.
- Cloud update happens via GitOps pipeline/controller.
- Keep `deploy/skillsbrain-web.service` and `deploy/nginx.skillsbrain.conf` as infra templates in repo.
