import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const AdEventPlain = t.Object(
  {
    id: t.Integer(),
    createdAt: t.Date(),
    type: t.Union(
      [t.Literal("IMPRESSION"), t.Literal("CLICK"), t.Literal("VIEW")],
      { additionalProperties: false },
    ),
    productId: t.Integer(),
    campaignId: __nullable__(t.Integer()),
    viewerId: t.String(),
  },
  { additionalProperties: false },
);

export const AdEventRelations = t.Object(
  {
    product: t.Object(
      {
        id: t.Integer(),
        createdAt: t.Date(),
        updatedAt: t.Date(),
        title: t.String(),
        description: t.String(),
        image: __nullable__(t.String()),
        callToAction: __nullable__(t.String()),
        businessId: t.Integer(),
        categoryId: t.Integer(),
        authorId: t.String(),
        deleted: t.Boolean(),
      },
      { additionalProperties: false },
    ),
    campaign: __nullable__(
      t.Object(
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
    ),
  },
  { additionalProperties: false },
);

export const AdEventPlainInputCreate = t.Object(
  {
    type: t.Union(
      [t.Literal("IMPRESSION"), t.Literal("CLICK"), t.Literal("VIEW")],
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const AdEventPlainInputUpdate = t.Object(
  {
    type: t.Optional(
      t.Union(
        [t.Literal("IMPRESSION"), t.Literal("CLICK"), t.Literal("VIEW")],
        { additionalProperties: false },
      ),
    ),
  },
  { additionalProperties: false },
);

export const AdEventRelationsInputCreate = t.Object(
  {
    product: t.Object(
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
    campaign: t.Optional(
      t.Object(
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
    ),
  },
  { additionalProperties: false },
);

export const AdEventRelationsInputUpdate = t.Partial(
  t.Object(
    {
      product: t.Object(
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
      campaign: t.Partial(
        t.Object(
          {
            connect: t.Object(
              {
                id: t.Integer({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            disconnect: t.Boolean(),
          },
          { additionalProperties: false },
        ),
      ),
    },
    { additionalProperties: false },
  ),
);

export const AdEventWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          createdAt: t.Date(),
          type: t.Union(
            [t.Literal("IMPRESSION"), t.Literal("CLICK"), t.Literal("VIEW")],
            { additionalProperties: false },
          ),
          productId: t.Integer(),
          campaignId: t.Integer(),
          viewerId: t.String(),
        },
        { additionalProperties: false },
      ),
    { $id: "AdEvent" },
  ),
);

export const AdEventWhereUnique = t.Recursive(
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
              createdAt: t.Date(),
              type: t.Union(
                [
                  t.Literal("IMPRESSION"),
                  t.Literal("CLICK"),
                  t.Literal("VIEW"),
                ],
                { additionalProperties: false },
              ),
              productId: t.Integer(),
              campaignId: t.Integer(),
              viewerId: t.String(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "AdEvent" },
);

export const AdEventSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      createdAt: t.Boolean(),
      type: t.Boolean(),
      productId: t.Boolean(),
      campaignId: t.Boolean(),
      viewerId: t.Boolean(),
      product: t.Boolean(),
      campaign: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const AdEventInclude = t.Partial(
  t.Object(
    {
      type: t.Boolean(),
      product: t.Boolean(),
      campaign: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const AdEventOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      productId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      campaignId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      viewerId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const AdEvent = t.Composite([AdEventPlain, AdEventRelations], {
  additionalProperties: false,
});

export const AdEventInputCreate = t.Composite(
  [AdEventPlainInputCreate, AdEventRelationsInputCreate],
  { additionalProperties: false },
);

export const AdEventInputUpdate = t.Composite(
  [AdEventPlainInputUpdate, AdEventRelationsInputUpdate],
  { additionalProperties: false },
);
