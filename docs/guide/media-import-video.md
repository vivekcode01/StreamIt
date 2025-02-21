# Import video

There's two ways to import your video material in Superstreamer. Once you uploaded your video _somewhere_, you have to reference it with the proper scheme in the upcoming API calls and we'll take care of the rest.

## From S3

Upload a video file to your S3 bucket. You can then instruct Superstreamer to start a processing job (eg; transcoding) with the `s3://` scheme.

For example, you've uploaded a `BigBuckBunny.mp4` video to the configured S3 bucket in a folder named `sources`. You can now reference this video by using the `s3://sources/BigBuckBunny.mp4` uri.

```json [Request]
{
  "inputs": [
    {
      "type": "video",
      "path": "s3://sources/BigBuckBunny.mp4"
    },
    // ...
}
```

## From http(s)

A publicly available URL can also be used as a source when starting a processing job.

```json [Request]
{
  "inputs": [
    {
      "type": "video",
      "path": "https://cdn.superstreamer.xyz/source/Sintel.mp4"
    },
    // ...
}
```