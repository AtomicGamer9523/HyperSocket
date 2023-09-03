﻿//////////////////////////////////////////////////////////////////////
/////               Author: Матвей Т <matveit.dev>               /////
/////                        License: MIT                        /////
/////           Not removing this header is appreciated          /////
//////////////////////////////////////////////////////////////////////

/** A type for a socket id */
export type SocketID = string;

/** A HyperWebSocket */
export interface HyperWebSocket extends WebSocket {
    /** The id of the socket */
    readonly id: SocketID;
}

export type HyperSocketServerEvent =
    "disconnection" | "connection" | "message" | "error";

export type EventHandler = (...args: any[]) => void;

/** A HyperSocketServer */
export interface HyperSocketServer {
    /**
     * Adds a socket to the server
     * @param {WebSocket} socket socket to add
     * @param {SocketID} id id of the socket
     * @returns {void} void
     * @throws {Error} if the socket id is already taken
    */
    addSocket(socket: WebSocket, id: SocketID): void;
    /**
     * Adds a hyper socket to the server
     * @param {HyperWebSocket} socket socket to add
     * @returns {void} void
     * @throws {Error} if the socket id is already taken
    */
    addSocket(socket: HyperWebSocket): void;
    /**
     * Dispatches an event to a certain socket
     * @param {SocketID} id id of the socket
     * @param {string} event event id
     * @param {string} data data to send
     * @returns {void} void
    */
    emitTo(id: SocketID, event: string, data: object): void;
    /**
     * Dispatches an event to all sockets
     * @param {string} event event id
     * @param {string} data data to send
     * @returns {void} void
    */
    emit(event: string, data: object): void;
    /**
     * Disconnects a certain socket
     * @param {SocketID} id id of the socket
     * @returns {void} void
    */
    disconnect(id: SocketID): void;
    /**
     * Disconnects all sockets
     * @returns {void} void
    */
    disconnectAll(): void;
    /**
     * Registers an event handler for socket emits
     * @param {string} event event id
     * @param {EventHandler} handler event handler
     * @returns {void} void
    */
    on(event: string, handler: EventHandler): void;
    /**
     * Registers an event handler for server emits
     * @param {HyperSocketServerEvent} event event id
     * @param {EventHandler} handler event handler
     * @returns {void} void
    */
    onEvent(
        event: HyperSocketServerEvent, handler: EventHandler
    ): void;
    /**
     * Checks if a certain socket id is available
     * @param {SocketID} id id of the socket
     * @returns {boolean} true if the socket id is available, false otherwise
    */
    isIDAvailable(id: SocketID): boolean;
    /**
     * Gets all socket ids
     * @returns {SocketID[]} all socket ids
    */
    getAllIDs(): SocketID[];
    /**
     * Tries to get a socket by id
     * @param {SocketID} id id of the socket
     * @returns {HyperWebSocket | undefined} an optional socket
    */
    getSocket(id: SocketID): HyperWebSocket | undefined;
}
