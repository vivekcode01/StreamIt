import { Hono } from "hono";
import { env } from "hono/adapter";
import { DateTime } from "luxon";
import { z } from "zod";
import { decrypt } from "../lib/crypto";
import {
  formatAssetList,
  formatMasterPlaylist,
  formatMediaPlaylist,
} from "../playlist";
import { getSession } from "../session";
import { validator } from "../validator";
import type { Filter } from "../filters";

export const outApp = new Hono()
  .get(
    "/master.m3u8",
    validator(
      "query",
      z.object({
        eurl: z.string(),
        sid: z.string(),
        fil: z
          .string()
          .transform<Filter>((value) => JSON.parse(atob(value)))
          .optional(),
      }),
    ),
    async (c) => {
      const query = c.req.valid("query");

      const { PUBLIC_STITCHER_ENDPOINT } = env<{
        PUBLIC_STITCHER_ENDPOINT: string;
      }>(c);

      const url = decrypt(query.eurl);
      const session = await getSession(c, query.sid);

      const playlist = await formatMasterPlaylist(
        {
          origUrl: url,
          session,
          filter: query.fil,
        },
        PUBLIC_STITCHER_ENDPOINT,
        c,
      );

      c.header("Content-Type", "application/vnd.apple.mpegurl");

      return c.text(playlist, 200);
    },
  )
  .get(
    "/playlist.m3u8",
    validator(
      "query",
      z.object({
        eurl: z.string(),
        sid: z.string(),
        type: z.enum(["video", "audio", "subtitles"]),
      }),
    ),
    async (c) => {
      const query = c.req.valid("query");

      const { PUBLIC_STITCHER_ENDPOINT } = env<{
        PUBLIC_STITCHER_ENDPOINT: string;
      }>(c);

      const url = decrypt(query.eurl);
      const session = await getSession(c, query.sid);

      const playlist = await formatMediaPlaylist(
        url,
        session,
        query.type,
        PUBLIC_STITCHER_ENDPOINT,
      );

      c.header("Content-Type", "application/vnd.apple.mpegurl");

      return c.text(playlist, 200);
    },
  )
  .get(
    "asset-list.json",
    validator(
      "query",
      z.object({
        dt: z.string(),
        sid: z.string(),
        mdur: z.coerce.number().optional(),
        _HLS_primary_id: z.string().optional(),
        _HLS_start_offset: z.coerce.number().optional(),
      }),
    ),
    async (c) => {
      const query = c.req.valid("query");
      const dateTime = DateTime.fromISO(query.dt);
      const session = await getSession(c, query.sid);

      const { PUBLIC_S3_ENDPOINT, PUBLIC_API_ENDPOINT } = env<{
        PUBLIC_S3_ENDPOINT: string;
        PUBLIC_API_ENDPOINT: string;
      }>(c);

      const assetList = await formatAssetList(
        PUBLIC_S3_ENDPOINT,
        PUBLIC_API_ENDPOINT,
        session,
        dateTime,
        query.mdur,
      );

      return c.json(assetList, 200);
    },
  );
