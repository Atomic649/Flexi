import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const UserPlain = t.Object(
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
);

export const UserRelations = t.Object(
  {
    Business: t.Array(
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
      { additionalProperties: false },
    ),
    member: t.Array(
      t.Object(
        {
          uniqueId: t.String(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
          userId: t.Integer(),
          businessId: __nullable__(t.Integer()),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const UserPlainInputCreate = t.Object(
  {
    email: t.String(),
    password: t.String(),
    firstName: t.String(),
    lastName: t.String(),
    avatar: t.Optional(__nullable__(t.String())),
    phone: t.String(),
    username: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const UserPlainInputUpdate = t.Object(
  {
    email: t.Optional(t.String()),
    password: t.Optional(t.String()),
    firstName: t.Optional(t.String()),
    lastName: t.Optional(t.String()),
    avatar: t.Optional(__nullable__(t.String())),
    phone: t.Optional(t.String()),
    username: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const UserRelationsInputCreate = t.Object(
  {
    Business: t.Optional(
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
    member: t.Optional(
      t.Object(
        {
          connect: t.Array(
            t.Object(
              {
                id: t.String({ additionalProperties: false }),
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

export const UserRelationsInputUpdate = t.Partial(
  t.Object(
    {
      Business: t.Partial(
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
      member: t.Partial(
        t.Object(
          {
            connect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
            disconnect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
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

export const UserWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          email: t.String(),
          password: t.String(),
          firstName: t.String(),
          lastName: t.String(),
          avatar: t.String(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
          phone: t.String(),
          username: t.String(),
        },
        { additionalProperties: false },
      ),
    { $id: "User" },
  ),
);

export const UserWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              id: t.Integer(),
              email: t.String(),
              phone: t.String(),
              username: t.String(),
            },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.Integer() }),
            t.Object({ email: t.String() }),
            t.Object({ phone: t.String() }),
            t.Object({ username: t.String() }),
          ],
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
            {
              id: t.Integer(),
              email: t.String(),
              password: t.String(),
              firstName: t.String(),
              lastName: t.String(),
              avatar: t.String(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
              phone: t.String(),
              username: t.String(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "User" },
);

export const UserSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      email: t.Boolean(),
      password: t.Boolean(),
      firstName: t.Boolean(),
      lastName: t.Boolean(),
      avatar: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      phone: t.Boolean(),
      username: t.Boolean(),
      Business: t.Boolean(),
      member: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const UserInclude = t.Partial(
  t.Object(
    { Business: t.Boolean(), member: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const UserOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      email: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      password: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      firstName: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      lastName: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      avatar: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      updatedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      phone: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      username: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const User = t.Composite([UserPlain, UserRelations], {
  additionalProperties: false,
});

export const UserInputCreate = t.Composite(
  [UserPlainInputCreate, UserRelationsInputCreate],
  { additionalProperties: false },
);

export const UserInputUpdate = t.Composite(
  [UserPlainInputUpdate, UserRelationsInputUpdate],
  { additionalProperties: false },
);
