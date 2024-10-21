# Dashboard

The dashboard is a single page application where you can manage a wide variety of functionalities.

- Shows pending, running, completed and failed jobs.
- Inspect a job, with logs, sub processes and many more metrics.
- A storage tab that lets you explore the configured S3 bucket. You can see what kind of playlists are generated, what is uploaded to S3, and more.
- Watch API / Stitcher documentation and call API requests directly from within the dashboard.

Typically, you'd want to build the dashboard once and upload it to S3 to serve it as a static site. The dashboard is an SPA and requires no separate server / backend to function.

Verify you've set the correct variables in `config.env`, each env key prefixed with `PUBLIC_` will be available in the dashboard and will be included in the final Javascript bundle.