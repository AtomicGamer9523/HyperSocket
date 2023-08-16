export * from "./types.ts";

/** Path to upgrade the socket to a WebSocket. Only GET requests should be handled. */
export const WEBSOCKET_UPGRADE_PATH: string = "/__HyperSocket/upgrade" as const;

/** Path to get the client code. Only GET requests should be handled. */
export const CLIENT_CODE_PATH: string = "/__HyperSocket/client.js" as const;
