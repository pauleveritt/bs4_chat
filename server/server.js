var WebSocketServer = require("ws").Server,
    ws = new WebSocketServer({host: "localhost", port: 9002});

var clients = {};

var clientConnect = function (connection, username) {
    console.log("connection opened from %s", username);

    var userId = Math.round(Math.random() * 1000000000);

    clients[userId] = connection;
    clients[userId].username = username;

    return userId;
};

var sendMessage = function (userId, body, type) {
    var obj = {
        type: type,
        body: body
    };

    var message = JSON.stringify(obj);

    if (!userId) {
        for (var client in clients) {
            clients[client].send(message);
        }
    } else {
        clients[userId].send(message);
    }
};

var getClientList = function () {
    var output = {};
    for (var client in clients) {
        output[client] = {user_id: client, username: clients[client].username};
    }
    return output;
};

ws.on('connection', function connection(ws) {
    var userId;

    ws.on('message', function incoming(message) {
        message = JSON.parse(message);

        console.log('incoming', message);

        switch (message.type) {
            case "CONNECT":
                userId = clientConnect(ws, message.username);
                sendMessage(userId, userId, "USER_ID");
                var clientsList = getClientList();
                sendMessage(null, clientsList, "CLIENT_LIST");
                break;
            case "MESSAGE":
                var body = {
                    username: clients[message.userId].username,
                    message: message.message
                };

                sendMessage(message.target, body, "MESSAGE");
                break;
        }
    });

    ws.on('close', function close() {
        console.log("%s disconnected", clients[userId].username);
        delete clients[userId];
        sendMessage(null, getClientList(), "CLIENT_LIST");
    });
});

console.log("Server listening on port 9002");