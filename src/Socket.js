import * as io from 'socket.io-client';
import axios from './axios';
let socket;

export function getSocket() {
    if (socket) {
        return socket;
    }
    socket = io.connect();
    socket.on('connect', () => {
        axios.get(`/connected/${socket.id}`);
    });
    return socket;
}
