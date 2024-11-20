import { Elysia, t } from "elysia";
import { getFilterFromQuery } from "../filters";
import { decrypt } from "../lib/crypto";
import {
  formatAssetList,
  formatMasterPlaylist,
  formatMediaPlaylist,
  makeMasterUrl,
} from "../playlist";
import {
  createSession,
  getSession,
  processSessionOnMasterReq,
} from "../session";

export const sessionRoutes = new Elysia()
  .post(
    "/session",
    async ({ body }) => {
      const session = await createSession(body);

      const filter = body.filter ?? {};

      const url = makeMasterUrl({
        url: session.url,
        filter,
        session,
      });

      return { url };
    },
    {
      detail: {
        summary: "Create a session",
      },
      body: t.Object({
        uri: t.String({
          description:
            'Reference to a master playlist, you can point to an asset with "asset://{uuid}" or as http(s).',
        }),
        interstitials: t.Optional(
          t.Array(
            t.Object({
              position: t.Number(),
              uri: t.String(),
              duration: t.Optional(t.Number()),
              type: t.Optional(t.Union([t.Literal("ad"), t.Literal("bumper")])),
            }),
            {
              description: "Manual HLS interstitial insertion.",
            },
          ),
        ),
        filter: t.Optional(
          t.Object(
            {
              resolution: t.Optional(
                t.String({
                  description: 'Filter on resolution, like "<=720".',
                }),
              ),
              audioLanguage: t.Optional(t.String()),
            },
            {
              description: "Filter applies to master and media playlist.",
            },
          ),
        ),
        vmap: t.Optional(
          t.Object(
            {
              url: t.String(),
            },
            {
              description:
                "Describes a VMAP, will transcode ads and insert interstitials on the fly.",
            },
          ),
        ),
        expiry: t.Optional(
          t.Number({
            description:
              "In seconds, the session will no longer be available after this time.",
            default: 3600,
            minimum: 60,
          }),
        ),
      }),
    },
  )
  .get(
    "/out/master.m3u8",
    async ({ set, query }) => {
      const session = await getSession(query.sid);

      await processSessionOnMasterReq(session);

      const filter = getFilterFromQuery(query);
      const url = decrypt(query.eurl);
      const playlist = await formatMasterPlaylist(url, {
        session,
        filter,
      });

      set.headers["content-type"] = "application/x-mpegURL";

      return playlist;
    },
    {
      detail: {
        hide: true,
      },
      query: t.Object({
        eurl: t.String(),
        sid: t.String(),
        "filter.resolution": t.Optional(t.String()),
        "filter.audioLanguage": t.Optional(t.String()),
      }),
    },
  )
  .get(
    "/out/playlist.m3u8",
    async ({ set, query }) => {
      const session = await getSession(query.sid);

      const url = decrypt(query.eurl);
      const playlist = await formatMediaPlaylist(session, url, query.type);

      set.headers["content-type"] = "application/x-mpegURL";

      return playlist;
    },
    {
      detail: {
        hide: true,
      },
      query: t.Object({
        eurl: t.String(),
        sid: t.String(),
        type: t.Optional(t.String()),
      }),
    },
  )
  .get(
    "/out/asset-list.json",
    async ({ query }) => {
      const session = await getSession(query.sid);

      return await formatAssetList(session, query.timeOffset);
    },
    {
      detail: {
        hide: true,
      },
      query: t.Object({
        timeOffset: t.Optional(t.Number()),
        sid: t.String(),
        _HLS_primary_id: t.Optional(t.String()),
      }),
    },
  );
