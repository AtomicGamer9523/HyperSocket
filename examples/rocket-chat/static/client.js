/// <reference path="../../../impls/client/ts/lib.ts" />
//deno-lint-ignore-file no-unused-vars

const hs = hyperSocket("auto", {
    in: {
        'message': {
            'content': 'string',
            'author': 'string'
        },
        'user-join': 'string',
        'user-leave': 'string'
    },
    out: {
        'message': 'string'
    }
})

function showLoginPrompt() {
    document.getElementById('login-splash').style.display = 'block';
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('main').style.filter = 'blur(5px)';
}

function hideLoginPrompt() {
    document.getElementById('login-splash').style.display = 'none';
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('main').style.filter = 'none';
}

/**
 * @param {string} username the username of the user
 * @param {string} content the content of the message
*/
function addMessage(username, content) {
    const message = document.createElement('div');
    message.classList.add('message');
    message.innerHTML = `<span class="message-author">${username}</span><span class="message-seperator"></span><span class="message-content">${content}</span>`;
    document.getElementById('messages-list').appendChild(message);
}

async function main() {
    await hs.connect();

    hs.on('message', (message) => {
        addMessage(message.author, message.content);
    });
    
    hs.on('user-join', (username) => {
        const user = document.createElement('li');
        user.innerHTML = `<span class="user">${username}</span>`;
        document.getElementById('users-list').appendChild(user);
    });
    
    hs.on('user-leave', (username) => {
        const users = document.getElementById('users-list').children;
        for (let i = 0; i < users.length; i++) {
            console.log(users[i]);
            if (users[i].innerText === username) {
                users[i].remove();
                break;
            }
        }
    });
}

/**
 * This function is called when the user clicks the "send" button
 * or presses enter in the message input
*/
function onSend() {
    const message = document.getElementById('message-input').value;
    if (!message) return;

    hs.emit('message', message);

    document.getElementById('message-input').value = '';
}

/**
 * This function is called when the user clicks the "login" button
 * @async
*/
async function onLogin() {
    const username = document.getElementById('username-input').value;
    const password = document.getElementById('password-input').value;

    if (!username || !password) return;

    const res = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const text = await res.text();

    if (res.status !== 200) {
        alert(text);
        return;
    }

    await main();

    hideLoginPrompt();
}

/**
 * This function is called when the user clicks the "logout" button
*/
async function onLogout() {
    await fetch('/logout', { method: 'POST' });

    hs.disconnect();

    showLoginPrompt();
}

async function init() {
    const res = await fetch('/loggincheck');
    const text = await res.text();
    if (text === "true") hideLoginPrompt();
    else showLoginPrompt();

    await main();
}

init();
