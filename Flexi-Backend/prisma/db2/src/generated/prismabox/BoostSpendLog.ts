import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const BoostSpendLogPlain = t.Object(
  {
    id: t.Integer(),
    timestamp: t.Date(),
    spend: t.Number(),
    campaignId: t.Integer(),
  },
  { additionalProperties: false },
);

export const BoostSpendLogRelations = t.Object(
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

export const BoostSpendLogPlainInputCreate = t.Object(
  { timestamp: t.Optional(t.Date()), spend: t.Number() },
  { additionalProperties: false },
);

export const BoostSpendLogPlainInputUpdate = t.Object(
  { timestamp: t.Optional(t.Date()), spend: t.Optional(t.Number()) },
  { additionalProperties: false },
);

export const BoostSpendLogRelationsInputCreate = t.Object(
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

export const BoostSpendLogRelationsInputUpdate = t.Partial(
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

export const BoostSpendLogWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          timestamp: t.Date(),
          spend: t.Number(),
          campaignId: t.Integer(),
        },
        { additionalProperties: false },
      ),
    { $id: "BoostSpendLog" },
  ),
);

export const BoostSpendLogWhereUnique = t.Recursive(
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
              spend: t.Number(),
              campaignId: t.Integer(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "BoostSpendLog" },
);

export const BoostSpendLogSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      timestamp: t.Boolean(),
      spend: t.Boolean(),
      campaignId: t.Boolean(),
      campaign: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const BoostSpendLogInclude = t.Partial(
  t.Object(
    { campaign: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const BoostSpendLogOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      timestamp: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      spend: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      campaignId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const BoostSpendLog = t.Composite(
  [BoostSpendLogPlain, BoostSpendLogRelations],
  { additionalProperties: false },
);

export const BoostSpendLogInputCreate = t.Composite(
  [BoostSpendLogPlainInputCreate, BoostSpendLogRelationsInputCreate],
  { additionalProperties: false },
);

export const BoostSpendLogInputUpdate = t.Composite(
  [BoostSpendLogPlainInputUpdate, BoostSpendLogRelationsInputUpdate],
  { additionalProperties: false },
);
