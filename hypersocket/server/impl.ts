import * as types from "./types.ts";

type HyperSocketServerImplOnMessage =
    Set<types.HyperSocketServerEventListener<"message">>;
type HyperSocketServerImplOnConnection =
    Set<types.HyperSocketServerEventListener<"connection">>;
type HyperSocketServerImplOnDisconnection =
    Set<types.HyperSocketServerEventListener<"disconnection">>;

export class HyperSocketServerImpl implements types.HyperSocketServer {
    ///////////////////////////////////////////////////////////////////////////
    /////                            Internals                            /////
    ///////////////////////////////////////////////////////////////////////////
    private __socketMap: Map<types.SocketID, types.HyperWebSocket>;
    private __onmessage: HyperSocketServerImplOnMessage;
    private __onconnection: HyperSocketServerImplOnConnection;
    private __ondisconnection: HyperSocketServerImplOnDisconnection;
    private __registerInernalListeners(socket: types.HyperWebSocket): void {
        socket.addEventListener("close", () => {
            this.__ondisconnection.forEach(l => l({ id: socket.id }));
            this.__socketMap.delete(socket.id);
        });
        socket.addEventListener("message", ({ data }) => {
            this.__onmessage.forEach(l => l({ id: socket.id, message: data }));
        });
        socket.addEventListener("open", () => {
            this.__onconnection.forEach(l => l({ id: socket.id }));
        });
    }
    constructor() {
        this.__socketMap = new Map();
        this.__onmessage = new Set();
        this.__onconnection = new Set();
        this.__ondisconnection = new Set();
    }
    ///////////////////////////////////////////////////////////////////////////
    /////            HyperSocketServer interface implementation           /////
    ///////////////////////////////////////////////////////////////////////////
    addSocket(socket: WebSocket, id: types.SocketID): void {
        Object.defineProperty(socket, "id", {
            value: id,
            writable: false,
            enumerable: true,
            configurable: false
        });
        this.addHyperSocket(socket as types.HyperWebSocket);
    }
    addHyperSocket(socket: types.HyperWebSocket): void {
        if (this.__socketMap.has(socket.id)) {
            throw new Error("Socket ID already exists");
        }
        this.__registerInernalListeners(socket);
        this.__socketMap.set(socket.id, socket);
    }
    dispatchTo(id: types.SocketID, message: string): void {
        const socket = this.__socketMap.get(id);
        if (!socket) return;
        try {
            socket.send(message);
        } catch (e) {
            console.error(e);
        }
    }
    dispatchToAll(message: string): void {
        this.getAllIDs().forEach(id => this.dispatchTo(id, message));
    }
    addEventListenerTo<
        K extends keyof WebSocketEventMap
    >(
        id: types.SocketID,
        type: K, listener: types.HyperWebSocketEventListener<K>,
        options?: boolean | AddEventListenerOptions
    ): void {
        const socket = this.__socketMap.get(id);
        if (!socket) return;
        socket.addEventListener(type, listener, options);
    }
    addEventListenerToAll<
        K extends keyof WebSocketEventMap
    >(
        type: K,
        listener: types.HyperWebSocketEventListener<K>,
        options?: boolean | AddEventListenerOptions
    ): void {
        this.getAllIDs().forEach(id =>
            this.addEventListenerTo(id, type, listener, options)
        );
    }
    disconnect(id: types.SocketID): void {
        const socket = this.__socketMap.get(id);
        if (!socket) return;
        socket.close();
        this.__socketMap.delete(id);
    }
    disconnectAll(): void {
        this.getAllIDs().forEach(id => this.disconnect(id));
    }
    on<
        K extends keyof types.HyperSocketServerEvent
    >(
        type: K,
        listener: types.HyperSocketServerEventListener<K>
    ): void {
        if (type === "connection") {
            this.__onconnection.add(listener);
        } else if (type === "disconnection") {
            this.__ondisconnection.add(listener);
        } else if (type === "message") {
            this.__onmessage.add(listener);
        }
    }
    isIDAvailable(id: types.SocketID): boolean {
        return !this.__socketMap.has(id);
    }
    getAllIDs(): types.SocketID[] {
        return [...this.__socketMap.keys()];
    }
}