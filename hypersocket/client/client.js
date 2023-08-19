/**
 * HyperSocket
 * @license MIT
 * @version 0.2.0
 * @copyright Copyright (c) 2023 KConk Owners and Developers
*/

((g,f)=>f((n,o)=>Object.defineProperty(g,n,{value:o})))(this,((export$)=>{'use strict';
    const getURL = () => {
        const url = new URL(window.location.href);
        const protocol = url.protocol === "https:" ? "wss" : "ws";
        const res = `${protocol}://${url.host}/`;
        console.log(res);
        return res;
    };

    const generateID = () => {
        const crypto = window.crypto || window.msCrypto;
        let array;
        if (crypto) {
            array = new Uint8Array(10);
            crypto.getRandomValues(array);
        } else {
            array = [];
            for (let i = 0; i < 10; i++) {
                array.push(Math.floor(Math.random() * 10));
            }
        }
        return array.join("");
    };

    /**
     * Initialize a HyperSocket client
     * @param {string | undefined} id
    */
    const hyperSocket = (id) => {
        if (!id) id = generateID();
        const socket = new WebSocket(`${getURL()}__HyperSocket/upgrade?id=${id}`);
        return socket;
    };
    export$("hyperSocket", hyperSocket);
}));