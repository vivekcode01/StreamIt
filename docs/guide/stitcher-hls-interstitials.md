# HLS interstitials

Let's say you transcoded and packaged a new asset, a bumper for example. We'll add it as an interstitial. An HLS interstitials supported player will then switch to the new asset at position 10 and when finished, it'll go back to the primary content.

::: code-group

```json [Request]
{
  "uri": "asset://f7e89553-0d3b-4982-ba7b-3ce5499ac689",
  "interstitials": [
    {
      "time": 10,
      "assets": [
        {
          "uri": "asset://abbda878-8e08-40f6-ac8b-3507f263450a"
        }
      ]
    }
  ]
}
```

:::

If you'd like to add a bumper, you'd insert an interstitial at position 0.