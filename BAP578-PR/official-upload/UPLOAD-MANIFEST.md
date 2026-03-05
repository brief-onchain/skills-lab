# Official Upload Manifest

This manifest defines what should be copied into the official BAP-578 PR.

## Include (upload to official repo)

- `README.md` (only the BAP-578 Dev Kit section update)
- `docs/dev-tools/README.md`
- `docs/dev-tools/bap578-dev-kit.md`
- `docs/dev-tools/getting-started-15-minutes.md`
- `docs/dev-tools/security-checklist.md`
- `contracts/templates/BAP578AdapterBlueprint.sol` (optional item included)
- `test/templates/bap578-adapter.template.test.js` (optional item included)

## Exclude (internal only)

- `bap578-official-pr-playbook.md`
- `bap578-official-pr-body-template.md`
- `bap578-source-skills-audit.md`
- `skills/` staging package under this folder
- `templates/` staging template under this folder (separate local staging area)

Reason: these files are process/staging artifacts for local coordination, not part of canonical official docs.
