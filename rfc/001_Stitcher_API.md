# Stitcher API

For VOD, without replacement (ad insertion)

```
|-------X-------|
0       20
```

The interstitial structure is:

- No DURATION
- RESUME-OFFSET: 0
- No PLAYOUT-LIMIT (ad server decides)

Extra:

- When we seek over an interstitial, we trigger the interstitial.

For VOD, with replacement (ad replacement)

```
|-------X####----|
0       20  30
```

The interstitial structure is:

- DURATION: 10
- RESUME-OFFSET: 10 (equal to the duration)
- No PLAYOUT-LIMIT (ad server decides)

Extra:

- When we seek over the interstitial, we trigger the interstitial.
- When assets are empty, we skip the interstitial duration, as if an embedded break is not there.

Due to the DURATION tag, HLS.js treats the linear ad breaks as if they are not there in the first place. Unless we add CUE=ONCE (although we probably should never add ONCE in this case).

When the embedded break is 10 seconds in length, we should build a UI that excludes this range. When the stream is 40s in duration, the duration shown in the UI should be 30. Does this relate to `interstitialsManager.primary`?

For live, with replacement (ad replacement)

```
|-------X####---->
0       20  30
```

The interstitial structure is:

- No DURATION
- RESUME-OFFSET: 10 (equal to the duration)
- PLAYOUT-LIMIT: 10 (equal to the duration)

Extra:

- When we seek over a break, we should always play the interstitial and resume after the linear break. This applies when the break's end is in the past (the same logic as previous "ad replacement for VOD").
- When we go back to live, we could theoretically end up in an interstitial.

## Questions

- What when we seek over an interstitial, and we want to end up to the original seek target time? How does a dynamic resume offset work? Can this be a seek when the interstitial ended?
- What with (pre)buffering of the primary content in the case above?