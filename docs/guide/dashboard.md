# Dashboard

The dashboard is a single page application where you can manage a wide variety of functionalities. Typically, you'd want to build the dashboard once and upload it to S3 to serve it as a static site. The dashboard is an SPA and requires no separate server / backend to function.

Verify you've set the correct variables in `config.env`, each env key prefixed with `PUBLIC_` will be available in the dashboard and will be included in the final Javascript bundle.

Show pending, running, completed and failed jobs. You can easily inspect a job, with logs, sub processes and other metrics.

<video class="video" muted autoplay controls src="/dashboard-jobs.mp4"></video>

We've got a neat storage tab that lets you explore the configured S3 bucket, as if it was your local hard disk. There's a preview function that lets you inspect readable files such as playlists (m3u8) and more.

<video class="video" muted autoplay controls src="/dashboard-storage.mp4"></video>

A playground for the Stitcher, where you can throw any configuration at it and it'll create a session for you. We've got our player embedded on the right for instant preview.

<video class="video" muted autoplay controls src="/dashboard-stitcher.mp4"></video>

But wait, there's more! We have a page dedicated to the API and the Sticher API. You can read through the Swagger documentation and fire API calls right away. The dashboard is all you need to get started quickly.