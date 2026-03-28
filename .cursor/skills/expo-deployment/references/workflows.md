# EAS Workflow Deployment Patterns

Use EAS Workflows for repeatable release automation.

## Common workflow split

- `preview.yml` for pull requests (build + web preview deploy)
- `release.yml` for `main` (store builds/submission and production web deploy)

## Example release pipeline

1. Build iOS (`type: build`, `platform: ios`, `profile: production`)
2. Build Android (`type: build`, `platform: android`, `profile: production`)
3. Submit iOS (`type: submit`, `needs: [build-ios]`)
4. Submit Android (`type: submit`, `needs: [build-android]`)
5. Deploy web (`eas deploy --prod`) in a custom job if needed

## Recommended safeguards

- Restrict releases to `main` or tags
- Add `concurrency` to prevent overlapping release runs
- Use environment-specific secrets for production submissions
- Add `if` conditions for manual gates around submission steps

