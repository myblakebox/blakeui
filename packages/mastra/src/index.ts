import {Mastra} from "@mastra/core/mastra";
import {PinoLogger} from "@mastra/loggers";

import {nativeAgent, reactAgent} from "./agent";

export {nativeAgent, reactAgent} from "./agent";

export const mastra = new Mastra({
  agents: {
    blakeuiReactAgent: reactAgent,
    blakeuiNativeAgent: nativeAgent,
  },
  logger: new PinoLogger({
    level: "info",
    name: "Mastra",
  }),
});
