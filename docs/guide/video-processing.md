# Video processing

To work with video, the first step is to upload your assets into the system. For instance, if you have an MP4 file as your source, we can use the transcode API to process it. This is typically the first step.

## Why transcode?

There's reasons why we would transcode an input file. We'll explain them briefly.

- **Compatibility**
  
  Ensure the video format works across various devices and platforms.

- **Quality**

  Adjust resolution and bitrate for optimal playback quality based on user devices and network conditions.

- **Compression**

  Decrease file size for easier storage and faster uploads/downloads.

- **Streaming**
  
  Enable adaptive streaming by creating multiple resolutions for different bandwidths. Players can then pick what works for the user based on bandwidth estimations.

## Start a transcode job

When you schedule a transcode job with the API, a unique UUID is assigned to each asset. We'll call this the `assetId` from now on. Each asset can be referenced to by providing this id in further steps.

::: tip

Video transcoding is the process of converting video, audio and text from one format to another. This involves changing the file's encoding to make it compatible with different devices, reduce its size, or adjust its quality.

:::

::: code-group

```sh [Terminal]
$ curl -X POST https://api-superstreamer.domain.com/transcode
  -H "Content-Type: application/json"
  -d "{body}" 
```

:::

This is a body payload for the `BigBuckBunny.mp4` file we've uploaded to our S3 bucket, as specified in the config.env file. The source file contains a video and audio track. We've also uploaded a `BigBuckBunnyEng.vtt` file that contains the subtitles.

```json
{
  "inputs": [
    // Describe video input
    {
      "path": "s3://source/BigBuckBunny.mp4",
      "type": "video"
    },
    // Describe audio input
    {
      "path": "s3://source/BigBuckBunny.mp4",
      "type": "audio",
      "language": "eng"
    },
    // Describe text input
    {
      "path": "s3://source/BigBuckBunnyEng.vtt",
      "type": "text",
      "language": "eng"
    }
  ],
  "streams": [
    // We'd like to produce a HEVC encoded video stream.
    {
      "type": "video",
      "codec": "hevc",
      "height": 720,
      "bitrate": 4000000,
      "framerate": 24
    },
    // And an h264 encoded video stream, at a lower resolution.
    {
      "type": "video",
      "codec": "h264",
      "height": 480,
      "bitrate": 1500000,
      "framerate": 24
    },
    // We'd like to create an audio stream, aac codec with 2 channels.
    // If our source was 6 channels (surround), we'd be able to pass 6 here too.
    {
      "type": "audio",
      "codec": "aac",
      "bitrate": 128000,
      "language": "eng",
      "channels": 2
    },
    // We want an "English" text track.
    {
      "type": "text",
      "language": "eng"
    }
  ],
  // We'll define the segment size upfront, this will be used for packaging purposes.
  "segmentSize": 2,
}
```

The result of the transcode job will be an `assetId`, this is a unique UUID that identifies a transcode result. From now on, we'll only work with this id. Eg; if you want to package this transcode result, all we'll have to do is provide this id.

```json
{
  "assetId": "2d6e6c0e-07d9-48b1-8192-318f32a3b909"
}
```

Let's quickly go over the steps that the transcode process did:

- Download, or stream, the input file directly to ffmpeg.
- Store the outcome on hard disk temporarily.
- Upload the transcoded media file to S3.

And it'll do these steps for each output stream separately. If you scale Artisan horizontally, it'll pick up each ffmpeg job individually across different machines and get to work. 

That's great and all, but what do we do with the result of a transcode job? A transcode result is not playable by definition. We'll use the transcode result to package our asset into an HLS playlist.

## Start a package job

Now that we have transcoded our input file(s), we'll prepare them for streaming.

::: tip

Video packaging refers to the process of preparing a video file for delivery and consumption by users across different devices and platforms.

:::

We split the transcoding and packaging processes into two separate steps (API calls). This allows you to generate various packaging outputs from a single transcoding result. For instance, you can create both a DRM-protected and a standard HLS playlist from the same transcoded asset. By separating these steps, we avoid the need to re-transcode our assets, which is usually resource-intensive and can heavily utilize your CPU (and sometimes GPU). In contrast, packaging is a relatively light task.

::: code-group

```sh [Terminal]
$ curl -X POST https://api-superstreamer.domain.com/package
  -H "Content-Type: application/json"
  -d "{body}" 
```

:::

All we'll have to do is instruct the packager to package a given `assetId`. When no transcode result is found for the given id, an error will be thrown.

```json
{
  "assetId": "2d6e6c0e-07d9-48b1-8192-318f32a3b909"
}
```

A package job runs the following steps:

- Download all transcode results from S3 to local hard disk.
- Package all different streams into an HLS playlist.
- Upload the playlists, and the segments, back to S3 in the `/package` folder.

If you've properly configured config.env, your asset is now available for playback at the following URL:

```
{PUBLIC_S3_ENDPOINT}/package/2d6e6c0e-07d9-48b1-8192-318f32a3b909/hls/master.m3u8
```

And tada, you now have a playable asset that can be played with HLS.js! 🎉 🥳

Give it a try and play your asset in the HLS.js demo page: https://hlsjs.video-dev.org/demo/