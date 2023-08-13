import { Application, Router, Context } from "https://deno.land/x/oak/mod.ts";
import { HyperSocketServer, initHSS } from "../server.ts";

const HSS: HyperSocketServer = initHSS();

const app = new Application();
const port = 8080;
const router = new Router();

function broadcast_usernames() {
    const msg = JSON.stringify({
        type: "usernames",
        data: HSS.getAllIDs()
    });
    HSS.dispatchToAll(msg);
}

// broadcast new message if someone sent one
HSS.on("message", ({ id, message }) => {
    console.log(`Received message from ${id}: ${message}`);
});

router.get("/start_web_socket", async (ctx: Context) => {
    const socket = await ctx.upgrade();
    const username = ctx.request.url.searchParams.get("username");
    if (!HSS.isIDAvailable(username)) {// if the username is already taken, close the socket
        socket.close(1008, `Username ${username} is already taken`);
        return;
    }
    HSS.addSocket(socket, username);
    console.log(`New client connected: ${username}`);

    // broadcast the active users list when a new user logs in
    HSS.addEventListenerTo(username, "open", broadcast_usernames);

    // when a client disconnects, remove them from the connected clients list
    // and broadcast the active users list
    HSS.addEventListenerTo(username, "close", broadcast_usernames);
});

app.use(router.routes());
app.use(router.allowedMethods());
app.use(async (context) => {
    await context.send({
        root: `${Deno.cwd()}/`,
        index: "index.html",
    });
});

console.log("Listening at http://localhost:" + port);
await app.listen({ port });
