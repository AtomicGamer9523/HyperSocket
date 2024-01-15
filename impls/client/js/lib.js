(() => {
    function parseServer(server) {
        if (server === "auto") {
            const url = new URL(location.href);
            return {
                port: Number.parseInt(url.port),
                host: url.hostname,
                path: url.pathname,
                secure: url.protocol.startsWith("https"),
            }
        } else if (typeof server === "string") {
            const url = new URL(server);
            return {
                port: Number.parseInt(url.port),
                host: url.hostname,
                path: url.pathname,
                secure: url.protocol.startsWith("https"),
            }
        } else {
            return {
                port: server.port ?? 80,
                host: server.host ?? "localhost",
                path: server.path ?? "/",
                secure: server.secure ?? false,
            }
        }
    }

    class HyperSocketImpl {
        server;
        #scheme;
        #socket;
        #connected;
        constructor(server, scheme) {
            this.server = parseServer(server);
            this.#scheme = scheme;
            this.#connected = false;
        }
        #_makeEvent(event, callback) {
            return (msg) => {
                const data = JSON.parse(msg.data);
                const e = data.event;
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
        on(event, callback) {
            if (!this.#socket) throw new Error("Socket not connected");
            this.#socket.addEventListener('message', this.#_makeEvent(event, callback));
        }
        off(event, callback) {
            if (!this.#socket) throw new Error("Socket not connected");
            this.#socket.removeEventListener('message', this.#_makeEvent(event, callback));
        }
        emit(event, data) {
            if (!this.#socket) throw new Error("Socket not connected");
            this.#socket.send(JSON.stringify({ event, data }));
        }
        connect() {
            if (this.#connected || this.#socket) return Promise.resolve();
            try {
                this.#socket = new WebSocket(
                    `${this.server.secure ? "wss" : "ws"}://${this.server.host}:${this.server.port}${this.server.path}`,
                    'hypersocket'
                );
            } catch (e) {
                return Promise.reject(e);
            }
            return new Promise((resolve, reject) => {
                this.#socket.onerror = reject;
                this.#socket.onopen = () => {
                    this.#connected = true;
                    resolve();
                }
            });
        }
        disconnect() {
            if (!this.#socket) return;
            this.#connected = false;
            this.#socket.close();
        }
        isConnected() { return this.#connected; }
    }
    const hyperSocket = (c, s) => new HyperSocketImpl(c, s);
    Object.defineProperty(globalThis, "hyperSocket", {
        value: hyperSocket,
        writable: false,
        enumerable: false,
        configurable: false
    });
})();
