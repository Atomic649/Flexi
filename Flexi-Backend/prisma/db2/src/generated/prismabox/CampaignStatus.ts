import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const CampaignStatus = t.Union(
  [
    t.Literal("ACTIVE"),
    t.Literal("PAUSED"),
    t.Literal("COMPLETED"),
    t.Literal("CANCELLED"),
  ],
  { additionalProperties: false },
);
