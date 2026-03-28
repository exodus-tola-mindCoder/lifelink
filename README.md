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
- Firebase SDK included (current build uses local-state demo mode)

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

## Firebase Notes (optional next step)

The app currently runs in local demo mode using AsyncStorage for speed and reliability during hackathon demos.

To switch toward Firebase-backed mode:

1. Create Firebase project and enable:
   - Authentication (Email/Password)
   - Firestore
2. Put your config in:
   - `app.json` -> `expo.extra.firebase`
   - `src/services/firebase.ts`
3. Replace local persistence calls in `AppContext` with Firestore/Auth operations.

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

## Hackathon Focus

This codebase prioritizes:
- polished, demo-ready UX
- smooth critical flow
- low setup friction
- practical implementation over over-engineering

