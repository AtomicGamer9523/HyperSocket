import { HyperSocketServer, } from "./types.ts";
import { HyperSocketServerImpl } from "./impl.ts";
export * from "./types.ts";

export function initHSS(): HyperSocketServer {
    return new HyperSocketServerImpl();
}

export default initHSS;
