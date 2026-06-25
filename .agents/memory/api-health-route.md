---
name: API health route at /api root
description: Why GET /api must return 200, not 404, for uptime/healthchecks
---

The api-server mounts its router at `/api` (`app.use("/api", router)`). The health
route historically only bound `/healthz`, so bare `GET /api` returned **404** (and
500 during boot before listening).

**Rule:** keep a 200 handler bound at the router root so `GET /api` returns
`{status:"ok"}`, in addition to `/api/healthz`.

**Why:** the platform readiness healthcheck and the user's external uptime monitor
probe `/api`. A 404/500 there is interpreted as DOWN, producing false-positive
outage reports even when the app process is healthy and answering fast. This was
the only concrete app-side signal behind reported "outages" where deployment logs
showed zero 5xx / no restarts / no slow responses during the outage windows.

**How to apply:** if uptime alerts fire but deployment logs show no application
errors in the outage windows, first check what path the monitor/healthcheck hits
and confirm it returns 2xx. Prefer pointing monitors at `/api/healthz`.
