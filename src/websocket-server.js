import queryString from 'query-string';
import { WebSocketServer } from 'ws';

let websocketServer;

function receiveMessage(message) {
    const parsedMessage = JSON.parse(message);
    console.log(parsedMessage);
    console.log(websocketServer.clients);
}

function connection(websocketConnection, connectionRequest) {
    const [_path, params] = connectionRequest?.url?.split('?');
    const connectionParams = queryString.parse(params);

    console.log(connectionParams);

    websocketConnection.on('message', receiveMessage);
}

function disconnect() {

}

export function websockets(expressServer) {

    websocketServer = new WebSocketServer({
        noServer: true,
        path: '/websockets',
    });

    expressServer.on('upgrade', (request, socket, head) => {
        websocketServer.handleUpgrade(request, socket, head, (websocket) => {
            websocketServer.emit('connection', websocket, request);
        });
    });

    websocketServer.on(
        'connection',
        connection
    );

    websocketServer.on(
        'disconnect',
        disconnect
    );

    return websocketServer;
}