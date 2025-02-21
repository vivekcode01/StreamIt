# Overview

A first step is to get video into Superstreamer. This typically involves uploading a video, instructing Superstreamer to transcode that video into multiple quality tracks and have it packaged into a format that video players understand.

## Features

- Use as [API](/reference/api) or with the [Dashboard](/guide/media-dashboard).
- Manage your assets.
- A playground for [Stitcher](/guide/stitcher-overview) where you can create sessions to personalize playback.
- View pending, running or failed jobs, such as transcode, package, ...
- View your S3 storage.

## Terminology

- **Asset**: each transcode result will be registered as an asset in the API's database. Think of an asset as a video with metadata.
- **Playable**: an asset is not playable by default, it must first be packaged into an HLS playlist. A package result will register a playable for that particular asset.
- **Job**: a pending, running or failed process, they can be created with the API, such as a transcode, package or pipeline job.
