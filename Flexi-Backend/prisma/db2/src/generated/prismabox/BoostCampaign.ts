import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const BoostCampaignPlain = t.Object(
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
);

export const BoostCampaignRelations = t.Object(
  {
    business: t.Object(
      {
        id: t.Integer(),
        createdAt: __nullable__(t.Date()),
        updatedAt: __nullable__(t.Date()),
        name: t.String(),
        businessType: t.Union(
          [
            t.Literal("Office"),
            t.Literal("Coach"),
            t.Literal("Bank"),
            t.Literal("Agency"),
            t.Literal("Account"),
            t.Literal("Orm"),
          ],
          { additionalProperties: false },
        ),
        userId: t.Integer(),
      },
      { additionalProperties: false },
    ),
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
    owner: t.Object(
      {
        uniqueId: t.String(),
        createdAt: t.Date(),
        updatedAt: t.Date(),
        userId: t.Integer(),
        businessId: __nullable__(t.Integer()),
      },
      { additionalProperties: false },
    ),
    results: t.Array(
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
      { additionalProperties: false },
    ),
    bidLogs: t.Array(
      t.Object(
        {
          id: t.Integer(),
          timestamp: t.Date(),
          bidValue: t.Number(),
          reason: __nullable__(t.String()),
          campaignId: t.Integer(),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
    spendLogs: t.Array(
      t.Object(
        {
          id: t.Integer(),
          timestamp: t.Date(),
          spend: t.Number(),
          campaignId: t.Integer(),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
    adEvents: t.Array(
      t.Object(
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
      ),
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const BoostCampaignPlainInputCreate = t.Object(
  {
    name: t.Optional(__nullable__(t.String())),
    status: t.Optional(
      t.Union(
        [
          t.Literal("ACTIVE"),
          t.Literal("PAUSED"),
          t.Literal("COMPLETED"),
          t.Literal("CANCELLED"),
        ],
        { additionalProperties: false },
      ),
    ),
    budget: t.Number(),
    dailyCap: t.Optional(__nullable__(t.Number())),
    startDate: t.Date(),
    endDate: t.Date(),
    bidStrategy: t.Optional(
      t.Union([t.Literal("AUTO"), t.Literal("MANUAL")], {
        additionalProperties: false,
      }),
    ),
  },
  { additionalProperties: false },
);

export const BoostCampaignPlainInputUpdate = t.Object(
  {
    name: t.Optional(__nullable__(t.String())),
    status: t.Optional(
      t.Union(
        [
          t.Literal("ACTIVE"),
          t.Literal("PAUSED"),
          t.Literal("COMPLETED"),
          t.Literal("CANCELLED"),
        ],
        { additionalProperties: false },
      ),
    ),
    budget: t.Optional(t.Number()),
    dailyCap: t.Optional(__nullable__(t.Number())),
    startDate: t.Optional(t.Date()),
    endDate: t.Optional(t.Date()),
    bidStrategy: t.Optional(
      t.Union([t.Literal("AUTO"), t.Literal("MANUAL")], {
        additionalProperties: false,
      }),
    ),
  },
  { additionalProperties: false },
);

export const BoostCampaignRelationsInputCreate = t.Object(
  {
    business: t.Object(
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
    owner: t.Object(
      {
        connect: t.Object(
          {
            id: t.String({ additionalProperties: false }),
          },
          { additionalProperties: false },
        ),
      },
      { additionalProperties: false },
    ),
    results: t.Optional(
      t.Object(
        {
          connect: t.Array(
            t.Object(
              {
                id: t.Integer({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    ),
    bidLogs: t.Optional(
      t.Object(
        {
          connect: t.Array(
            t.Object(
              {
                id: t.Integer({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    ),
    spendLogs: t.Optional(
      t.Object(
        {
          connect: t.Array(
            t.Object(
              {
                id: t.Integer({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    ),
    adEvents: t.Optional(
      t.Object(
        {
          connect: t.Array(
            t.Object(
              {
                id: t.Integer({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    ),
  },
  { additionalProperties: false },
);

export const BoostCampaignRelationsInputUpdate = t.Partial(
  t.Object(
    {
      business: t.Object(
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
      owner: t.Object(
        {
          connect: t.Object(
            {
              id: t.String({ additionalProperties: false }),
            },
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
      results: t.Partial(
        t.Object(
          {
            connect: t.Array(
              t.Object(
                {
                  id: t.Integer({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
            disconnect: t.Array(
              t.Object(
                {
                  id: t.Integer({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
          },
          { additionalProperties: false },
        ),
      ),
      bidLogs: t.Partial(
        t.Object(
          {
            connect: t.Array(
              t.Object(
                {
                  id: t.Integer({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
            disconnect: t.Array(
              t.Object(
                {
                  id: t.Integer({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
          },
          { additionalProperties: false },
        ),
      ),
      spendLogs: t.Partial(
        t.Object(
          {
            connect: t.Array(
              t.Object(
                {
                  id: t.Integer({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
            disconnect: t.Array(
              t.Object(
                {
                  id: t.Integer({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
          },
          { additionalProperties: false },
        ),
      ),
      adEvents: t.Partial(
        t.Object(
          {
            connect: t.Array(
              t.Object(
                {
                  id: t.Integer({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
            disconnect: t.Array(
              t.Object(
                {
                  id: t.Integer({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
          },
          { additionalProperties: false },
        ),
      ),
    },
    { additionalProperties: false },
  ),
);

export const BoostCampaignWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
          name: t.String(),
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
          dailyCap: t.Number(),
          startDate: t.Date(),
          endDate: t.Date(),
          bidStrategy: t.Union([t.Literal("AUTO"), t.Literal("MANUAL")], {
            additionalProperties: false,
          }),
          maxBid: t.Number(),
          businessId: t.Integer(),
          productId: t.Integer(),
          ownerId: t.String(),
        },
        { additionalProperties: false },
      ),
    { $id: "BoostCampaign" },
  ),
);

export const BoostCampaignWhereUnique = t.Recursive(
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
              updatedAt: t.Date(),
              name: t.String(),
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
              dailyCap: t.Number(),
              startDate: t.Date(),
              endDate: t.Date(),
              bidStrategy: t.Union([t.Literal("AUTO"), t.Literal("MANUAL")], {
                additionalProperties: false,
              }),
              maxBid: t.Number(),
              businessId: t.Integer(),
              productId: t.Integer(),
              ownerId: t.String(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "BoostCampaign" },
);

export const BoostCampaignSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      name: t.Boolean(),
      status: t.Boolean(),
      budget: t.Boolean(),
      dailyCap: t.Boolean(),
      startDate: t.Boolean(),
      endDate: t.Boolean(),
      bidStrategy: t.Boolean(),
      maxBid: t.Boolean(),
      businessId: t.Boolean(),
      business: t.Boolean(),
      productId: t.Boolean(),
      product: t.Boolean(),
      ownerId: t.Boolean(),
      owner: t.Boolean(),
      results: t.Boolean(),
      bidLogs: t.Boolean(),
      spendLogs: t.Boolean(),
      adEvents: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const BoostCampaignInclude = t.Partial(
  t.Object(
    {
      status: t.Boolean(),
      bidStrategy: t.Boolean(),
      business: t.Boolean(),
      product: t.Boolean(),
      owner: t.Boolean(),
      results: t.Boolean(),
      bidLogs: t.Boolean(),
      spendLogs: t.Boolean(),
      adEvents: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const BoostCampaignOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      updatedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      name: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      budget: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      dailyCap: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      startDate: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      endDate: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      maxBid: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      businessId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      productId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      ownerId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const BoostCampaign = t.Composite(
  [BoostCampaignPlain, BoostCampaignRelations],
  { additionalProperties: false },
);

export const BoostCampaignInputCreate = t.Composite(
  [BoostCampaignPlainInputCreate, BoostCampaignRelationsInputCreate],
  { additionalProperties: false },
);

export const BoostCampaignInputUpdate = t.Composite(
  [BoostCampaignPlainInputUpdate, BoostCampaignRelationsInputUpdate],
  { additionalProperties: false },
);
