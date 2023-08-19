/**
 * HyperSocket
 * @license MIT
 * @version 0.2.0
 * @copyright Copyright (c) 2023 KConk Owners and Developers
*/

import * as types from "./types";

class HyperSocketServerInternalImpl {

    constructor() {

    }
    addSocket(socket: types.HyperWebSocket): void {

    }
    allIDs(): types.SocketID[] {
        return [];
    }
    addEventHandler<K extends keyof types.HyperSocketServerEvent>(
        event: K,
        handler: types.HyperSocketServerEventHandler<K>
    ): void {

    }
    addMessageHandler<T>(
        event: string,
        handler: types.HyperSocketServerMessageHandler<T>
    ): void {

    }

}

/**
 * Generates a type from any object
 * usefull for runtime type checking
*/
const g$: <T>(obj?: any) => T = <T>(obj?: any): T => obj as T;

export class HyperSocketServerImpl implements types.HyperSocketServer {
    private __internal: HyperSocketServerInternalImpl;
    constructor() {
        this.__internal = new HyperSocketServerInternalImpl();
    }
    ///////////////////////////////////////////////////////////////////////////
    /////            HyperSocketServer interface implementation           /////
    ///////////////////////////////////////////////////////////////////////////
    dispatchTo(id: types.SocketID, message: string): void {
        this.__internal.dispatchTo(id, message);
    }
    dispatchToAll(message: string): void {
        this.getAllIDs().forEach(id => this.dispatchTo(id, message));
    }
    addEventListenerTo<K extends keyof WebSocketEventMap>(
        id: types.SocketID,
        type: K,
        listener: types.HyperWebSocketEventListener<K>,
        options?: boolean | AddEventListenerOptions,
    ): void {
        try {
            this.getSocket(id).addEventListener(type, listener, options);
        } finally { }
    }
    addEventListenerToAll<K extends keyof WebSocketEventMap>(
        type: K,
        listener: types.HyperWebSocketEventListener<K>,
        options?: boolean | AddEventListenerOptions,
    ): void {
        this.getAllIDs().forEach(id =>
            this.addEventListenerTo(id, type, listener, options)
        );
    }
    disconnect(id: types.SocketID): void {
        this.__internal.disconnect(id);
    }
    disconnectAll(): void {
        this.getAllIDs().forEach(id => this.disconnect(id));
    }
    on<T, K extends keyof types.HyperSocketServerEvent>(
        event:    string |
                  K,
        listener: types.HyperSocketServerClientEventListener<T> |
                  types.HyperSocketServerEventListener<K>
    ): void {
        const __K = g$<K>();
        const __T = g$<T>();
        const __HyperSocketServerClientEventListener: types.HyperSocketServerClientEventListener<T> = undefined as types.HyperSocketServerClientEventListener<T>;
        if (typeof event === "string") {
            this.__internal.addMessageHandler(
                event, listener as types.HyperSocketServerClientEventListener<T>
            );
        } else 
            this.__internal.addEventHandler(event, listener as types.HyperSocketServerEventListener<K>);
        }
    }

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
     * Gets all sockets
     * @returns {HyperWebSocket[]} all sockets
    */
    getAllSockets(): HyperWebSocket[];
    /**
     * Gets a certain socket
     * @param {SocketID} id id of the socket
     * @returns {HyperWebSocket} the socket 
     * @throws {Error} if the socket id is not available
    */
    getSocket(id: SocketID): HyperWebSocket;

    addSocket(
        socket: WebSocket | types.HyperWebSocket,
        id?: types.SocketID
    ): void {
        if (typeof socket["id"] !== "undefined") {
            this.__internal.addSocket(socket as types.HyperWebSocket);
            return;
        }
        if (typeof id === "undefined") throw new TypeError("Socket id is not defined");
        Object.defineProperty(socket, "id", { value: id });
        this.__internal.addSocket(socket as types.HyperWebSocket);
    }
}