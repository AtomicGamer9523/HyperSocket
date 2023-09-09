//////////////////////////////////////////////////////////////////////
/////               Author: Матвей Т <matveit.dev>               /////
/////                        License: MIT                        /////
/////           Not removing this header is appreciated          /////
//////////////////////////////////////////////////////////////////////

import {
    HyperSocketServerEvent,
    HyperSocketServer,
    HyperWebSocket,
    EventHandler,
    SocketID
} from "./mod.ts";

export class HyperSocketServerImpl implements HyperSocketServer {
    readonly #socketHandlers: Map<string, EventHandler[]>;
    readonly #serverHandlers: {
        disconnection: EventHandler[];
        connection: EventHandler[];
        message: EventHandler[];
        error: EventHandler[];
    };
    readonly #sockets: Map<SocketID, HyperWebSocket>;
    public constructor() {
        this.#serverHandlers = {
            disconnection: [],
            connection: [],
            message: [],
            error: []
        };
        this.#socketHandlers = new Map();
        this.#sockets = new Map();
    }
    private setupSocket(socket: HyperWebSocket): void {
        if (!this.isIDAvailable(socket.id)) {
            throw new Error(`ID: ${socket.id} is already taken`);
        }
        socket.addEventListener("message", (e: MessageEvent) => {
            this.#serverHandlers.message.forEach(f => f(e.data));
            const obj = JSON.parse(e.data);
            const event = obj.event;
            const data = obj.data;
            const id = obj.id;
            if (this.#socketHandlers.has(event)) {
                for (const handler of
                    this.#socketHandlers.get(event)!
                ) handler({ data, id });
            }
        });
        socket.addEventListener("close", () => {
            this.#sockets.delete(socket.id);
            this.#serverHandlers.disconnection.forEach(f => f());
        });
        socket.addEventListener("error", (e: Event) => {
            this.#serverHandlers.error.forEach(f => f(e));
        });
        socket.addEventListener("open", () => {
            this.#sockets.set(socket.id, socket);
            this.#serverHandlers.connection.forEach(f => f());
        });
    }
    public disconnectAll(): void {
        this.getAllIDs().forEach(id => this.disconnect(id));
    }
    public emit(event: string, data: object): void {
        this.getAllIDs().forEach(id => this.emitTo(id, event, data));
    }
    public addSocket(s: WebSocket | HyperWebSocket, id?: SocketID): void {
        if (!(s as any)["id"]) {
            Object.defineProperty(s, "id", {
                value: id,
                writable: false,
                enumerable: true,
                configurable: false
            });
        }
        this.setupSocket(s as HyperWebSocket);
    }
    public emitTo(id: SocketID, event: string, data: object): void {
        const socket = this.#sockets.get(id);
        if (!socket)
            throw new Error(`Socket with id: ${id} not found`);
        socket.send(JSON.stringify({
            event,
            data
        }));
    }
    public disconnect(id: SocketID): void {
        const socket = this.#sockets.get(id);
        if (socket) {
            this.#sockets.delete(id);
            socket.close();
        }
    }
    public on(event: string, handler: EventHandler): void {
        const handlers = this.#socketHandlers.get(event) || [];
        handlers.push(handler);
        this.#socketHandlers.set(event, handlers);
    }
    public onEvent(event: HyperSocketServerEvent, handler: EventHandler): void {
        if (event === "connection") {
            this.#serverHandlers.connection.push(handler);
        } else if (event === "disconnection") {
            this.#serverHandlers.disconnection.push(handler);
        } else if (event === "message") {
            this.#serverHandlers.message.push(handler);
        } else if (event === "error") {
            this.#serverHandlers.error.push(handler);
        } else {
            throw new Error(`Unknown event: ${event}`);
        }
    }
    public isIDAvailable(id: SocketID): boolean {
        return !this.#sockets.has(id);
    }
    public getAllIDs(): SocketID[] {
        return [...this.#sockets.keys()];
    }
    public getSocket(id: SocketID): HyperWebSocket | undefined {
        return this.#sockets.get(id);
    }
}
