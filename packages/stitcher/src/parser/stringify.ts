import type { MasterPlaylist, MediaPlaylist } from "./types";

export function stringifyMasterPlaylist(playlist: MasterPlaylist) {
  const lines: string[] = [];

  lines.push("#EXTM3U", "#EXT-X-VERSION:8");

  if (playlist.independentSegments) {
    lines.push("#EXT-X-INDEPENDENT-SEGMENTS");
  }

  playlist.renditions.forEach((rendition) => {
    const attrs = [
      `TYPE=${rendition.type}`,
      `GROUP-ID="${rendition.groupId}"`,
      `NAME="${rendition.name}"`,
    ];
    if (rendition.language) {
      attrs.push(`LANGUAGE="${rendition.language}"`);
    }
    if (rendition.uri) {
      attrs.push(`URI="${rendition.uri}"`);
    }
    if (rendition.channels) {
      attrs.push(`CHANNELS="${rendition.channels}"`);
    }
    lines.push(`#EXT-X-MEDIA:${attrs.join(",")}`);
  });

  playlist.variants.forEach((variant) => {
    const attrs = [`BANDWIDTH=${variant.bandwidth}`];
    if (variant.codecs) {
      attrs.push(`CODECS="${variant.codecs}"`);
    }
    if (variant.resolution) {
      attrs.push(
        `RESOLUTION=${variant.resolution.width}x${variant.resolution.height}`,
      );
    }
    if (variant.audio) {
      if (
        !playlist.renditions.find(
          (rendition) =>
            rendition.type === "AUDIO" && rendition.groupId === variant.audio,
        )
      ) {
        return;
      }
      attrs.push(`AUDIO="${variant.audio}"`);
    }
    if (variant.subtitles) {
      if (
        !playlist.renditions.find(
          (rendition) =>
            rendition.type === "SUBTITLES" &&
            rendition.groupId === variant.subtitles,
        )
      ) {
        return;
      }
      attrs.push(`SUBTITLES="${variant.subtitles}"`);
    }
    lines.push(`#EXT-X-STREAM-INF:${attrs.join(",")}`);
    lines.push(variant.uri);
  });

  return lines.join("\n");
}

export function stringifyMediaPlaylist(playlist: MediaPlaylist) {
  const lines: string[] = [];

  lines.push(
    "#EXTM3U",
    "#EXT-X-VERSION:8",
    `#EXT-X-TARGETDURATION:${playlist.targetDuration}`,
  );

  if (playlist.independentSegments) {
    lines.push("#EXT-X-INDEPENDENT-SEGMENTS");
  }

  if (playlist.mediaSequenceBase) {
    lines.push(`#EXT-X-MEDIA-SEQUENCE:${playlist.mediaSequenceBase}`);
  }

  if (playlist.discontinuitySequenceBase) {
    lines.push(
      `#EXT-X-DISCONTINUITY-SEQUENCE:${playlist.discontinuitySequenceBase}`,
    );
  }

  if (playlist.playlistType) {
    lines.push(`#EXT-X-PLAYLIST-TYPE:${playlist.playlistType}`);
  }

  playlist.segments.forEach((segment) => {
    if (segment.map) {
      const attrs = [`URI="${segment.map.uri}"`];
      lines.push(`#EXT-X-MAP:${attrs.join(",")}`);
    }

    if (segment.discontinuity) {
      lines.push(`#EXT-X-DISCONTINUITY`);
    }

    if (segment.programDateTime) {
      lines.push(`#EXT-X-PROGRAM-DATE-TIME:${segment.programDateTime.toISO()}`);
    }

    let duration = segment.duration.toFixed(3);
    if (duration.match(/\./)) {
      duration = duration.replace(/\.?0+$/, "");
    }
    lines.push(`#EXTINF:${duration}`);

    lines.push(segment.uri);
  });

  if (playlist.endlist) {
    lines.push(`#EXT-X-ENDLIST`);
  }

  playlist.dateRanges.forEach((dateRange) => {
    const attrs = [
      `ID="${dateRange.id}"`,
      `CLASS="${dateRange.classId}"`,
      `START-DATE="${dateRange.startDate.toISO()}"`,
    ];

    if (dateRange.clientAttributes) {
      const entries = Object.entries(dateRange.clientAttributes);
      for (const [key, value] of entries) {
        if (typeof value === "string") {
          attrs.push(`X-${key}="${value}"`);
        }
        if (typeof value === "number") {
          attrs.push(`X-${key}=${value}`);
        }
      }
    }

    lines.push(`#EXT-X-DATERANGE:${attrs.join(",")}`);
  });

  return lines.join("\n");
}
