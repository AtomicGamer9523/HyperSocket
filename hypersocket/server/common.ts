/**
 * HyperSocket
 * @license MIT
 * @version 0.2.0
 * @copyright Copyright (c) 2023 KConk Owners and Developers
*/

//@ts-ignore
import { HyperSocketServer } from "./types.ts";
//@ts-ignore
export * from "./types.ts";

/** Path to upgrade the socket to a WebSocket. Only GET requests should be handled. */
export const WEBSOCKET_UPGRADE_PATH: "/__HyperSocket/upgrade" = "/__HyperSocket/upgrade" as const;

/** Path to get the client code. Only GET requests should be handled. */
export const CLIENT_CODE_PATH: "/__HyperSocket/client.js" = "/__HyperSocket/client.js" as const;

/**
 * Sets the default HyperSocketServer implementation.
 * @param {HyperSocketServer} impl The implementation to set
 * @returns {void} void
*/
export function setDefaultHyperSocketImplementation(impl: HyperSocketServer): void {
    Object.defineProperty(globalThis, "__HyperSocket_defaultHyperSocketImplementation$$", {
        value: impl,
    });
}
