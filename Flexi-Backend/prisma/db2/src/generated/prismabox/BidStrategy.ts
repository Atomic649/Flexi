import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const BidStrategy = t.Union([t.Literal("AUTO"), t.Literal("MANUAL")], {
  additionalProperties: false,
});
