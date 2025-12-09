import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const MemberPlain = t.Object(
  {
    uniqueId: t.String(),
    createdAt: t.Date(),
    updatedAt: t.Date(),
    userId: t.Integer(),
    businessId: __nullable__(t.Integer()),
  },
  { additionalProperties: false },
);

export const MemberRelations = t.Object(
  {
    user: t.Object(
      {
        id: t.Integer(),
        email: t.String(),
        password: t.String(),
        firstName: t.String(),
        lastName: t.String(),
        avatar: __nullable__(t.String()),
        createdAt: t.Date(),
        updatedAt: t.Date(),
        phone: t.String(),
        username: __nullable__(t.String()),
      },
      { additionalProperties: false },
    ),
    business: __nullable__(
      t.Object(
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
    ),
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
  },
  { additionalProperties: false },
);

export const MemberPlainInputCreate = t.Object(
  {},
  { additionalProperties: false },
);

export const MemberPlainInputUpdate = t.Object(
  {},
  { additionalProperties: false },
);

export const MemberRelationsInputCreate = t.Object(
  {
    user: t.Object(
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
    business: t.Optional(
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
  },
  { additionalProperties: false },
);

export const MemberRelationsInputUpdate = t.Partial(
  t.Object(
    {
      user: t.Object(
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
      business: t.Partial(
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
    },
    { additionalProperties: false },
  ),
);

export const MemberWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          uniqueId: t.String(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
          userId: t.Integer(),
          businessId: t.Integer(),
        },
        { additionalProperties: false },
      ),
    { $id: "Member" },
  ),
);

export const MemberWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object({ uniqueId: t.String() }, { additionalProperties: false }),
          { additionalProperties: false },
        ),
        t.Union([t.Object({ uniqueId: t.String() })], {
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
              uniqueId: t.String(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
              userId: t.Integer(),
              businessId: t.Integer(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Member" },
);

export const MemberSelect = t.Partial(
  t.Object(
    {
      uniqueId: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      userId: t.Boolean(),
      user: t.Boolean(),
      businessId: t.Boolean(),
      business: t.Boolean(),
      products: t.Boolean(),
      campaigns: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const MemberInclude = t.Partial(
  t.Object(
    {
      user: t.Boolean(),
      business: t.Boolean(),
      products: t.Boolean(),
      campaigns: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const MemberOrderBy = t.Partial(
  t.Object(
    {
      uniqueId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      updatedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      businessId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Member = t.Composite([MemberPlain, MemberRelations], {
  additionalProperties: false,
});

export const MemberInputCreate = t.Composite(
  [MemberPlainInputCreate, MemberRelationsInputCreate],
  { additionalProperties: false },
);

export const MemberInputUpdate = t.Composite(
  [MemberPlainInputUpdate, MemberRelationsInputUpdate],
  { additionalProperties: false },
);
