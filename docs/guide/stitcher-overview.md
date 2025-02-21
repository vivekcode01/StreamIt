# Overview

Superstreamer comes with a separate project named Stitcher, an HLS playlist manipulator that can insert interstitials on-the-fly. You can use Stitcher to set individual quality limits for each user or to insert advertisements into your content.

## Features

- Insert HLS interstitials manually, either by providing an asset manually (such as a Netflix bumper) or by providing a VAST url (ad insertion).
- Transforms a VMAP into HLS interstitials at the right positions in the stream.
- Replace regions in your stream with personalized playlists (such as replacing adbreaks in a live-to-vod).
- Inserts HLS interstitials based on ad signaling in the playlist. For example, `EXT-X-CUE-OUT`.
- Able to personalize both live and VOD playlists.
- Filtering of renditions, text tracks, subtitle tracks and more.
