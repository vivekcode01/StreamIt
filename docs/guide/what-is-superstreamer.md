# What is Superstreamer?

Superstreamer is here to make video delivery simple. Imagine having everything you need in one platform — starting with your raw video, Superstreamer helps you transcode it, package it into HLS playlists, and upload it to S3 with ease. You can even create custom playlists for each viewer, adding bumpers, ads, or filters on the fly.

When it’s time for your audience to watch, Superstreamer’s elegant web player ensures your videos are delivered smoothly and look great on any device. It takes the hassle out of streaming, so viewers can enjoy your content without any interruptions.

There are plenty of great video tools out there, but we saw a gap — a unified platform to bring all those tools together. Our mission with Superstreamer is to make video more accessible for developers, letting them focus on their projects without getting bogged down by the technical details.

::: info
Can't wait? Head over to our [Getting Started](/guide/getting-started) page and jump right into it!
:::

::: tip

Check out these cool screen recordings of the dashboard app! Click <a target="_blank" href="/superstreamer/guide/dashboard">here</a> to view them. The link will open in a new tab, so you won't lose your place.

:::

## How it works

Everyone loves schemas, and we’re no exception. Let’s break down how Superstreamer works and how all the packages are interconnected.

You’ve got an epic video file named <Badge type="info" text="Frames_Of_Thrones.mp4" />. It’s hefty, and you want to deliver it to your audience with a seamless viewing experience, complete with subtitle options in various languages. Your goal is to provide the best possible experience for your viewers.

### Step 1. Transcode 

<img class="schema" src="/schema-transcode.png" />

<details class="details custom-block minimal">
  <summary>Explain this to me</summary>

  1. You send a transcode request to the API using your file or s3 URL as the input, along with a few output stream definitions.
  2. The API will push a transcode job to Redis.
  3. One, or multiple (if you're into scale), Artisan instances will grab jobs from Redis, and produce outputs streams locally.
  4. Each Artisan instance will push their output stream to S3.
  5. Finally, the API will assign a unique Asset ID to the process, allowing us to continue working with it.
</details>

### Package

So, we've taken our original video, sliced it up into different qualities, bitrates — event threw in some subtitles and a surround sound track for good measure. Awesome, right? Well... now we’ve got a bunch of separate files hanging out on S3. We need to bundle these up so the video player can actually make sense of the mess.

<img class="schema" src="/schema-package.png" />

<details class="details custom-block minimal">
  <summary>Explain this to me</summary>

  1. You send a package request to the API with the Asset ID from the transcode process.
  2. The API will push a package job to Redis.
  3. An Artisan instance will download the transcoded files and generate an HLS playlist along with the video segments locally.
  4. The HLS master playlist, media playlists and segments are uploaded to S3 with public permissions.
</details>

### Playback

Alright, we’ve got our HLS playlist sitting in the S3 bucket. You could hit play and call it a day, sure, but where’s the fun in that? Like, we've got this NotFlix bumper — _tuduuuum_ — and we want to slap it right in front of our Frames of Thrones masterpiece. So, what do we do? We transcode and package that bumper, then tell our stitcher to whip up a new playlist on the fly, combining our bumper with the main content. Boom — playlist magic! 🪄

<img class="schema schema-stitcher" src="/schema-stitcher.png" />

<details class="details custom-block minimal">
  <summary>Explain this to me</summary>

  1. You send a session request to the Sticher API, with the Asset ID from the transcode (or package, they're the same) process, along with your parameters (eg; ad insertion, bumper, ...)
  2. Stitcher will prepare a unique playlist for this session, which the player downloads.
  3. The player can now play the video, it will grab the rest (such as segments) from S3 directly.
</details>

### Monitor

<img class="schema schema-dashboard" src="/schema-dashboard.png" />

We'd like to keep an eye on what Superstreamer is up to behind the scenes. Don’t worry, we’ve got a handy little app we call the dashboard. It’s like a reality show for your jobs — complete with a list that shows all the action, including status updates and how long everything takes.

And if you're feeling ambitious and want to integrate Superstreamer into your own project (which, let’s face it, if you're in the video biz, you absolutely should try), interacting with the API from your backend is a walk in the park.

## Developer Experience

- **Simplified workflow**

  Handling video at scale involves multiple steps: ingesting source files, transcoding them into various formats, packaging for different devices, and ensuring smooth delivery. Superstreamer streamlines these steps into a unified workflow.

- **Scalability**

  Video platforms often need to serve content to large, diverse audiences, which requires infrastructure that can handle spikes in traffic and support multiple video formats. Superstreamer can be scaled horizontally due to a built-in queue / worker architecture and works great with any S3 compliant storage.

- **Customization and Personalization**

  Modern video platforms often need to deliver personalized content, such as inserting targeted ads, bumpers, or even dynamically altering playlists based on user behavior. Superstreamer is built for these needs and can handle the real-time processing required to customize video streams.

- **Cost Efficiency**

  Building and maintaining a full-scale video pipeline can be resource-intensive. Fortunately, Superstreamer isn’t tied to a single vendor, allowing you the freedom to choose the most effective and cost-efficient strategies for your media setup.

## Core Standards

We believe in sticking to the tried-and-true standards that make video delivery easier for everyone. By using common formats like H.264, HEVC, AAC, EC-3, ... and streaming methods like HLS, we make sure our platform works smoothly across all devices. When it comes to ads, we stick to IAB VAST for placements, which helps us connect easily with different advertising networks.

Video is already a pretty fragmented space. By sticking to our standards, we aim to cut through that confusion and make things more straightforward. When you don’t have to tackle everything at once, it’s much easier to strive for perfection. That’s why we made these thoughtful choices:

- HLS as a playlist format, with CMAF containered segments.
- Inserting and playing other playlists, like ads, depends completely on [HLS interstitials](https://developer.apple.com/streaming/GettingStartedWithHLSInterstitials.pdf).
- No VAST on the client, ever. 😜
- Don’t reinvent the wheel — leverage the fantastic work of others. If that means making open-source contributions, we’re all for it.