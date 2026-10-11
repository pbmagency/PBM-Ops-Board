# Analytics feed rollout

The Board dashboard reads version 2 of `/api/analytics/feed` from four project sites. Each project uses its own analytics database for its local dashboard, A/B Labs, and feed. The Board caches each feed for five minutes; Refresh bypasses the cache. Its hourly event batch is no longer scheduled. The CSV export now contains routing performance from the same feeds.

## Required production configuration

- The four feed endpoints are public read-only GET APIs with aggregate analytics only. Visitor session IDs and individual events are excluded. The Board's legacy batch-write endpoint remains protected separately.
- Check `FEED_URL_PROJECT_PBM`, `FEED_URL_LP_GORDEN`, `FEED_URL_LP_MENJANGAN`, and `FEED_URL_ECOURSE_KA_TSAN` on the Board. Defaults live in `config/analytics.php`. The Menjangan Laravel site is `menjangansnorkelingtripanddiving.com`; `menjanganislandtrip.com` is a separate WordPress site.
- Ensure the Laravel scheduler runs on the Board for the five-minute prefetch. On-demand page requests still work if the scheduler is unavailable.
- Rebuild Laravel configuration caches after changing `.env` values.

## Deployment order

1. Deploy the four project feed changes and verify each endpoint returns `schema_version: 2` without a header.
2. Deploy the Board changes and open `/analytics?refresh=1`.
3. Check all four API status cards, metrics, chart, routing matrix, referral/UTM lists, and CSV export. The recent-events panel stays hidden because the public feeds contain no individual events.

All five `deploy.yml` workflows deploy on pushes to `main`, so do not push Board changes before the project feeds are ready. The Board and Project PBM use VPS2 workflows; LP Gorden and Ecourse use VPS1 workflows; LP Menjangan uses FTP deployment.

The Board workflow now excludes local SQLite database files from rsync so deployment cannot overwrite the server database. The local `database/database.sqlite` already has unrelated uncommitted changes and should not be staged as part of this rollout.
