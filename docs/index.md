---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: Superstreamer
  text: Effortless video
  tagline: All-in-one toolkit from ingest to adaptive video playback.
  actions:
    - theme: brand
      text: Introduction
      link: /guide/what-is-superstreamer
    - theme: alt
      text: Getting Started
      link: /guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/matvp91/superstreamer
  image:
    src: /logo-mascotte.png
    alt: VitePress

features:
  - title: Transcode
    details: Converting a video file from one format or codec to another, at scale.
    icon: 
      src: /icon-transcode.svg
      width: 45
  - title: Package
    details: Prepare and organize video files for delivery and playback. Upload directly to S3.
    icon: 
      src: /icon-package.svg
      width: 40
  - title: Stitcher
    details: Manipulate and craft HLS playlists on the fly, supports HLS interstitials.
    icon: 
      src: /icon-stitcher.svg
      width: 54
  - title: Player
    details: A unified <a href="https://github.com/video-dev/hls.js">HLS.js</a> API and React components that integrate seamlessly.
    icon: 
      src: /icon-player.svg
      width: 37
---