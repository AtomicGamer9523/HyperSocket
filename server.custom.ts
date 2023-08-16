import { HyperSocketServer, WEBSOCKET_UPGRADE_PATH } from "./hypersocket/server/common.ts";
import { HyperSocketServerImpl } from "./hypersocket/server/impl.ts";

/**
 * Initializes a new HyperSocketServer instance.
 * 
 * REQUIRES ADDITIONAL CONFIGURATION:
 * - you must open a port to listen on
 * - add a GET route to the router on the path specified by {@link WEBSOCKET_UPGRADE_PATH} to upgrade the connection to a socket
 * - add a GET route to the router on the path specified by {@link CLIENT_CODE_PATH} to get the client code
 * - you must check if the ID is available using {@link HyperSocketServerImpl.isIDAvailable} before adding the socket
 * - you must call {@link HyperSocketServerImpl.addSocket} to add the socket to the server
 * 
 * @returns {HyperSocketServer} The HyperSocketServer instance
 */
export function initCustomHSS(): HyperSocketServer {
    return new HyperSocketServerImpl();
}

export * from "./hypersocket/server/common.ts";
export default initCustomHSS;
