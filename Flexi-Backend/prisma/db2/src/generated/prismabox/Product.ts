import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const ProductPlain = t.Object(
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
);

export const ProductRelations = t.Object(
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
    category: t.Object(
      {
        id: t.Integer(),
        name: t.String(),
        description: __nullable__(t.String()),
      },
      { additionalProperties: false },
    ),
    author: t.Object(
      {
        uniqueId: t.String(),
        createdAt: t.Date(),
        updatedAt: t.Date(),
        userId: t.Integer(),
        businessId: __nullable__(t.Integer()),
      },
      { additionalProperties: false },
    ),
    details: t.Array(
      t.Object(
        {
          id: t.Integer(),
          key: t.String(),
          value: t.String(),
          productId: t.Integer(),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
    campaigns: t.Array(
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

export const ProductPlainInputCreate = t.Object(
  {
    title: t.String(),
    description: t.String(),
    image: t.Optional(__nullable__(t.String())),
    callToAction: t.Optional(__nullable__(t.String())),
    deleted: t.Optional(t.Boolean()),
  },
  { additionalProperties: false },
);

export const ProductPlainInputUpdate = t.Object(
  {
    title: t.Optional(t.String()),
    description: t.Optional(t.String()),
    image: t.Optional(__nullable__(t.String())),
    callToAction: t.Optional(__nullable__(t.String())),
    deleted: t.Optional(t.Boolean()),
  },
  { additionalProperties: false },
);

export const ProductRelationsInputCreate = t.Object(
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
    category: t.Object(
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
    author: t.Object(
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
    details: t.Optional(
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
    campaigns: t.Optional(
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

export const ProductRelationsInputUpdate = t.Partial(
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
      category: t.Object(
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
      author: t.Object(
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
      details: t.Partial(
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
      campaigns: t.Partial(
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

export const ProductWhere = t.Partial(
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
          title: t.String(),
          description: t.String(),
          image: t.String(),
          callToAction: t.String(),
          businessId: t.Integer(),
          categoryId: t.Integer(),
          authorId: t.String(),
          deleted: t.Boolean(),
        },
        { additionalProperties: false },
      ),
    { $id: "Product" },
  ),
);

export const ProductWhereUnique = t.Recursive(
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
              title: t.String(),
              description: t.String(),
              image: t.String(),
              callToAction: t.String(),
              businessId: t.Integer(),
              categoryId: t.Integer(),
              authorId: t.String(),
              deleted: t.Boolean(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Product" },
);

export const ProductSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      title: t.Boolean(),
      description: t.Boolean(),
      image: t.Boolean(),
      callToAction: t.Boolean(),
      businessId: t.Boolean(),
      business: t.Boolean(),
      categoryId: t.Boolean(),
      category: t.Boolean(),
      authorId: t.Boolean(),
      author: t.Boolean(),
      deleted: t.Boolean(),
      details: t.Boolean(),
      campaigns: t.Boolean(),
      adEvents: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const ProductInclude = t.Partial(
  t.Object(
    {
      business: t.Boolean(),
      category: t.Boolean(),
      author: t.Boolean(),
      details: t.Boolean(),
      campaigns: t.Boolean(),
      adEvents: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const ProductOrderBy = t.Partial(
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
      title: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      description: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      image: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      callToAction: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      businessId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      categoryId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      authorId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      deleted: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Product = t.Composite([ProductPlain, ProductRelations], {
  additionalProperties: false,
});

export const ProductInputCreate = t.Composite(
  [ProductPlainInputCreate, ProductRelationsInputCreate],
  { additionalProperties: false },
);

export const ProductInputUpdate = t.Composite(
  [ProductPlainInputUpdate, ProductRelationsInputUpdate],
  { additionalProperties: false },
);
