import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const BoostResultPlain = t.Object(
  {
    id: t.Integer(),
    date: t.Date(),
    impressions: t.Integer(),
    clicks: t.Integer(),
    views: t.Integer(),
    ctr: t.Number(),
    costSpent: t.Number(),
    campaignId: t.Integer(),
  },
  { additionalProperties: false },
);

export const BoostResultRelations = t.Object(
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

export const BoostResultPlainInputCreate = t.Object(
  {
    date: t.Date(),
    impressions: t.Optional(t.Integer()),
    clicks: t.Optional(t.Integer()),
    views: t.Optional(t.Integer()),
    ctr: t.Optional(t.Number()),
    costSpent: t.Optional(t.Number()),
  },
  { additionalProperties: false },
);

export const BoostResultPlainInputUpdate = t.Object(
  {
    date: t.Optional(t.Date()),
    impressions: t.Optional(t.Integer()),
    clicks: t.Optional(t.Integer()),
    views: t.Optional(t.Integer()),
    ctr: t.Optional(t.Number()),
    costSpent: t.Optional(t.Number()),
  },
  { additionalProperties: false },
);

export const BoostResultRelationsInputCreate = t.Object(
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

export const BoostResultRelationsInputUpdate = t.Partial(
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

export const BoostResultWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          date: t.Date(),
          impressions: t.Integer(),
          clicks: t.Integer(),
          views: t.Integer(),
          ctr: t.Number(),
          costSpent: t.Number(),
          campaignId: t.Integer(),
        },
        { additionalProperties: false },
      ),
    { $id: "BoostResult" },
  ),
);

export const BoostResultWhereUnique = t.Recursive(
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
              date: t.Date(),
              impressions: t.Integer(),
              clicks: t.Integer(),
              views: t.Integer(),
              ctr: t.Number(),
              costSpent: t.Number(),
              campaignId: t.Integer(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "BoostResult" },
);

export const BoostResultSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      date: t.Boolean(),
      impressions: t.Boolean(),
      clicks: t.Boolean(),
      views: t.Boolean(),
      ctr: t.Boolean(),
      costSpent: t.Boolean(),
      campaignId: t.Boolean(),
      campaign: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const BoostResultInclude = t.Partial(
  t.Object(
    { campaign: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const BoostResultOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      date: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      impressions: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      clicks: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      views: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      ctr: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      costSpent: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      campaignId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const BoostResult = t.Composite(
  [BoostResultPlain, BoostResultRelations],
  { additionalProperties: false },
);

export const BoostResultInputCreate = t.Composite(
  [BoostResultPlainInputCreate, BoostResultRelationsInputCreate],
  { additionalProperties: false },
);

export const BoostResultInputUpdate = t.Composite(
  [BoostResultPlainInputUpdate, BoostResultRelationsInputUpdate],
  { additionalProperties: false },
);
