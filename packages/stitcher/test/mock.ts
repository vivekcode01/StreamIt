import { DateTime } from "luxon";
import type { MasterPlaylist, MediaPlaylist } from "../src/parser";
import type { Session } from "../src/session";
import type { Interstitial } from "../src/types";

export function mockMaster(): MasterPlaylist {
  return {
    variants: [
      {
        uri: "video.m3u8",
        bandwidth: 1000,
        audio: [
          {
            type: "AUDIO",
            groupId: "group_1",
            name: "audio_1",
            uri: "audio.m3u8",
          },
        ],
        subtitles: [
          {
            type: "SUBTITLES",
            groupId: "group_1",
            name: "subtitles_1",
            uri: "subtitles.m3u8",
          },
        ],
      },
    ],
  };
}

export function mockMediaWithRelSeg(): MediaPlaylist {
  return {
    targetDuration: 2,
    endlist: true,
    segments: [
      {
        uri: "seg1.mp4",
        duration: 2,
        map: {
          uri: "init.mp4",
        },
      },
      {
        uri: "seg2.mp4",
        duration: 1.5,
      },
    ],
    dateRanges: [],
  };
}

export function mockMediaWithAbsSeg(): MediaPlaylist {
  return {
    targetDuration: 2,
    endlist: true,
    segments: [
      {
        uri: "https://mock-absolute.com/video_1/seg1.mp4",
        duration: 2,
        map: {
          uri: "https://mock-absolute.com/video_1/init.mp4",
        },
      },
    ],
    dateRanges: [],
  };
}

export function mockSession(): Session {
  return {
    id: "36bab417-0952-4c23-bdf0-9a424e4651ad",
    url: "http://mock.com/master.m3u8",
    expiry: 3600,
    startTime: DateTime.now(),
    interstitials: [],
  };
}

export function mockSessionWithInterstitials(): Session {
  const session = mockSession();

  const startDate = DateTime.now();

  session.interstitials = [
    {
      dateTime: startDate,
      vastUrl: "https://mock.com/vast.xml",
    },
    {
      dateTime: startDate.plus({ seconds: 10 }),
      vastUrl: "<CDATA>mocked VAST data</CDATA>",
    },
    // Manual bumper interstitial
    {
      dateTime: startDate.plus({ seconds: 30 }),
      asset: {
        url: "https://mock.com/interstitial/bumper.m3u8",
        type: "bumper",
      },
    },
    // Manual ad interstitial
    {
      dateTime: startDate.plus({ seconds: 40 }),
      asset: {
        url: "https://mock.com/interstitial/ad.m3u8",
        type: "ad",
      },
    },
    // Multiple manual interstitials
    {
      dateTime: startDate.plus({ seconds: 100 }),
      asset: {
        url: "https://mock.com/interstitial/master1.m3u8",
      },
    },
    {
      dateTime: startDate.plus({ seconds: 100 }),
      asset: {
        url: "https://mock.com/interstitial/master2.m3u8",
      },
    },
  ];

  return session;
}
