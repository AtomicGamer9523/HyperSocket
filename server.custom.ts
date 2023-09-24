//////////////////////////////////////////////////////////////////////
/////               Author: Матвей Т <matveit.dev>               /////
/////                        License: MIT                        /////
/////           Not removing this header is appreciated          /////
//////////////////////////////////////////////////////////////////////

import { HyperSocketServerImpl } from "./hypersocket/server/impl.ts";
import * as server from "./hypersocket/server/mod.ts";
export * from "./hypersocket/server/mod.ts";

/**
 * Initializes a new HyperSocketServer instance.
 * 
 * REQUIRES ADDITIONAL CONFIGURATION:
 * - you must open a port to listen on
 * - add a GET route to the router on the path specified by {@link server.WEBSOCKET_UPGRADE_PATH} to upgrade the connection to a socket
 * - add a GET route to the router on the path specified by {@link server.CLIENT_CODE_PATH} to get the client code
 * - you must check if the ID is available using {@link server.HyperSocketServer.isIDAvailable} before adding the socket
 * - you must call {@link server.HyperSocketServer.addSocket} to add the socket to the server
 * 
 * @returns {server.HyperSocketServer} The HyperSocketServer instance
 */
export function initCustomHSS(): server.HyperSocketServer {
    return new HyperSocketServerImpl();
}
export default initCustomHSS;
