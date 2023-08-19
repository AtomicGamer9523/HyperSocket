/**
 * HyperSocket
 * @license MIT
 * @version 0.2.0
 * @copyright Copyright (c) 2023 KConk Owners and Developers
*/

//@ts-ignore
import { HyperSocketServerImpl } from "./hypersocket/server/impl.ts";
//@ts-ignore
import * as common from "./hypersocket/server/common.ts";

/**
 * Initializes a new HyperSocketServer instance.
 * 
 * REQUIRES ADDITIONAL CONFIGURATION:
 * - you must open a port to listen on
 * - add a GET route to the router on the path specified by {@link common.WEBSOCKET_UPGRADE_PATH} to upgrade the connection to a socket
 * - add a GET route to the router on the path specified by {@link common.CLIENT_CODE_PATH} to get the client code
 * - you must check if the ID is available using {@link HyperSocketServerImpl.isIDAvailable} before adding the socket
 * - you must call {@link HyperSocketServerImpl.addSocket} to add the socket to the server
 * 
 * @returns {HyperSocketServer} The HyperSocketServer instance
 */
export function initCustomHSS(): common.HyperSocketServer {
    const impl = globalThis["__HyperSocket_defaultHyperSocketImplementation$$"];
    if (impl) return impl;
    console.trace("HyperSocketServer: initializing default implementation");
    return new HyperSocketServerImpl();
}

//@ts-ignore
export * from "./hypersocket/server/common.ts";
export default initCustomHSS;
