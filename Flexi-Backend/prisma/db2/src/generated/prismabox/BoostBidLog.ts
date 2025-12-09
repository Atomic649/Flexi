import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const BoostBidLogPlain = t.Object(
  {
    id: t.Integer(),
    timestamp: t.Date(),
    bidValue: t.Number(),
    reason: __nullable__(t.String()),
    campaignId: t.Integer(),
  },
  { additionalProperties: false },
);

export const BoostBidLogRelations = t.Object(
  {
    campaign: t.Object(
      {
        id: t.Integer(),
        createdAt: t.Date(),
        updatedAt: t.Date(),
        name: __nullable__(t.String()),
        status: t.Union(
          [
            t.Literal("ACTIVE"),
            t.Literal("PAUSED"),
            t.Literal("COMPLETED"),
            t.Literal("CANCELLED"),
          ],
          { additionalProperties: false },
        ),
        budget: t.Number(),
        dailyCap: __nullable__(t.Number()),
        startDate: t.Date(),
        endDate: t.Date(),
        bidStrategy: t.Union([t.Literal("AUTO"), t.Literal("MANUAL")], {
          additionalProperties: false,
        }),
        maxBid: __nullable__(t.Number()),
        businessId: t.Integer(),
        productId: t.Integer(),
        ownerId: t.String(),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const BoostBidLogPlainInputCreate = t.Object(
  {
    timestamp: t.Optional(t.Date()),
    bidValue: t.Number(),
    reason: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const BoostBidLogPlainInputUpdate = t.Object(
  {
    timestamp: t.Optional(t.Date()),
    bidValue: t.Optional(t.Number()),
    reason: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const BoostBidLogRelationsInputCreate = t.Object(
  {
    campaign: t.Object(
      {
        connect: t.Object(
          {
            id: t.Integer({ additionalProperties: false }),
          },
          { additionalProperties: false },
        ),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const BoostBidLogRelationsInputUpdate = t.Partial(
  t.Object(
    {
      campaign: t.Object(
        {
          connect: t.Object(
            {
              id: t.Integer({ additionalProperties: false }),
            },
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    },
    { additionalProperties: false },
  ),
);

export const BoostBidLogWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          timestamp: t.Date(),
          bidValue: t.Number(),
          reason: t.String(),
          campaignId: t.Integer(),
        },
        { additionalProperties: false },
      ),
    { $id: "BoostBidLog" },
  ),
);

export const BoostBidLogWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object({ id: t.Integer() }, { additionalProperties: false }),
          { additionalProperties: false },
        ),
        t.Union([t.Object({ id: t.Integer() })], {
          additionalProperties: false,
        }),
        t.Partial(
          t.Object({
            AND: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            NOT: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            OR: t.Array(Self, { additionalProperties: false }),
          }),
          { additionalProperties: false },
        ),
        t.Partial(
          t.Object(
            {
              id: t.Integer(),
              timestamp: t.Date(),
              bidValue: t.Number(),
              reason: t.String(),
              campaignId: t.Integer(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "BoostBidLog" },
);

export const BoostBidLogSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      timestamp: t.Boolean(),
      bidValue: t.Boolean(),
      reason: t.Boolean(),
      campaignId: t.Boolean(),
      campaign: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const BoostBidLogInclude = t.Partial(
  t.Object(
    { campaign: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const BoostBidLogOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      timestamp: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      bidValue: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      reason: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      campaignId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const BoostBidLog = t.Composite(
  [BoostBidLogPlain, BoostBidLogRelations],
  { additionalProperties: false },
);

export const BoostBidLogInputCreate = t.Composite(
  [BoostBidLogPlainInputCreate, BoostBidLogRelationsInputCreate],
  { additionalProperties: false },
);

export const BoostBidLogInputUpdate = t.Composite(
  [BoostBidLogPlainInputUpdate, BoostBidLogRelationsInputUpdate],
  { additionalProperties: false },
);
