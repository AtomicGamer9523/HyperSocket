declare global {
    /**
     * Creates a new HyperSocket.
     * 
     * It will automatically connect to the current page's host.
     * 
     * @param {"auto"} server Server to connect to.
     * @returns {HyperSocket<string, any, string, any>} The HyperSocket.
    */
    function hyperSocket(server: "auto"): HyperSocket<string, HyperSocketEventData, string, HyperSocketEventData>;
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
        const IK extends HyperSocketInputKey,
        IE extends HyperSocketInputEvents<IK>,
        const OK extends HyperSocketOutputKey,
        OE extends HyperSocketOutputEvents<OK>
    >(
        server: "auto",
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
export interface HyperSocketServer {
    /** Port */
    readonly port: number;
    /** Host */
    readonly host: string;
    /** Path */
    readonly path: string;
    /** Wether or not it is secure */
    readonly secure: boolean;
}
/** Something that can be used to create a HyperSocketServer. */
export type HyperSocketServerLike = "auto" | {
    /** Port (e.g. 80) */
    port?: number;
    /** Host (e.g. "localhost") */
    host?: string;
    /** Path (e.g. "/") */
    path?: string;
    /** Wether or not it is secure (if tls is used) */
    secure?: boolean;
} | string;

/** The data that is sent over the socket. */
// deno-lint-ignore ban-types
export type HyperSocketEventData = {}
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

export interface HyperSocket<
    IK extends HyperSocketInputKey,
    IE extends HyperSocketInputEvents<IK>,
    OK extends HyperSocketOutputKey,
    OE extends HyperSocketOutputEvents<OK>
> {
    readonly server: HyperSocketServer;
    on<K extends IK>(event: K, callback: (data: IE[K]) => void): void;
    on<K extends IK>(event: K, callback: (data: IE[K]) => Promise<void>): void;
    off<K extends IK>(event: K, callback: (data: IE[K]) => void): void;
    off<K extends IK>(event: K, callback: (data: IE[K]) => Promise<void>): void;
    emit<K extends OK>(event: K, data: OE[K]): void;
    emitRaw(data: string): void;
    emitRaw(data: ArrayBufferLike | ArrayBufferView): void;
    emitRaw(data: Blob): void;
    connect(): Promise<void>;
    disconnect(): void;
    isConnected(): boolean;
}

type SyncOrAsyncFunc<T> = (data: T) => void | Promise<void>;

(gThis => {
    function parseServer(server: HyperSocketServerLike): HyperSocketServer {
        if (server === "auto") {
            const url = new URL(location.href);
            return {
                port: Number.parseInt(url.port),
                host: url.hostname,
                path: url.pathname,
                secure: url.protocol.startsWith("https")
            }
        } else if (typeof server === "string") {
            const url = new URL(server);
            return {
                port: Number.parseInt(url.port),
                host: url.hostname,
                path: url.pathname,
                secure: url.protocol.startsWith("https")
            }
        } else {
            return {
                port: server.port ?? 80,
                host: server.host ?? "localhost",
                path: server.path ?? "/",
                secure: server.secure ?? false
            }
        }
    }
    
    class HyperSocketImpl<
        IK extends HyperSocketInputKey,
        IE extends HyperSocketInputEvents<IK>,
        OK extends HyperSocketOutputKey,
        OE extends HyperSocketOutputEvents<OK>
    > implements HyperSocket<IK, IE, OK, OE> {
        public readonly server: HyperSocketServer;
        private readonly type_check: boolean;
        public constructor(
            server: HyperSocketServerLike,
            type_check: boolean
        ) {
            this.server = parseServer(server);
            this.type_check = type_check;
        }
        on<K extends IK>(event: K, callback: (data: IE[K]) => void): void;
        on<K extends IK>(event: K, callback: (data: IE[K]) => Promise<void>): void;
        on(event: unknown, callback: unknown): void {
          throw new Error("Method not implemented.");
        }
        off<K extends IK>(event: K, callback: (data: IE[K]) => void): void;
        off<K extends IK>(event: K, callback: (data: IE[K]) => Promise<void>): void;
        off(event: unknown, callback: unknown): void {
          throw new Error("Method not implemented.");
        }
        emit<K extends OK>(event: K, data: OE[K]): void {
          throw new Error("Method not implemented.");
        }
        emitRaw(data: string): void;
        emitRaw(data: ArrayBufferLike | ArrayBufferView): void;
        emitRaw(data: Blob): void;
        emitRaw(data: unknown): void {
          throw new Error("Method not implemented.");
        }
        connect(): Promise<void> {
          throw new Error("Method not implemented.");
        }
        disconnect(): void {
          throw new Error("Method not implemented.");
        }
        isConnected(): boolean {
          throw new Error("Method not implemented.");
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
    ): HyperSocket<IK, IE, OK, OE> => new HyperSocketImpl<IK, IE, OK, OE>(connection, !!scheme);

    Object.defineProperty(gThis, "hyperSocket", {
        value: hyperSocket,
        writable: false,
        enumerable: false,
        configurable: false
    });
})(globalThis)
