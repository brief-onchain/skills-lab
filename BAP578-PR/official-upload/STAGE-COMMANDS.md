# Stage Commands (Whitelist Only)

Run in official repo root (`non-fungible-agents-BAP-578`):

```bash
git add README.md \
  docs/dev-tools/README.md \
  docs/dev-tools/bap578-dev-kit.md \
  docs/dev-tools/getting-started-15-minutes.md \
  docs/dev-tools/security-checklist.md \
  contracts/templates/BAP578AdapterBlueprint.sol \
  test/templates/bap578-adapter.template.test.js

git status --short
```

Expected staged files:
- `M README.md`
- `A docs/dev-tools/README.md`
- `A docs/dev-tools/bap578-dev-kit.md`
- `A docs/dev-tools/getting-started-15-minutes.md`
- `A docs/dev-tools/security-checklist.md`
- `A contracts/templates/BAP578AdapterBlueprint.sol`
- `A test/templates/bap578-adapter.template.test.js`

Then commit:

```bash
git commit -m "docs: add BAP-578 dev kit integration guides"
```
