# Storage

Our storage is primarily designed around S3 (or S3 compliant alternatives). Superstreamer uses the local filesystem temporary, for downloading files, for transcode purposes, ... Once a job is finished, the temporary files will be removed.

Files are pushed to S3 with an ACL of `private`, there's one exception and that's the `package` job, where the ACL is set to `public-read` internally. You can change this with the `public` flag in a pipeline or package job.

Use a CDN instead of serving your video files (HLS playlists) directly from S3.

## Caveats

- On Backblaze B2, I get an "Unsupported value for canned acl 'public-read'" error.
  - B2 requires file uploads to be private, you must set `public` to `false` for a pipeline or package job.