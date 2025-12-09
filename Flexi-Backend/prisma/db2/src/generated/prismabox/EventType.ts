import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const EventType = t.Union(
  [t.Literal("IMPRESSION"), t.Literal("CLICK"), t.Literal("VIEW")],
  { additionalProperties: false },
);
