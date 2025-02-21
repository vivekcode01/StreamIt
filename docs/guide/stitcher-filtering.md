# Filtering

You can apply filters, such as limit the different resolutions. Filters can apply to both the master as the media playlist.

## Resolution

When streaming over networks with limited bandwidth (eg; mobile networks), removing higher-bitrate renditions can help prevent buffering issues or excessive data usage, or if you want to serve a specific set of users with a lower resolution.

::: code-group

```json [Request]
{
  "uri": "asset://f7e89553-0d3b-4982-ba7b-3ce5499ac689",
  "filter": {
    // Remove all renditions with a height lower or equal than 480.
    "resolution": "<= 480"
  }
}
```

:::

## Audio language

::: code-group

```json [Request]
{
  "uri": "asset://f7e89553-0d3b-4982-ba7b-3ce5499ac689",
  "filter": {
    // Keep only English and Dutch as audio track.
    "audioLanguage": "eng, nld"
  }
}
```

:::