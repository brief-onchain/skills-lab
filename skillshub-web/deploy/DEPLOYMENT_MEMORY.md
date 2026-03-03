# Deployment Memory (Local)

This repository uses **GitOps** for cloud deployment.

## Fixed Deployment Context

- App name: `skillshub-web`
- Deployment mode: `gitops`
- Target server alias: `genkiai-new`
- Remote app path: `/opt/skillshub/skillshub-web`
- Runtime service: `skillshub-web`
- Manual SSH deploy: `disabled` (no direct mutate from local scripts)

## Operator Notes

- Local code changes are only local until pushed to GitHub.
- Cloud update happens via GitOps pipeline/controller.
- Keep `deploy/skillshub-web.service` and `deploy/nginx.skillshub.conf` as infra templates in repo.
