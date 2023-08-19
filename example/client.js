const myUsername = prompt("Please enter your name");
const socket = hyperSocket(myUsername);

function sendMessage() {
    const inputElement = document.getElementById("data");
    let message = inputElement.value;
    inputElement.value = "";
    socket.emit("send-message", message);
}

// displays new message
function addMessage(username, message) {
    const list = document.getElementById("conversation");
    list.innerHTML += `<b> ${username} </b>: ${message} <br/>`;
}

socket.on("message", (message) => {
    console.log("Received message: " + message);
});

socket.onEvent("send-message", (data) => {
    addMessage(data.username, data.message);
});

socket.onEvent("update-users", (data) => {
    let userListHtml = "";
    for (const username of data.usernames) {
        userListHtml += `<div> ${username} </div>`;
    }
    document.getElementById("users").innerHTML = userListHtml;
});

// on page load (to make sure the DOM is loaded)
window.onload = () => {
    // when the client hits the ENTER key
    document.getElementById("data").addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });
};