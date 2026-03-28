# LifeLink (Expo Hackathon App)

LifeLink is a real-time emergency blood response demo app built with Expo (React Native).  
It connects hospitals with nearby compatible blood donors, tracks donor responses, and simulates transport payment via M-Pesa.

## What this app does

- Hospital creates emergency blood requests.
- Matching donors are identified by:
  - blood type compatibility
  - distance proximity (GPS-based, one-shot location updates)
- Donors can mark **"I'm available"** in one tap.
- Hospital sees live responder counts and can mark request as fulfilled.
- Donors complete a **dynamic M-Pesa simulation**:
  - accept suggested amount
  - adjust amount
  - cover full transport cost
  - receive fake successful transaction ID

## Tech Stack

- Expo + React Native + TypeScript
- React Navigation (native stack)
- AsyncStorage (session + local persistence)
- Expo Location (foreground location)
- Firebase Functions proxy for Daraja sandbox requests

## Project Structure

- `App.tsx` - app entry with provider + navigator
- `src/navigation/RootNavigator.tsx` - role-based routing
- `src/context/AppContext.tsx` - core app state and business logic
- `src/screens/` - Welcome, Auth, Donor, Hospital, Payment screens
- `src/services/matching.ts` - blood compatibility + Haversine distance + suggested cost
- `src/services/location.ts` - location permission and coordinate capture
- `src/services/storage.ts` - AsyncStorage helpers
- `src/services/firebase.ts` - Firebase bootstrap placeholder
- `src/theme/theme.ts` - colors, spacing, radii

## Requirements

- Node.js 18+ (Node 20+ recommended)
- npm 9+
- Expo Go app on your phone (recommended for demo)

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Run type checks:

```bash
npm run typecheck
```

3. Start Metro:

```bash
npm run start
```

4. Open in Expo Go:
- Scan the QR code from terminal output.
- Ensure phone and computer are on the same network.

## Available Scripts

- `npm run start` - start Expo dev server
- `npm run android` - start and open Android target
- `npm run ios` - start and open iOS target (macOS)
- `npm run web` - run web preview
- `npm run typecheck` - TypeScript type check
- `npm run functions:install` - install Firebase Functions dependencies
- `npm run functions:build` - build Firebase Functions TypeScript
- `npm run functions:serve` - run local Firebase Functions emulator

## Demo Accounts (pre-seeded)

- Donor:
  - Email: `donor.a@lifelink.app`
  - Password: `password123`
- Hospital:
  - Email: `hospital@lifelink.app`
  - Password: `password123`

## Core Demo Flow (recommended)

1. Login as **Hospital**
2. Create request (blood type + urgency + radius)
3. Logout and login as **Donor**
4. View alert in donor dashboard
5. Tap **"I'm available"**
6. Complete M-Pesa simulation payment
7. Login as Hospital to see updated response count/status

## Location Behavior

- Location is requested on signup/login and app foreground resume.
- No background tracking is used.
- Exact donor coordinates are not shown in UI; location is used internally for matching.

## M-Pesa Sandbox Integration (Daraja + Firebase Functions)

LifeLink uses a **minimal Firebase Functions proxy** so M-Pesa secrets stay server-side while the mobile app remains demo-friendly.

### Why this approach

- Uses real Daraja request structure (token + STK push)
- Avoids exposing `MPESA_CONSUMER_SECRET` and `MPESA_PASSKEY` in Expo bundle
- Skips callback dependency for demo stability (client simulates success after 2-3 seconds)

### Environment variables

Copy `.env.example` to `.env` and fill values:

```bash
EXPO_PUBLIC_MPESA_PROXY_URL=
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_BASE_URL=https://apisandbox.safaricom.et
MPESA_TOKEN_PATH=/v1/token/generate?grant_type=client_credentials
MPESA_STK_PUSH_PATH=/mpesa/stkpush/v3/processrequest
MPESA_PHONE_COUNTRY_CODE=251
MPESA_SHORTCODE=6564
MPESA_PASSKEY=
MPESA_STK_PASSWORD_OVERRIDE=
MPESA_STK_TIMESTAMP_OVERRIDE=
MPESA_CALLBACK_URL=https://example.com/callback
```

Important:
- `EXPO_PUBLIC_MPESA_PROXY_URL` is the only client-exposed value.
- `MPESA_*` secrets must be configured on Functions runtime (not hardcoded in app code).

### Firebase Functions proxy routes

- `POST /access-token` - requests Daraja OAuth token using Basic Auth
- `POST /stk-push` - initiates STK push with generated timestamp/password
- `GET /health` - quick health check

### Run locally (recommended demo setup)

1. Install app dependencies:

```bash
npm install
```

2. Install and build functions:

```bash
npm run functions:install
npm run functions:build
```

3. Start Firebase Functions emulator:

```bash
npm run functions:serve
```

4. Set `EXPO_PUBLIC_MPESA_PROXY_URL` to your function URL (not Safaricom URL) and run Expo:

```bash
npm run start -c
```

Examples:

- Local emulator: `http://127.0.0.1:5001/<firebase-project-id>/us-central1/mpesaProxy`
- Deployed function: `https://us-central1-<firebase-project-id>.cloudfunctions.net/mpesaProxy`

### Payment flow in app

1. Donor taps **I'm available**
2. Payment screen opens
3. Donor chooses amount + phone number (`2517/2519XXXXXXXX`)
4. App calls:
   - token endpoint
   - STK push endpoint
5. App shows loading then simulates success in ~2.2 seconds
6. Stores payment with transaction ID format: `LLX######`

## Troubleshooting

- **Port 8081 in use**
  - Kill old Metro process, then rerun `npm run start`.
- **Expo Go cannot connect**
  - Use same Wi-Fi for phone and laptop.
  - Try tunnel mode if needed.
- **Location not updating**
  - Check app location permission in device settings.
- **Type errors after package changes**
  - Run `npm install` then `npm run typecheck`.
- **M-Pesa proxy URL missing**
  - Set `EXPO_PUBLIC_MPESA_PROXY_URL` in `.env`, then restart Metro with `npm run start -c`.
- **Daraja errors from sandbox**
  - Confirm `MPESA_*` values are set in Functions runtime and phone is in `2547XXXXXXXX` or `2517/2519XXXXXXXX` format.

## Hackathon Focus

This codebase prioritizes:
- polished, demo-ready UX
- smooth critical flow
- low setup friction
- practical implementation over over-engineering

