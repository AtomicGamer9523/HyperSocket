﻿//////////////////////////////////////////////////////////////////////
/////               Author: Матвей Т <matveit.dev>               /////
/////                        License: MIT                        /////
/////           Not removing this header is appreciated          /////
//////////////////////////////////////////////////////////////////////

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

    class EventBus {
        /**@type {Map<string, ((...args: any[]) => void)[]>}*/
        #listeners;
        constructor() {
            this.#listeners = new Map();
        }
        /**
         * @param {string} type
         * @param {(...args: any[]) => void} listener
         * @returns {void}
        */
        on(type, listener) {
            const listeners = this.#listeners.get(type) || [];
            listeners.push(listener);
            this.#listeners.set(type, listeners);
        }
        /**
         * @param {string} type
         * @param {(...args: any[]) => void} listener
         * @returns {void}
        */
        off(type, listener) {
            const listeners = this.#listeners.get(type) || [];
            const index = listeners.indexOf(listener);
            if (index !== -1) listeners.splice(index, 1);
            this.#listeners.set(type, listeners);
        }
        /**
         * @param {string} type
         * @param {any} detail
         * @returns {void}
        */
        emit(type, detail) {
            const listeners = this.#listeners.get(type) || [];
            for (const listener of listeners) listener(detail);
        }
    }

    class HyperSocket {
        /**@type {EventBus}*/#eventBus;
        /**@type {WebSocket}*/#socket;
        /**@type {string}*/#id;

        /**
         * @param {HyperSocket} self
        */
        static #__initEvents = (self) => {
            self.#socket.onmessage = (event) => {
                /**@type {{event: string, data: any}}*/
                const e = JSON.parse(event.data);
                if (e.event) self.#eventBus.emit(e.event, e.data);
            };
        }

        /**
         * @param {string | undefined} id
        */
        constructor(id) {
            this.#eventBus = new EventBus("__HyperSocketEventBusManager");

            if (!id) id = generateID();
            this.#id = id;

            const socket = new WebSocket(`${getURL()}__HyperSocket/upgrade?id=${id}`);

            this.#socket = socket;

            HyperSocket.#__initEvents(this);
        }

        /**
         * @param {string} type
         * @param {(event: CustomEvent<DetailType>) => void} listener
         * @returns {void}
        */
        on(type, listener) {
            this.#eventBus.on(type, listener);
        }

        /**
         * @param {string} event
         * @param {any} data
         * @returns {void}
        */
        emit(event, data) {
            const msg = JSON.stringify({
                event: event,
                id: this.#id,
                data: data,
            });
            this.#socket.send(msg);
        }
    }

    /**
     * Initialize a HyperSocket client
     * @param {string | undefined} id
    */
    const hyperSocket = (id) => new HyperSocket(id);

    export$("hyperSocket", hyperSocket);
    export$("hs", hyperSocket);
}));