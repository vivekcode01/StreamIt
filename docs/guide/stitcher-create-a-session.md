# Create a session

Think of a session as a single playback session for an individual viewer. This requires a `POST` request to `/sessions`, where the body includes parameters for Stitcher to generate a customized playlist. Check the [Stitcher reference](/reference/stitcher) for the different payload options.

Providing input for the stitcher happens in the form of a `uri`. The support uri schemas are:

- **asset://**: we want to greatly simplify how you stitch playlists together. If you use the asset scheme, Superstreamer will know that you mean a package result from within the platform.
- **https://{url}/master.m3u8**: in case you want to use HLS playlists hosted elsewhere, you can use the http(s) scheme.

```sh
curl -X POST
  "https://stitcher.superstreamer.xyz/sessions"

```

::: code-group

```json [Request]
{
  // If your asset is known to Superstreamer API, you can refer to it by assetId:
  "uri": "asset://2d6e6c0e-07d9-48b1-8192-318f32a3b909",

  // OR - if you provide a UUID without scheme, we'll assume it's an assetId:
  "uri": "2d6e6c0e-07d9-48b1-8192-318f32a3b909",

  // OR - an external playlist, like from Mux:
  "uri": "https://stream.mux.video/1b0cd077-965e-4693-b102-37cd6bc32c17/master.m3u8"
}
```

:::

The response includes the new playlist URL, and you can pass this on directly to the player. The UUID in the playlist URL is the `sessionId`. Superstreamer will keep the session in Redis.

```json
{
  "url": "https://stitcher.superstreamer.xyz/sessions/625f68c2-6c09-44d4-a50f-81873cb7839b/master.m3u8"
}
```

The `url` can now be played in any HLS compatible player.