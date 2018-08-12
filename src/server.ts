import * as WebSocket from 'ws';

import {Request} from './Models/Request';
import bootstrap from './Bootstrap';

const wss = bootstrap.getWss();

const ConnectionHandler = bootstrap.getConnectionHandler();

wss.on("connection", function (socket: WebSocket) {

    let client = ConnectionHandler.onConnect(socket);

    socket.on(
        'message',
        (data: string) => {
            ConnectionHandler.onMessage(client, Request.fromJsonString(data));
        }
    );

    socket.on("close", () => ConnectionHandler.onClose(client));

});
