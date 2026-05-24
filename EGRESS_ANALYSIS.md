# Supabase egress + performance deep-dive (code-based)

This analysis is based on direct inspection of `index.html` query paths and refresh behavior.

## What is causing high egress

## 1) Repeated full-row fetches (`select("*")`) from `requests`
The code has many places where request rows are fetched with `*`, which sends every column even when screens only show a subset.

High-impact examples:
- `loadIncomingStock`: `.from("requests").select("*")...` for stock flow checks.
- `loadManagerPanel`: `.from("requests").select("*")...` for manager overview.
- `loadProcessor*` / `loadSuper*` style views: multiple `.select("*")` order loads.
- update/lookup flows fetch complete rows before mutation where only IDs/status fields are needed.

Result: every click/tab switch can transfer much more than needed.

## 2) Polling + large payloads
`startPendingCountAutoRefresh()` calls `loadPendingCount()` every 20 seconds. If the pending count query scans/fetches broad request payloads, this can create persistent background egress.

With 6–7 users open simultaneously:
- 3 polls/minute/user
- ~18–21 polls/minute total
- ~25,000–30,000 polls/day if tabs stay open

Even modest payload size per poll becomes GB-scale quickly.

## 3) Same entities reloaded across screens (no stable client cache)
`requests`, `users`, and dashboard datasets are repeatedly re-fetched per navigation event. There is limited reuse of already-loaded data or conditional revalidation.

## 4) HTML-level anti-cache headers (now fixed in this patch)
The document previously included strict meta no-cache directives, preventing effective browser reuse.

Removed in this change from `index.html`:
- `Cache-Control: no-cache, no-store, must-revalidate`
- `Pragma: no-cache`
- `Expires: 0`

This helps load performance and reduces repeated transfer for page/bootstrap assets.

---

## Prioritized optimization plan (biggest savings first)

### P0 (Do first, very high ROI)
1. Replace all `select("*")` with explicit projection constants per screen.
   - Example pattern:
     - list view: `id,OrderNo,PartNo,Branch,Approval,created_at`
     - detail modal: fetch extra columns only when opening detail
2. Change pending counter polling to lightweight query shape:
   - fetch only fields required for count derivation (`id,OrderNo,Approval`), or better,
   - move count to RPC/materialized view and fetch one numeric row
3. Add pagination/range everywhere list-like data is loaded.
   - enforce page size (e.g., 25/50) with server-side sort/filter before transfer

### P1
4. Add route-level in-memory cache with TTL (30–120s) for non-critical dashboard widgets.
5. Add tab visibility guard:
   - stop polling when tab hidden (`document.hidden`)
   - restart on visibility regain
6. Add debounce/coalescing so rapid clicks don’t trigger duplicate in-flight queries.

### P2
7. Build small server-side aggregate endpoints (Edge Function / RPC):
   - pending counts
   - status summaries by branch/day
   This prevents sending raw request rows to compute simple cards.
8. For static-ish lookup tables (`users`, branch dictionaries), cache in localStorage with version key.

---

## Specific code hotspots to target next

1. Replace `select("*")` in request-heavy functions near these regions:
- around lines ~3930, ~6122, ~7185, ~7200, ~8881, ~9224, ~9814, ~10120 in `index.html`.

2. Replace user-wide broad selects in developer/admin views:
- around ~8735 and ~8805 in `index.html`.

3. Polling loop to optimize:
- `startPendingCountAutoRefresh()` around ~5311 currently runs every 20s.

4. Keep using paged helpers where already present (`fetchRequestRowsPaged`) and extend them to all request tables.

---

## Expected impact after applying P0 + P1

- Egress reduction: typically **40–80%** in dashboards that currently use `select("*")` + polling.
- Perceived speed: tab switch/list load often **2x–5x faster** due to smaller payloads + fewer duplicate calls.
- Lower Supabase overage risk from background idle polling.

---

## How to verify improvements (practical checklist)

1. In browser DevTools Network:
   - compare total transferred bytes for a fixed flow before/after.
2. In Supabase logs:
   - rank endpoints/queries by bytes and call counts.
3. Add a simple client metric logger:
   - query name
   - rows returned
   - payload size estimate
   - latency
4. Set a budget:
   - e.g., route load < 300 KB, background refresh < 30 KB/min/user.
