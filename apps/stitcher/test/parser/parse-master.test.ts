import { describe, expect, test } from "bun:test";
import { parseMasterPlaylist } from "../../src/parser";

describe("parse master", async () => {
  test("should parse basic", () => {
    const master = parseMasterPlaylist(`
      #EXTM3U
      #EXT-X-STREAM-INF:BANDWIDTH=240000,RESOLUTION=1080x720
      media1.m3u8
      #EXT-X-STREAM-INF:BANDWIDTH=440000,RESOLUTION=854x480
      media2.m3u8
    `);
    expect(master).toMatchSnapshot();
  });

  test("should parse with groups", () => {
    const master = parseMasterPlaylist(`
      #EXTM3U
      #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud1",LANGUAGE="eng",NAME="English",AUTOSELECT=YES,DEFAULT=YES,URI="a1.m3u8"
      #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud2",LANGUAGE="nld",NAME="Nederlands",AUTOSELECT=YES,DEFAULT=YES,URI="a2.m3u8"
      #EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="sub1",NAME="English",LANGUAGE="eng",DEFAULT=YES,AUTOSELECT=YES,FORCED=NO,URI="s1.m3u8"
      #EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=4664459,BANDWIDTH=4682666,CODECS="avc1.64002a,mp4a.40.2",RESOLUTION=1920x1080,FRAME-RATE=24,AUDIO="aud1",SUBTITLES="sub1"
      media1.m3u8
      #EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=3164759,BANDWIDTH=3170746,CODECS="avc1.640020,mp4a.40.2",RESOLUTION=1280x720,FRAME-RATE=24,AUDIO="aud2",SUBTITLES="sub1"
      media2.m3u8
    `);
    expect(master).toMatchSnapshot();
  });

  test("should parse with audio channels", () => {
    const master = parseMasterPlaylist(`
      #EXTM3U
      #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud1",LANGUAGE="eng",NAME="English",CHANNELS=6,AUTOSELECT=YES,DEFAULT=YES,URI="a1.m3u8"
      #EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=4664459,BANDWIDTH=4682666,CODECS="avc1.64002a,mp4a.40.2",RESOLUTION=1920x1080,FRAME-RATE=24,AUDIO="aud1"
      media1.m3u8
    `);
    expect(master).toMatchSnapshot();
  });

  test("should parse with independent segments", () => {
    const master = parseMasterPlaylist(`
      #EXTM3U
      #EXT-X-INDEPENDENT-SEGMENTS
    `);
    expect(master.independentSegments).toBe(true);
  });
});
