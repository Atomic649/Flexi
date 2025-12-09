import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const ProductDetailPlain = t.Object(
  {
    id: t.Integer(),
    key: t.String(),
    value: t.String(),
    productId: t.Integer(),
  },
  { additionalProperties: false },
);

export const ProductDetailRelations = t.Object(
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
  },
  { additionalProperties: false },
);

export const ProductDetailPlainInputCreate = t.Object(
  { key: t.String(), value: t.String() },
  { additionalProperties: false },
);

export const ProductDetailPlainInputUpdate = t.Object(
  { key: t.Optional(t.String()), value: t.Optional(t.String()) },
  { additionalProperties: false },
);

export const ProductDetailRelationsInputCreate = t.Object(
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
  },
  { additionalProperties: false },
);

export const ProductDetailRelationsInputUpdate = t.Partial(
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
    },
    { additionalProperties: false },
  ),
);

export const ProductDetailWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          key: t.String(),
          value: t.String(),
          productId: t.Integer(),
        },
        { additionalProperties: false },
      ),
    { $id: "ProductDetail" },
  ),
);

export const ProductDetailWhereUnique = t.Recursive(
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
              key: t.String(),
              value: t.String(),
              productId: t.Integer(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "ProductDetail" },
);

export const ProductDetailSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      key: t.Boolean(),
      value: t.Boolean(),
      productId: t.Boolean(),
      product: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const ProductDetailInclude = t.Partial(
  t.Object(
    { product: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const ProductDetailOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      key: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      value: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      productId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const ProductDetail = t.Composite(
  [ProductDetailPlain, ProductDetailRelations],
  { additionalProperties: false },
);

export const ProductDetailInputCreate = t.Composite(
  [ProductDetailPlainInputCreate, ProductDetailRelationsInputCreate],
  { additionalProperties: false },
);

export const ProductDetailInputUpdate = t.Composite(
  [ProductDetailPlainInputUpdate, ProductDetailRelationsInputUpdate],
  { additionalProperties: false },
);
