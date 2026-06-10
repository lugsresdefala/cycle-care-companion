---
name: useAuth stable user reference
description: Why idalia's useAuth must return a referentially-stable user object
---
The web `useAuth()` hook (artifacts/idalia) derives a `user` object from Clerk's `useUser()`. It MUST memoize that object on its primitive fields (id/email/fullName) with useMemo.

**Why:** Returning a fresh object literal every render makes every downstream `useEffect`/`useCallback` keyed on `user` (useSubscription, useIsAdmin, useTokenGate) re-fire on each render. Those effects fetch then setState, which re-renders, which mints a new `user` ref, which re-fires the effects — an infinite fetch loop that hammered `/api/subscription` and `/api/me/is-admin` roughly every 300ms (the network round-trip cadence) even while idle.

**How to apply:** Any hook/provider that synthesizes an object from an upstream hook and is consumed as an effect/callback dependency must return a stable reference (useMemo on primitives, or useRef). Watch for symptoms: continuous identical GETs at ~round-trip cadence in the api-server logs.
