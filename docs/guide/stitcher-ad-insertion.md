# Ad insertion

The stitcher offers a wide range of features for inserting advertisements into a video stream, whether for VOD or live content.

## VMAP

VMAP (Video Multiple Ad Playlist) is an XML-based specification that defines how multiple ad breaks can be inserted into a video stream. Instruct Stitcher to add interstitials based on VMAP definitions. Each VMAP contains one or more ad break elements with a position of where the interstitial should be.

In the example below, we'll use a sample VMAP from [Google IMA](https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/tags).

::: code-group

```json [Request]
{
  "uri": "asset://f7e89553-0d3b-4982-ba7b-3ce5499ac689",
  "vmap": {
    "url": "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpost&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&impl=s&cmsid=496&vid=short_onecue&correlator="
  }
}
```

:::

Stitcher will perform a couple of actions behind the scenes:

- Fetches the VMAP. Parses, resolves and flattens each corresponding VAST. For each ad that has not yet been transcoded, it'll start a transcode and package job with sane defaults.
- Each transcode or package job responsible for an ad is tagged with ad and can be observed in the dashboard.
- For each ad break that is available, it'll add an interstitial so that players can play the ad.

## VAST

VAST (Video Ad Serving Template) is an XML-based standard that enables video players to communicate with ad servers. It provides instructions on how to display video ads, including details like the ad creative URL, tracking events, duration, and more. Superstreamer makes inserting one or more VAST ads at defined times in the stream easy.

In the example below, we'll use a sample VAST from [Google IMA](https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/tags), and insert it as a preroll.


::: code-group

```json [Request]
{
  "uri": "asset://f7e89553-0d3b-4982-ba7b-3ce5499ac689",
  "interstitials": [
    {
      "time": 0,
      "vast": {
        "url": "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator="
      }
    }
  ]
}
```

:::

## In stream signaling

Take the following playlist, we'll use the URL of this playlist as the `uri` input in the stitcher. Notice the `EXT-X-CUE-OUT` and `EXT-X-CUE-IN` tags? Superstitcher will replace these with an interstitial, matching the right duration. The cue is 5 seconds in duration, this info can be used to request 5 seconds of ads to an ad server.

This is a common technique to replace linear ad breaks in a live, broadcast, stream.

::: code-group

``` [playlist.m3u8]
#EXTM3U
#EXT-X-VERSION:8
#EXT-X-TARGETDURATION:2
#EXTINF:2
video_1080_h264/40.m4s
#EXTINF:2
video_1080_h264/41.m4s
#EXTINF:1.4
video_1080_h264/42.m4s
#EXT-X-CUE-OUT:DURATION=5
#EXTINF:2
video_1080_h264/43.m4s
#EXTINF:2
video_1080_h264/44.m4s
#EXTINF:1
video_1080_h264/45.m4s
#EXT-X-CUE-IN
#EXTINF:2
video_1080_h264/46.m4s
```

:::

::: code-group

```json [Request]
{
  "uri": "https://example.com/live-stream/ca66c6d4-65fc-46e3-8a9c-60901f5b485e/master.m3u8",
  "vast": {
    "url": "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=&duration={duration}"
  }
}
```

:::

We configured a generic VAST ad server, and added a new query parameter to the URL named `duration`. For each cue, the ad server will be called with the duration of the cue. This allows ad servers to return up to max. the amount of ads.

## Ad replacement

If your source contains linear ad breaks, you might want to replace them with personalized ads. Specify a `duration` to each asset in the interstitial assets list and Superstreamer will treat it as a replacement. In the example below, we'll replace a linear ad break, in the source, from 10 to 20 seconds with ads served by an ad server.

::: code-group

```json [Request]
{
  "uri": "asset://4588d0f0-5054-41e6-ac05-010087eb60d8",
  "interstitials": [
    {
      "time": 10,
      "duration": 10,
      "vast": {
        "url": "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator="
      }
    }
  ]
}
```

:::