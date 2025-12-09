import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const CategoryDefPlain = t.Object(
  { id: t.Integer(), name: t.String(), description: __nullable__(t.String()) },
  { additionalProperties: false },
);

export const CategoryDefRelations = t.Object(
  {
    products: t.Array(
      t.Object(
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
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const CategoryDefPlainInputCreate = t.Object(
  { name: t.String(), description: t.Optional(__nullable__(t.String())) },
  { additionalProperties: false },
);

export const CategoryDefPlainInputUpdate = t.Object(
  {
    name: t.Optional(t.String()),
    description: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const CategoryDefRelationsInputCreate = t.Object(
  {
    products: t.Optional(
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

export const CategoryDefRelationsInputUpdate = t.Partial(
  t.Object(
    {
      products: t.Partial(
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

export const CategoryDefWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          name: t.String(),
          description: t.String(),
        },
        { additionalProperties: false },
      ),
    { $id: "CategoryDef" },
  ),
);

export const CategoryDefWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.Integer(), name: t.String() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [t.Object({ id: t.Integer() }), t.Object({ name: t.String() })],
          { additionalProperties: false },
        ),
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
            { id: t.Integer(), name: t.String(), description: t.String() },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "CategoryDef" },
);

export const CategoryDefSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      name: t.Boolean(),
      description: t.Boolean(),
      products: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const CategoryDefInclude = t.Partial(
  t.Object(
    { products: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const CategoryDefOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      name: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      description: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const CategoryDef = t.Composite(
  [CategoryDefPlain, CategoryDefRelations],
  { additionalProperties: false },
);

export const CategoryDefInputCreate = t.Composite(
  [CategoryDefPlainInputCreate, CategoryDefRelationsInputCreate],
  { additionalProperties: false },
);

export const CategoryDefInputUpdate = t.Composite(
  [CategoryDefPlainInputUpdate, CategoryDefRelationsInputUpdate],
  { additionalProperties: false },
);
