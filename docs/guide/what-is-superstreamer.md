# What is Superstreamer?

Superstreamer is an open-source platform designed to simplify video delivery. It offers the tools you need to easily integrate high-quality video streaming into your applications. 

Our goal is to create a robust, flexible solution that empowers developers, hobbyists, and companies alike to focus on delivering amazing video experiences, similar to how Netflix, YouTube or Vimeo work. 

[Join our community](https://discord.gg/4hXgz9EsF4) and help us make video streaming more accessible together.

## Why?

Delivering video is complicated because there are so many different ways to process, store, and deliver video content. 

You have to deal with things like video quality, file sizes, compatibility across devices, and fast delivery speeds. Right now, there are lots of different tools and approaches, but they don't always work well together. 

Our goal is to focus on just the important basics and make them work perfectly together, using the standards everyone already uses, so it's easier for everyone to create and watch videos.

::: details Our technical mantra

If you're familiar with video engineering, the terms below might sound familiar. We aim to reduce the fragmentation in the field, and we believe we can excel by focusing on a select few aspects and perfecting them.

- HLS as a playlist format, with CMAF containered segments.
- Inserting and playing other playlists, like ads, depends completely on HLS interstitials. Watch Apple's [Intertitials Intro](https://developer.apple.com/videos/play/wwdc2024/10114/#:~:text=With%20HLS%20interstitials%2C%20ads%20or,content's%20Program%2DDate%2DTime.) video announced at WWDC24.
- No VAST on the client, ever. 😜
- Don't reinvent the wheel — leverage the fantastic work of others. If that means making open-source contributions, we're all for it.
:::

## Building blocks

The project is made up of several building blocks, each designed to handle specific tasks in the video streaming process. It's important to know that you don't need to use everything — this isn't an all-or-nothing solution. We want to avoid vendor lock-in, so you're free to pick and choose the building blocks that best fit your needs. 

For example, you can use our tool for real-time video manipulation (like inserting a bumper or ads), while still transcoding and packaging your video files elsewhere, such as using [Mux](https://www.mux.com/) for those steps. 

The flexibility is yours to create the workflow that works best for you.

## Use cases

To users, video seems simple – it just plays, right? But delivering a smooth experience for every viewer is actually quite complex. Video isn't as straightforward as it appears. We're here to take care of the technical challenges and make video delivery easy for you.

- Optimize for speed and quality

  Need your videos to load faster and look great? Superstreamer makes sure your videos play quickly and at the best quality, no matter the device. Do your viewers have unpredictable or slow internet? [Transcoding](/guide/video-processing#start-a-transcode) can adjust the video quality so it still plays smoothly without buffering.

- Convert to different formats

  Want to play your video on any device? [Transcoding](/guide/video-processing#start-a-transcode) changes your video to the right format so everyone can watch it, in different qualities depending on the viewer' bandwidth.

- Package for streaming

  Ready to show your video online? [Package](/guide/video-processing#start-a-package) your video so it streams smoothly to your viewers, no matter where they are.


- Monetize your content
  
  In need of on the fly ad insertion? [Stitching]() lets you add ads at the perfect moment to earn revenue while keeping the viewer engaged.

- Filter your playout

  Want to limit playout? [Stitching]() filters quality and text tracks by language, enabling you to tailor a playout for a specific audience.

- Client streaming library

  Need a simplified way to work with [HLS.js](https://github.com/video-dev/hls.js)? Our player facade makes it super simple to integrate streaming into your project, without dealing with complex video library code.