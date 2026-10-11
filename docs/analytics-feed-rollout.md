# Analytics feed rollout

The Board dashboard reads version 2 of the analytics feeds from five project sites. Each project uses its own analytics database for its local dashboard, A/B Labs, and feed. The Board caches each feed for five minutes; Refresh bypasses the cache. Its hourly event batch is no longer scheduled. The CSV export now contains routing performance from the same feeds.

## Required production configuration

- The five feed endpoints are public read-only GET APIs with aggregate analytics only. Visitor session IDs and individual events are excluded. The Board's legacy batch-write endpoint remains protected separately.
- Check `FEED_URL_PROJECT_PBM`, `FEED_URL_LP_GORDEN`, `FEED_URL_LP_MENJANGAN`, `FEED_URL_ECOURSE_KA_TSAN`, and `FEED_URL_PROJECT_FULLBRIGHT` on the Board. Defaults live in `config/analytics.php`. Fullbright uses `/ops-analytics/feed` and the Board resolves that HTTPS host to `127.0.0.1` because the public domain is routed through Scalev while its Laravel analytics app shares the Board VPS. Set `FEED_ORIGIN_IP_PROJECT_FULLBRIGHT` if the origin moves. `new-fullbright` deploys to staging.
- Ensure the Laravel scheduler runs on the Board for the five-minute prefetch. On-demand page requests still work if the scheduler is unavailable.
- Rebuild Laravel configuration caches after changing `.env` values.

## Deployment order

1. Deploy the project feed changes and verify each endpoint returns `schema_version: 2` without a header.
2. Deploy the Board changes and open `/analytics?refresh=1`.
3. Check all five API status cards, metrics, chart, routing matrix, referral/UTM lists, and CSV export. The recent-events panel stays hidden because the public feeds contain no individual events.

The Board and Fullbright production workflows deploy on pushes to `main`. Deploy Fullbright first, then Board.

The Board workflow now excludes local SQLite database files from rsync so deployment cannot overwrite the server database. The local `database/database.sqlite` already has unrelated uncommitted changes and should not be staged as part of this rollout.
