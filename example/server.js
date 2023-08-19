import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import initHSS from "../server.oak.ts";

const app = new Application();
const port = 8080;
const router = new Router();

const HSS = initHSS(router);

// Broadcast the active users list to all connected sockets
function updateUsers() {
    const msg = JSON.stringify({
        event: "update-users",
        usernames: HSS.getAllIDs()
    });
    HSS.dispatchToAll(msg);
}

// broadcast the active users list when a new user logs in
HSS.on("connection", updateUsers);

// broadcast the active users list when a user logs out
HSS.on("disconnection", updateUsers);

// broadcast new message if someone sent one
HSS.on("message", ({ id }) => {
    console.log(`Received message from ${id}!`);
});

HSS.on("send-message", ({ id, data }) => {
    const msg = JSON.stringify({
        event: "send-message",
        username: id,
        message: data["message"] || "???",
    });
    HSS.dispatchToAll(msg);
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
