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

For VOD, with replacement (ad replacement)

```
|-------X####----|
0       20  30
```

The interstitial structure is:

- DURATION: 10
- RESUME-OFFSET: 10 (equal to the duration)
- No PLAYOUT-LIMIT (ad server decides)

Due to the DURATION tag, HLS.js treats the linear ad breaks as if they are not there in the first place. Unless we add CUE=ONCE (although we probably should never add ONCE in this case).

For live, with replacement (ad replacement)

```
|-------X####---->
0       20  30
```

The interstitial structure is:

- No DURATION
- RESUME-OFFSET: 10 (equal to the duration)
- PLAYOUT-LIMIT: 10 (equal to the duration)

## Questions

- What when we seek over an interstitial, and we want to end up to the original seek target time? How does a dynamic resume offset work? Can this be a seek when the interstitial ended?
- What with (pre)buffering of the primary content in the case above?