import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const Category = t.Union(
  [
    t.Literal("Office"),
    t.Literal("Coach"),
    t.Literal("Bank"),
    t.Literal("Agency"),
    t.Literal("Account"),
    t.Literal("Orm"),
  ],
  { additionalProperties: false },
);
