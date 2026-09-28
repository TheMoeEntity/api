import type { z } from "zod";

import type { envSchema } from "../config/env.js";

export type Env = z.infer<typeof envSchema>;
