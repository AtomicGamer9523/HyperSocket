import { HyperSocketServer, WEBSOCKET_UPGRADE_PATH, CLIENT_CODE_PATH } from "./hypersocket/server/common.ts";
import { HyperSocketServerImpl } from "./hypersocket/server/impl.ts";
import * as oak from "https://deno.land/x/oak/mod.ts";

const clientCodePath = "./hypersocket/client/client.js";
const CLIENT_CODE: string = Deno.readTextFileSync(new URL(clientCodePath, import.meta.url));

/**
 * Initializes a new HyperSocketServer instance using oak.
 * @param {oak.Router} router The oak router to use
 * @returns {HyperSocketServer} The HyperSocketServer instance
 */
export function initHSS(router: oak.Router): HyperSocketServer {
    const impl = new HyperSocketServerImpl();
    router.get(WEBSOCKET_UPGRADE_PATH, async (ctx: oak.Context) => {
        let socket;
        try {
            socket = await ctx.upgrade();
        } catch (err) {
            ctx.response.status = 500;
            ctx.response.body = "Unable to upgrade to socket";
            return;
        }
        const id = ctx.request.url.searchParams.get("id");
        if (!impl.isIDAvailable(id)) {// if the username is already taken, close the socket
            socket.close(1008, `ID: ${id} is already taken`);
            return;
        }
        impl.addSocket(socket, id);
    });
    router.get(CLIENT_CODE_PATH, (ctx: oak.Context) => {
        ctx.response.body = CLIENT_CODE;
        ctx.response.type = "application/javascript";
    });
    return impl;
}

export * from "./hypersocket/server/common.ts";
export default initHSS;
