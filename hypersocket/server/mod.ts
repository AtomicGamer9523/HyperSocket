//////////////////////////////////////////////////////////////////////
/////               Author: Матвей Т <matveit.dev>               /////
/////                        License: MIT                        /////
/////           Not removing this header is appreciated          /////
//////////////////////////////////////////////////////////////////////

import * as types from "./types.ts";
export * from "./types.ts";

/** Path to upgrade the socket to a WebSocket. Only GET requests should be handled. */
export const WEBSOCKET_UPGRADE_PATH = "/__HyperSocket/upgrade" as const;

/** Path to get the client code. Only GET requests should be handled. */
export const CLIENT_CODE_PATH = "/__HyperSocket/client.js" as const;
