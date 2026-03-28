# TestFlight Submission Guide

## Prerequisites

- Apple Developer account with App Store Connect access
- Bundle identifier created in App Store Connect
- `eas credentials` configured for the project

## Build and submit

```bash
npx eas-cli@latest build -p ios --profile production --submit
```

## Post-submit checklist

- Confirm processing completes in App Store Connect
- Add internal/external tester groups
- Fill in beta metadata and export compliance answers
- Validate crash-free launch before broad rollout

## Common issues

- **Missing agreements**: accept latest Apple agreements in App Store Connect
- **Invalid credentials**: refresh credentials with `eas credentials`
- **Build rejected by processing**: verify `ios.buildNumber` progression and signing setup

