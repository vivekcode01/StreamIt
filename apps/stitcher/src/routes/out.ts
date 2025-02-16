import { Hono } from "hono";
import { DateTime } from "luxon";
import { z } from "zod";
import { api } from "../middleware/api";
import { encdec } from "../middleware/encdec";
import { globals } from "../middleware/globals";
import { kv } from "../middleware/kv";
import {
  formatAssetList,
  formatMasterPlaylist,
  formatMediaPlaylist,
} from "../playlist";
import { getSession } from "../session";
import { validator } from "../validator";
import type { Filter } from "../filters";

export const outApp = new Hono()
  .use(globals())
  .use(kv())
  .use(encdec())
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

      const context = {
        globals: c.get("globals"),
        kv: c.get("kv"),
        encdec: c.get("encdec"),
      };

      const url = context.encdec.decrypt(query.eurl);
      const session = await getSession(context, query.sid);

      const playlist = await formatMasterPlaylist(context, {
        origUrl: url,
        session,
        filter: query.fil,
      });

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

      const context = {
        globals: c.get("globals"),
        kv: c.get("kv"),
        encdec: c.get("encdec"),
      };

      const session = await getSession(context, query.sid);

      const url = context.encdec.decrypt(query.eurl);

      const playlist = await formatMediaPlaylist(
        context,
        url,
        session,
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
    api(),
    async (c) => {
      const query = c.req.valid("query");

      const context = {
        globals: c.get("globals"),
        kv: c.get("kv"),
        api: c.get("api"),
      };

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
