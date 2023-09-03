import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import initHSS from "../server.oak.ts";

const app = new Application();
const port = 8080;
const router = new Router();

const HSS = initHSS(router);

// Broadcast the active users list to all connected sockets
function updateUsers() {
    console.log("[updateUsers]", "Broadcasting active users list");
    HSS.emit("update-users", {
        usernames: HSS.getAllIDs()
    });
}

// broadcast the active users list when a new user logs in
HSS.onEvent("connection", updateUsers);

// broadcast the active users list when a user logs out
HSS.onEvent("disconnection", updateUsers);

// broadcast new message if someone sent one
HSS.onEvent("message", (_rawData) => {
    console.log("[onEvent]", "Received message from client!");
});

HSS.on("send-message", ({ id, data }) => {
    HSS.emit("send-message", {
        username: id,
        message: data,
    });
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
