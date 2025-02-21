# Overview

A first step is to get video into Superstreamer. This typically involves uploading a video, instructing Superstreamer to transcode that video into multiple quality tracks and have it packaged into a format that video players understand.

Before we dive deeper, there's a bit of terminology to learn.

- **Asset**
  
  Each transcode result will be registered as an asset in the API's database. Think of an asset as a video with metadata.

- **Playable**: 

  An asset is not playable by default, it must first be packaged into an HLS playlist. A package result will register a playable for that particular asset.

- **Job**:

  A pending, running or failed process, they can be created with the API, such as a transcode, package or pipeline job.
