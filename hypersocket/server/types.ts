/**
 * HyperSocket
 * @license MIT
 * @version 0.2.0
 * @copyright Copyright (c) 2023 KConk Owners and Developers
*/

/** A type for a socket id */
export type SocketID = string;

/** A type for a return value of a function, which can be a promise or not */
export type Ret<T> = T | Promise<T>;

/** A Base for all HyperSocketServer events */
export interface BaseHyperSocketServerEvent {
    /** The id of the socket that triggered the event */
    readonly id: SocketID;
}

/** A HyperSocketServer connection event */
export interface HyperSocketServerConnectionEvent extends BaseHyperSocketServerEvent { }

/** A HyperSocketServer disconnection event */
export interface HyperSocketServerDisconnectionEvent extends BaseHyperSocketServerEvent { }

/** A HyperSocketServer message event */
export interface HyperSocketServerMessageEvent extends BaseHyperSocketServerEvent {  
    readonly message: string;
}

/** A HyperSocketServer event */
export interface HyperSocketServerEvent {
    /** A connection event */
    connection: HyperSocketServerConnectionEvent;
    /** A disconnection event */
    disconnection: HyperSocketServerDisconnectionEvent;
    /** A message event */
    message: HyperSocketServerMessageEvent;
}

/** A HyperWebSocket */
export interface HyperWebSocket extends WebSocket {
    /** The id of the socket */
    readonly id: SocketID;

    /**
     * Adds an event listener to the socket. The listener will be called when the event is triggered
     * @param {string} event event to listen to
     * @param {HyperSocketServerClientEventListener<T>} listener listener to add
     * @returns {void} void
     * @template T
    */
    on<T>(event: string, listener: HyperSocketServerClientEventListener<T>): void;
}

/** A HyperWebSocket event */
export type HyperWebSocketEventListener<
    K extends keyof WebSocketEventMap
> = (this: HyperWebSocket, ev: WebSocketEventMap[K]) => Ret<void>;

/** A HyperSocketServer event */
export type HyperSocketServerEventListener<
    K extends keyof HyperSocketServerEvent
    > = (this: HyperSocketServer, ev: HyperSocketServerEvent[K]) => Ret<void>;

/** A HyperSocketServer event listener */
export type HyperSocketServerClientEventListener<T> = (this: HyperWebSocket, data: T) => Ret<void>;

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
     * Adds a socket to the server
     * @param {HyperWebSocket} socket socket to add
     * @returns {void} void
     * @throws {Error} if the socket id is already taken
    */
    addSocket(socket: HyperWebSocket): void;
    /**
     * Dispatches an event to a certain socket
     * @param {SocketID} id id of the socket
     * @param {string} message message to send
     * @returns {void} void
    */
    dispatchTo(id: SocketID, message: string): void;
    /**
     * Dispatches an event to all sockets
     * @param {string} message message to send
     * @returns {void} void
    */
    dispatchToAll(message: string): void;
    /**
     * Adds an event listener to a certain socket
     * @param {SocketID} id id of the socket
     * @param {K} type type of event: 'open' | 'close' | 'error' | 'message'
     * @param {HyperWebSocketEventListener<K>} listener listener to add
     * @param {boolean | AddEventListenerOptions} options options for the listener
     * @returns {void} void
     * @template K
    */
    addEventListenerTo<K extends keyof WebSocketEventMap>(
        id: SocketID,
        type: K,
        listener: HyperWebSocketEventListener<K>,
        options?: boolean | AddEventListenerOptions,
    ): void;
    /**
     * Adds an event listener to all sockets
     * @param {K} type type of event: 'open' | 'close' | 'error' | 'message'
     * @param {HyperWebSocketEventListener<K>} listener listener to add
     * @param {boolean | AddEventListenerOptions} options options for the listener
     * @returns {void} void
     * @template K
    */
    addEventListenerToAll<K extends keyof WebSocketEventMap>(
        type: K,
        listener: HyperWebSocketEventListener<K>,
        options?: boolean | AddEventListenerOptions,
    ): void;
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
     * Adds an event listener to the server
     * @param {K} type type of event: 'connection' | 'disconnection' | 'message'
     * @param {HyperSocketServerEventListener<K>} listener listener to add
     * @returns {void} void
     * @template K
    */
    on<K extends keyof HyperSocketServerEvent>(
        type: K,
        listener: HyperSocketServerEventListener<K>
    ): void;
    /**
     * Adds an event listener to the event that the client emits
     * @param {string} eventID id of the event
     * @param {HyperSocketServerClientEventListener<T>} listener listener to add
     * @returns {void} void
     * @template T
    */
    on<T>(
        event: string,
        listener: HyperSocketServerClientEventListener<T>
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
}
