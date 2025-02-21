# Transcode & package

Transcoding is the process of converting a video from one format, resolution, or bitrate to another to ensure compatibility across devices and network conditions. 

Packaging, especially in the context of HLS, involves segmenting the transcoded video into chunks, generating playlists (m3u8 files), so it can be efficiently streamed and adapted to different bandwidths.

This page covers key video terminology. We keep it simple, but if you want to dive deeper, check out [howvideo.works](https://howvideo.works/).

## Transcode

We'll begin by sending a `POST` request to the `/jobs/transcode` endpoint of our API. In this request, we'll specify the source files (our available inputs) and define the desired outputs — specifically, HD and Full HD video tracks, along with English audio. Check the [API reference](/reference/api) for the different payload options.

```sh
curl -X POST
  "https://api.superstreamer.xyz/jobs/transcode"

```

::: code-group

```json [Request]
{
  "inputs": [
    {
      "type": "video",
      "path": "https://cdn.superstreamer.xyz/source/video.mp4"
    },
    {
      "type": "audio",
      "path": "https://cdn.superstreamer.xyz/source/video.mp4",
      "language": "eng"
    }
  ],
  "streams": [
    {
      "type": "video",
      "codec": "h264",
      "height": 1080
    },
    {
      "type": "video",
      "codec": "h264",
      "height": 720
    },
    {
      "type": "audio",
      "codec": "aac",
      "language": "eng"
    }
  ]
}
```

:::

Under the hood, Superstreamer kicks off a transcode job to produce the output streams. Once completed, each job is assigned a unique UUID. For example, in this case, the UUID is `46169885-f274-43ad-ba59-a746d33304fd`.

This request above will provide a response containing the jobId:

::: code-group

```json [Response]
{
  "jobId": "transcode_46169885-f274-43ad-ba59-a746d33304fd"
}
```

:::

This UUID serves as a reference for the asset across all interactions with the Superstreamer API.

When the job is done, we have separate video tracks in various quality levels and a single audio track in English. An `Asset` row is now created in the database.

### How it works

<img class="schema" src="/schema-transcode.png" />

1. `POST` a transcode payload to the API.
2. The job is scheduled in Redis.
3. An available Artisan instance will pick up the job and get to work.
4. On completion, Artisan will write all generated video and audio tracks to S3.
5. An `Asset` row is created by the API.

## Package

Our video and audio tracks are stored as separate files. Let's package them into an HLS playlist, which players will use to determine what to load and at which resolution.

We'll send a `POST` request to the `/jobs/package` endpoint of our API, and all we'll have to do is provide the assetId returned by our transcode job. Check the [API reference](/reference/api) for the different payload options.

```sh
curl -X POST
  "https://api.superstreamer.xyz/jobs/package"
```

::: code-group

```json [Request]
{
  "assetId": "46169885-f274-43ad-ba59-a746d33304fd"
}
```

:::

When the job is done, we have an HLS playlist available on our S3 bucket.

```
https://cdn.superstreamer.xyz/package/46169885-f274-43ad-ba59-a746d33304fd/hls/master.m3u8
```

### How it works

<img class="schema" src="/schema-package.png" />

1. `POST` a package payload to the API.
2. The job is scheduled in Redis.
3. An available Artisan instance will download a transcode result and package it.
4. Upon completion, Artisan will write all generated HLS playlists and segments to S3.

## Pipeline

Typically a package job is scheduled right after a transcode job. Superstreamer can do this for you with the `/jobs/pipeline` API. Check the [API reference](/reference/api) for the different payload options.

The pipeline job has sane defaults and is best used if you don't need to heavily customize your transcode and package profiles.

```sh
curl -X POST
  "https://api.superstreamer.xyz/jobs/pipeline"
```

::: code-group

```json [Request]
{
  "inputs": [
    {
      "type": "video",
      "path": "s3://input.mp4"
    },
    {
      "type": "audio",
      "path": "s3://input.mp4",
      "language": "eng"
    }
  ],
  "streams": [
    {
      "type": "video",
      "codec": "h264",
      "height": 1080
    },
    {
      "type": "video",
      "codec": "h264",
      "height": 720
    },
    {
      "type": "audio",
      "codec": "aac",
      "language": "eng"
    }
  ]
}
```

:::