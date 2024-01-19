declare global {
    /**
     * Creates a new HyperSocket.
     * 
     * It will automatically connect to the current page's host.
     * 
     * @param {"auto"} server Server to connect to.
     * @returns {HyperSocket<string, any, string, any>} The HyperSocket.
    */
    //deno-lint-ignore no-explicit-any
    function hyperSocket<const S extends "auto" | string>(server: S): HyperSocket<string, any, string, any>;
    /**
     * Creates a new HyperSocket.
     * 
     * It will automatically connect to the current page's host.
     * 
     * You can specify a scheme to type check the events (at runtime).
     * 
     * @param {"auto"} server Server to connect to.
     * @param {HyperSocketInputOutputScheme<IK, IE, OK, OE>} scheme The scheme to type check the events.
     * @returns {HyperSocket<IK, IE, OK, OE>} The HyperSocket.
     * @template {const IK extends HyperSocketInputKey} IK The input keys.
     * @template {HyperSocketInputEvents<IK>} IE The input events.
     * @template {const OK extends HyperSocketOutputKey} OK The output keys.
     * @template {HyperSocketOutputEvents<OK>} OE The output events.
    */
    function hyperSocket<
        const S extends "auto" | string,
        const IK extends HyperSocketInputKey,
        IE extends HyperSocketInputEvents<IK>,
        const OK extends HyperSocketOutputKey,
        OE extends HyperSocketOutputEvents<OK>
    >(
        server: S,
        scheme: HyperSocketInputOutputScheme<IK, IE, OK, OE>
    ): HyperSocket<IK, IE, OK, OE>;
    /**
     * Creates a new HyperSocket.
     * 
     * You have to specify the server to connect to (if it fails to parse, it will throw an error).
     * 
     * Additionally, you can specify a scheme to type check the events (at runtime).
     * 
     * @param {S} server Server to connect to.
     * @param {HyperSocketInputOutputScheme<IK, IE, OK, OE>} scheme The scheme to type check the events.
     * @returns {HyperSocket<IK, IE, OK, OE>} The HyperSocket.
     * @template {const S extends HyperSocketServerLike} S The server to connect to.
     * @template {const IK extends HyperSocketInputKey} IK The input keys.
     * @template {HyperSocketInputEvents<IK>} IE The input events.
     * @template {const OK extends HyperSocketOutputKey} OK The output keys.
     * @template {HyperSocketOutputEvents<OK>} OE The output events.
     * @throws {TypeError} If the server parsing fails.
    */
    function hyperSocket<
        const S extends HyperSocketServerLike,
        const IK extends HyperSocketInputKey,
        IE extends HyperSocketInputEvents<IK>,
        const OK extends HyperSocketOutputKey,
        OE extends HyperSocketOutputEvents<OK>
    >(
        server: S,
        scheme: HyperSocketInputOutputScheme<IK, IE, OK, OE>
    ): HyperSocket<IK, IE, OK, OE>;
}

/** The connection details. */
export interface HyperSocketServer extends HyperSocketServerLike {
    readonly port: number;
    readonly host: string;
    readonly path: string;
    readonly secure: boolean;
}
/** Something that can be used to create a HyperSocketServer. */
export interface HyperSocketServerLike {
    /** Port (e.g. 80) */
    port?: number;
    /** Host (e.g. "localhost") */
    host?: string;
    /** Path (e.g. "/") */
    path?: string;
    /** Wether or not it is secure (if tls is used) */
    secure?: boolean;
};

/** The data that is sent over the socket. */
export type HyperSocketEventData = 'string' | 'number' | 'boolean' | {
    [key: string]: HyperSocketEventData;
};
/** The scheme to type check the events. */
export interface HyperSocketInputOutputScheme<
    IK extends HyperSocketInputKey,
    IE extends HyperSocketInputEvents<IK>,
    OK extends HyperSocketOutputKey,
    OE extends HyperSocketOutputEvents<OK>
> {
    /**
     * Input events.
     * 
     * This is what the server will send to the client.
    */
    in: IE;
    /**
     * Output events.
     * 
     * This is what the client will send to the server.
    */
    out: OE;
}

/** A list of all the input keys. */
export type HyperSocketInputKey = string;
/** A list of all the input events associated with the input keys. */
export type HyperSocketInputEvents<K extends HyperSocketInputKey> = Record<K, HyperSocketEventData>;

/** A list of all the output keys. */
export type HyperSocketOutputKey = string;
/** A list of all the output events associated with the input keys. */
export type HyperSocketOutputEvents<K extends HyperSocketOutputKey> = Record<K, HyperSocketEventData>;

/**
 * A HyperSocket.
 * 
 * @template {IK extends HyperSocketInputKey} IK The input keys.
 * @template {IE extends HyperSocketInputEvents<IK>} IE The input events.
 * @template {OK extends HyperSocketOutputKey} OK The output keys.
 * @template {OE extends HyperSocketOutputEvents<OK>} OE The output events.
 * @interface HyperSocket
*/
export interface HyperSocket<
    IK extends HyperSocketInputKey,
    IE extends HyperSocketInputEvents<IK>,
    OK extends HyperSocketOutputKey,
    OE extends HyperSocketOutputEvents<OK>
> {
    /** The server the socket is connected to. */
    get server(): HyperSocketServer;
    set server(server: "auto" | string | HyperSocketServerLike);
    /**
     * Registers an event listener for the given event.
     * 
     * If the socket is not connected, it will throw an error.
     * 
     * @param {K} event The event to listen to.
     * @param {(data: IE[K]) => void} callback The callback to call when the event is emitted.
     * @template {K extends IK} K The event to listen to.
     * @throws {Error} If the socket is not connected.
     * @memberof HyperSocket
    */
    on<K extends IK>(event: K, callback: (data: IE[K]) => void): void;
    /**
     * Registers an async event listener for the given event.
     * 
     * If the socket is not connected, it will throw an error.
     * 
     * @param {K} event The event to listen to.
     * @param {(data: IE[K]) => Promise<void>} callback The callback to call when the event is emitted.
     * @template {K extends IK} K The event to listen to.
     * @memberof HyperSocket
     * @throws {Error} If the socket is not connected.
     * @async
    */
    on<K extends IK>(event: K, callback: (data: IE[K]) => Promise<void>): void;
    /**
     * Unregisters an event listener for the given event.
     * 
     * If the socket is not connected, it will throw an error.
     * 
     * @param {K} event The event to unregister.
     * @param {(data: IE[K]) => void} callback The callback to unregister.
     * @template {K extends IK} K The event to unregister.
     * @memberof HyperSocket
     * @throws {Error} If the socket is not connected.
    */
    off<K extends IK>(event: K, callback: (data: IE[K]) => void): void;
    /**
     * Unregisters an async event listener for the given event.
     * 
     * If the socket is not connected, it will throw an error.
     * 
     * @param {K} event The event to unregister.
     * @param {(data: IE[K]) => Promise<void>} callback The callback to unregister.
     * @template {K extends IK} K The event to unregister.
     * @memberof HyperSocket
     * @throws {Error} If the socket is not connected.
     * @async
    */
    off<K extends IK>(event: K, callback: (data: IE[K]) => Promise<void>): void;
    /**
     * Emits an event to the server.
     * 
     * If the socket is not connected, it will throw an error.
     * 
     * @param {K} event The event to emit.
     * @param {OE[K]} data The data to emit.
     * @template {K extends OK} K The event to emit.
     * @memberof HyperSocket
     * @throws {Error} If the socket is not connected.
    */
    emit<K extends OK>(event: K, data: OE[K]): void;
    /**
     * Asynchronously connects to the server.
     * 
     * If it is already connected, it will do nothing.
     * 
     * @returns {Promise<void>} A promise that resolves when the connection is established.
     * @memberof HyperSocket
     * @async
    */
    connect(): Promise<void>;
    /** Disconnects from the server. */
    disconnect(): void;
    /**
     * Checks wether or not the socket is connected.
     * @returns {boolean} true if the socket is connected, false otherwise.
    */
    isConnected(): boolean;
}

type MaybeAsyncFunc<T> = ((data: T) => void) | ((data: T) => Promise<void>);

function parseServer(server: HyperSocketServerLike | string): HyperSocketServer {
    let url: URL;
    if (typeof server === "string" && server !== "auto") {
        url = new URL(server);
    } else {
        url = new URL(location.href);
    }
    return {
        port: typeof server !== "string" ? server.port ?? Number.parseInt(url.port) : Number.parseInt(url.port),
        host: typeof server !== "string" ? server.host ?? url.hostname : url.hostname,
        path: typeof server !== "string" ? server.path ?? url.pathname : url.pathname,
        secure: typeof server !== "string" ? server.secure ?? url.protocol.startsWith("https") : url.protocol.startsWith("https"),
    }
}

class HyperSocketImpl<
    IK extends HyperSocketInputKey,
    IE extends HyperSocketInputEvents<IK>,
    OK extends HyperSocketOutputKey,
    OE extends HyperSocketOutputEvents<OK>
> implements HyperSocket<IK, IE, OK, OE> {
    #server: HyperSocketServer;
    #scheme?: HyperSocketInputOutputScheme<IK, IE, OK, OE>
    #socket?: WebSocket;
    #connected: boolean;
    public constructor(
        server: HyperSocketServerLike | string,
        scheme?: HyperSocketInputOutputScheme<IK, IE, OK, OE>
    ) {
        this.#server = parseServer(server);
        this.#scheme = scheme;
        this.#connected = false;
    }
    #_makeEvent<K extends IK>(
        event: K, callback: MaybeAsyncFunc<IE[K]>
        // deno-lint-ignore no-explicit-any
    ): (this: WebSocket, ev: MessageEvent<any>) => void | Promise<void> {
        return (msg) => {
            const data = JSON.parse(msg.data);
            const e = data.event as K;
            if (!e) return;
            if (e !== event) return;
            const d = data.data;
            if (this.#scheme) {
                if (typeof d === "object") {
                    if (!this.#scheme.in[e]) return;
                    for (const key in this.#scheme.in[e]) {
                        if (!this.#scheme.in[e][key]) return;
                        if (typeof this.#scheme.in[e][key] !== typeof d[key]) return;
                    }
                // deno-lint-ignore valid-typeof
                } else if (this.#scheme.in[e] !== typeof d) return;
            }
            callback(d);
        }
    }
    public on<K extends IK>(event: K, callback: MaybeAsyncFunc<IE[K]>): void {
        if (!this.#socket) throw new Error("Socket not connected");
        this.#socket.addEventListener('message', this.#_makeEvent(event, callback));
    }
    public off<K extends IK>(event: K, callback: MaybeAsyncFunc<IE[K]>): void {
        if (!this.#socket) throw new Error("Socket not connected");
        this.#socket.removeEventListener('message', this.#_makeEvent(event, callback));
    }
    public emit<K extends OK>(event: K, data: OE[K]): void {
        if (!this.#socket) throw new Error("Socket not connected");
        this.#socket.send(JSON.stringify({ event, data }));
    }
    public connect(): Promise<void> {
        if (this.#connected || this.#socket) return Promise.resolve();
        try {
            this.#socket = new WebSocket(
                this.#server.secure ? "wss" : "ws" + "://" +
                this.#server.host + ":" + this.#server.port + this.#server.path
            );
        } catch (e) {
            return Promise.reject(e);
        }
        return new Promise((resolve, reject) => {
            this.#socket!.onerror = reject;
            this.#socket!.onopen = () => {
                this.#connected = true;
                resolve();
            }
        });
    }
    public disconnect(): void {
        if (!this.#socket) return;
        this.#connected = false;
        this.#socket.close();
    }
    public isConnected(): boolean {
        return this.#connected;
    }
    public get server(): HyperSocketServer {
        return this.#server;
    }
    public set server(server: "auto" | string | HyperSocketServerLike) {
        this.#server = parseServer(server);
    }
}

const hyperSocket = <
    const IK extends HyperSocketInputKey,
    IE extends HyperSocketInputEvents<IK>,
    const OK extends HyperSocketOutputKey,
    OE extends HyperSocketOutputEvents<OK>
>(
    connection: HyperSocketServerLike,
    scheme?: HyperSocketInputOutputScheme<IK, IE, OK, OE>
): HyperSocket<IK, IE, OK, OE> => new HyperSocketImpl<IK, IE, OK, OE>(connection, scheme);

Object.defineProperty(globalThis, "hyperSocket", {
    value: hyperSocket,
    writable: false,
    enumerable: false,
    configurable: false
});
