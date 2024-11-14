import { Elysia, t } from "elysia";
import { env } from "../env";
import { validateFilter } from "../filters";
import { getMasterUrl } from "../lib/url";
import {
  formatAssetList,
  formatMasterPlaylist,
  formatMediaPlaylist,
} from "../playlist";
import {
  createStarter,
  getSession,
  getStarter,
  swapStarterForSession,
} from "../session";

export const session = new Elysia()
  .post(
    "/session",
    async ({ body }) => {
      // This'll fail when uri is invalid.
      getMasterUrl(body.uri);

      if (body.filter) {
        // When we have a filter, validate it here first. There is no need to wait until we approach
        // the master playlist. We can bail out early.
        validateFilter(body.filter);
      }

      const id = await createStarter(body);
      return {
        url: `${env.PUBLIC_STITCHER_ENDPOINT}/session/${id}/master.m3u8`,
      };
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
              timeOffset: t.Number(),
              uri: t.String(),
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
                  description: 'Filter on resolution, like "<= 720".',
                }),
              ),
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
    "/session/:sessionId/master.m3u8",
    async ({ set, params }) => {
      let session = await getSession(params.sessionId);

      if (!session) {
        const starter = await getStarter(params.sessionId);
        session = await swapStarterForSession(params.sessionId, starter);
      }

      const playlist = await formatMasterPlaylist(session);

      set.headers["content-type"] = "application/x-mpegURL";

      return playlist;
    },
    {
      detail: {
        hide: true,
      },
      params: t.Object({
        sessionId: t.String(),
      }),
    },
  )
  .get(
    "/session/:sessionId/playlist.m3u8",
    async ({ set, params, query }) => {
      const session = await getSession(params.sessionId);
      if (!session) {
        throw new Error(`Invalid session for "${params.sessionId}"`);
      }

      const playlist = await formatMediaPlaylist(
        session,
        query.type,
        query.path,
      );

      set.headers["content-type"] = "application/x-mpegURL";

      return playlist;
    },
    {
      detail: {
        hide: true,
      },
      query: t.Object({
        type: t.Union([
          t.Literal("video"),
          t.Literal("audio"),
          t.Literal("text"),
        ]),
        path: t.String(),
      }),
      params: t.Object({
        sessionId: t.String(),
      }),
    },
  )
  .get(
    "/session/:sessionId/asset-list.json",
    async ({ params, query }) => {
      const session = await getSession(params.sessionId);
      if (!session) {
        throw new Error(`Invalid session for "${params.sessionId}"`);
      }

      return await formatAssetList(session, query.startDate);
    },
    {
      detail: {
        hide: true,
      },
      params: t.Object({
        sessionId: t.String(),
      }),
      query: t.Object({
        startDate: t.String(),
        _HLS_primary_id: t.Optional(t.String()),
      }),
    },
  );
