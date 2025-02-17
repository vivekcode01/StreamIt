# What's included

Superstreamer is a monorepo, with multiple smaller projects inside. We'll provide a quick overview of the service, apps and libraries below to give you a sense of what each one does.

## Backend

<div class="package">
  <h3>API <img src="/icon-api.svg" /></h3>
  <p>
    The API serves as the primary interface for interacting with Superstreamer, such as start tasks like transcoding or packaging jobs. An OpenAPI structure is exposed on the /openapi endpoint.
  </p>
   <div style="display: flex; gap: 1rem;">
    <a href="https://hub.docker.com/r/superstreamerapp/api" target="_blank">
      <img src="/button-dockerhub.webp" style="max-height: 1.5rem; width: 100%;" />
    </a>
    <a href="https://github.com/superstreamerapp/superstreamer/tree/main/apps/api" target="_blank">
      <img src="/icon-github.svg" style="max-height: 1.5rem; width: 100%;" />
    </a>
  </div>
</div>

<div class="package">
  <h3>Artisan <img src="/icon-transcode.svg" /> <img src="/icon-package.svg" /></h3>
  <p>
    The actual job runners, these run in the background and consume whatever job API has scheduled next. Artisan instructs ffmpeg to run, or packages a previously transcoded asset to an HLS playlist and syncs it all to S3.
  </p>
   <div style="display: flex; gap: 1rem;">
    <a href="https://hub.docker.com/r/superstreamerapp/artisan" target="_blank">
      <img src="/button-dockerhub.webp" style="max-height: 1.5rem; width: 100%;" />
    </a>
    <a href="https://github.com/superstreamerapp/superstreamer/tree/main/apps/artisan" target="_blank">
      <img src="/icon-github.svg" style="max-height: 1.5rem; width: 100%;" />
    </a>
  </div>
</div>

<div class="package">
  <h3>Stitcher <img src="/icon-stitcher.svg" /></h3>
  <p>
    Also referred to as a "playlist manipulator", Stitcher can create a session for each user and generate a custom HLS playlist tailored to their needs, including resolution filtering and the addition of bumpers or linear ads. The stitcher has its own API.  An OpenAPI structure is exposed on the /openapi endpoint.
  </p>
  <div style="display: flex; gap: 1rem;">
    <a href="https://hub.docker.com/r/superstreamerapp/stitcher" target="_blank">
      <img src="/button-dockerhub.webp" style="max-height: 1.5rem; width: 100%;" />
    </a>
    <a href="https://github.com/superstreamerapp/superstreamer/tree/main/apps/stitcher" target="_blank">
      <img src="/icon-github.svg" style="max-height: 1.5rem; width: 100%;" />
    </a>
  </div>
</div>

## Frontend

<div class="package">
  <h3>App <img src="/icon-app.svg" /></h3>
  <p>
    A Single Page Application (SPA) used to interact with the API or start a session on the Stitcher service.
  </p>
   <div style="display: flex; gap: 1rem;">
    <a href="https://hub.docker.com/r/superstreamerapp/app" target="_blank">
      <img src="/button-dockerhub.webp" style="max-height: 1.5rem; width: 100%;" />
    </a>
    <a href="https://github.com/superstreamerapp/superstreamer/tree/main/apps/app" target="_blank">
      <img src="/icon-github.svg" style="max-height: 1.5rem; width: 100%;" />
    </a>
  </div>
</div>

<div class="package">
  <h3>Player <img src="/icon-player.svg" /></h3>
  <p>
    The player facade simplifies HLS.js with an intuitive API for building the player. It offers player-friendly methods, supports plugins, and provides React hooks for efficient state management.
  </p>
   <div style="display: flex; gap: 1rem;">
    <a href="https://www.npmjs.com/package/@superstreamer/player" target="_blank">
      <img src="/button-npm.webp" style="max-height: 1.5rem; width: 100%;" />
    </a>
    <a href="https://github.com/superstreamerapp/superstreamer/tree/main/packages/player" target="_blank">
      <img src="/icon-github.svg" style="max-height: 1.5rem; width: 100%;" />
    </a>
  </div>
</div>