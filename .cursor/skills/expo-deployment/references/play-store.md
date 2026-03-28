# Google Play Submission Guide

## Setup prerequisites

- Google Play Console app created
- Service account JSON generated and linked to Play Console
- `submit.production.android.serviceAccountKeyPath` set in `eas.json`

## Build and submit

```bash
npx eas-cli@latest build -p android --profile production --submit
```

## Track strategy

- Start with `internal` for smoke validation
- Promote to `closed` for staged QA
- Move to `open` or `production` after confidence checks

## Common blocking issues

- **Permission error**: confirm service account has release permissions
- **Version code conflict**: increment version code/build number
- **Policy rejection**: align data safety form and app behavior

