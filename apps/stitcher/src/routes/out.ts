import { Hono } from "hono";
import { DateTime } from "luxon";
import { z } from "zod";
import { getAppContext } from "../app-context";
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

      const context = await getAppContext(c);

      const url = context.cipher.decrypt(query.eurl);
      const session = await getSession(context, query.sid);

      const playlist = await formatMasterPlaylist(
        context,
        session,
        url,
        query.fil,
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

      const context = await getAppContext(c);

      const session = await getSession(context, query.sid);

      const url = context.cipher.decrypt(query.eurl);

      const playlist = await formatMediaPlaylist(
        context,
        session,
        url,
        query.type,
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

      const context = await getAppContext(c);

      const session = await getSession(context, query.sid);

      const dateTime = DateTime.fromISO(query.dt);

      const assetList = await formatAssetList(
        context,
        session,
        dateTime,
        query.mdur,
      );

      return c.json(assetList, 200);
    },
  );
