import { describe, expect, test } from "bun:test";
import { parseMediaPlaylist } from "../../src/parser";

describe("parse media", async () => {
  test("should parse basic", () => {
    const media = parseMediaPlaylist(`
      #EXTM3U
      #EXT-X-PLAYLIST-TYPE:VOD
      #EXT-X-TARGETDURATION:10
      #EXTINF:10
      1.m4s
      #EXTINF:10
      2.m4s
      #EXTINF:4.5
      3.m4s
      #EXT-X-ENDLIST
    `);
    expect(media).toMatchSnapshot();
  });

  test("should parse without endlist", () => {
    const media = parseMediaPlaylist(`
      #EXTM3U
      #EXT-X-TARGETDURATION:10
      #EXTINF:5
      1.m4s
    `);
    expect(media.endlist).toBe(false);
  });

  test("should parse with discontinuity", () => {
    const media = parseMediaPlaylist(`
      #EXTM3U
      #EXT-X-TARGETDURATION:4
      #EXTINF:4
      1.m4s
      #EXTINF:4
      #EXT-X-DISCONTINUITY
      2.m4s
      #EXTINF:4
      3.m4s
    `);
    expect(media.segments[1]?.discontinuity).toBe(true);
  });

  test("should parse program datetime", () => {
    const media = parseMediaPlaylist(`
      #EXTM3U
      #EXT-X-TARGETDURATION:4
      #EXTINF:4
      1.m4s
      #EXTINF:4
      #EXT-X-PROGRAM-DATE-TIME:2025-06-22T09:20:26.166-04:00
      2.m4s
      #EXTINF:4
      3.m4s
    `);
    expect(media.segments[1]?.programDateTime).toMatchSnapshot();
  });
});
