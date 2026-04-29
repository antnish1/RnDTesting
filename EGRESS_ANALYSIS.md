# Supabase Egress Analysis (from `index.html`)

## Main reasons for heavy egress

1. **Global no-cache headers disable browser reuse of HTML and related fetch paths.**
   - `index.html` sets `Cache-Control: no-cache, no-store, must-revalidate`, `Pragma: no-cache`, and `Expires: 0` meta tags, which force fresh fetch behavior instead of reusing cached responses. This increases repeated network transfer across sessions and refreshes.

2. **Very broad `select("*")` queries transfer full rows repeatedly.**
   - Many calls fetch full row payloads from large tables (`requests`, `users`, etc.) using `select("*")`.
   - This is one of the strongest egress drivers because every client request returns unnecessary columns and duplicate data.

3. **Repeated fetch loops likely re-download request datasets.**
   - A polling interval is used (`setInterval`) to refresh pending counts and related request data.
   - Repeated list queries on `requests` can significantly amplify outbound bytes when multiple users are active.

4. **Manager/system screens fetch large result sets without strict pagination guards.**
   - Multiple paths call table-wide request selects and dashboard materialization. Combined with repeated user actions and role-based dashboards, this can re-send similar data many times.

5. **Third-party scripts are loaded from CDNs at runtime.**
   - Tailwind CDN build, Supabase JS from jsDelivr, and Lucide from unpkg are loaded on each uncached page load.
   - While not the largest source vs table payloads, this adds unavoidable outbound transfer when no caching is effective.

## Cached egress migration plan

### Phase 1 (quick wins, low risk)

1. **Remove strict no-cache meta tags for production HTML** and replace with cache-friendly policy at hosting/CDN level:
   - HTML: short TTL (`max-age=60`, `stale-while-revalidate`)
   - Versioned static assets: long TTL (`max-age=31536000, immutable`)

2. **Replace all `select("*")` with explicit column lists** in user flows:
   - For list views: only render columns needed by table/cards.
   - For details/edit modals: fetch additional columns lazily on demand.

3. **Add pagination and tighter limits** on all list endpoints:
   - Use `.range(start, end)` + server-side sorting/filtering.
   - Never fetch full historical `requests` unless exporting.

4. **Reduce polling frequency and scope**:
   - Increase interval for non-critical counters.
   - Poll only IDs/status fields for badges, then fetch detail only when screen is active.

### Phase 2 (cache-aware architecture)

5. **Move dashboard aggregate queries to cacheable materialized endpoints**:
   - Precompute summary tables/views (counts by status/branch/date).
   - Refresh on schedule/event.
   - Frontend queries small aggregate payloads instead of raw row lists.

6. **Serve read-heavy APIs through cacheable edge responses**:
   - Use an edge function for common read endpoints with `Cache-Control: public, s-maxage=...` and optional stale directives.
   - Ensure URL/query normalization so identical requests hit cache keys.

7. **Cache static dictionaries in client storage**:
   - Branch mapping, part catalogs, machine/customer lists change infrequently.
   - Cache in memory + localStorage with TTL and invalidate on version bump.

### Phase 3 (governance + observability)

8. **Introduce per-screen data budgets**:
   - Define max KB per route load and max refresh frequency.
   - Gate PRs that exceed baseline budgets.

9. **Track top egress contributors continuously**:
   - Log endpoint/table + response bytes.
   - Weekly ranking: top 10 queries by bytes transferred and call count.

10. **Export path isolation**:
   - Keep heavy `select("*")` only in explicit export/download actions.
   - For normal UI, enforce lean projection presets.

## Priority targets from this codebase

1. `requests` list/query paths currently using `select("*")`.
2. Polling-driven request refreshes (pending count interval and table refreshes).
3. `users` table admin queries using broad selects where narrow projection is enough.
4. Dashboard loading paths that materialize too many request columns for initial render.

## Execution order

1. Remove no-cache meta tags + deploy cache headers.
2. Convert top 10 `select("*")` calls to explicit projections.
3. Add pagination/range for request listing screens.
4. Tune polling and visibility-based refresh.
5. Add cacheable aggregate endpoint for dashboard cards.

