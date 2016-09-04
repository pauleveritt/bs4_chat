const CONNECT = "CONNECT",
    USER_ID = "USER_ID",
    MESSAGE = "MESSAGE",
    CLIENT_LIST = "CLIENT_LIST";

var constant = require("./../src/shared/Constants"),
    WebSocketServer = require("ws").Server,
    ws = new WebSocketServer({host: "192.168.1.9", port: 9000});

var clients = {};

var clientConnect = function(connection, username) {
    console.log("connection opened from %s", username);

    var userId = Math.round(Math.random() * 1000000000);

    clients[userId] = connection;
    clients[userId].username = username;

    return userId;
};

var sendMessage = function(userId, body, type) {
    var obj = {
        type: type,
        body: body
    };

    var message = JSON.stringify(obj);

    if(!userId) {
        for(var client in clients) {
            clients[client].send(message);
        }
    } else {
        clients[userId].send(message);
    }
};

var getClientList = function() {
    var output = {};
    for(var client in clients) {
        output[client] = {user_id: client, username: clients[client].username};
    }
    return output;
};

ws.on('connection', function connection(ws) {
    var userId;

    ws.on('message', function incoming(message) {
        message = JSON.parse(message);

        switch(message.type)
        {
            case constant.CONNECT:
                userId = clientConnect(ws, message.username);
                sendMessage(userId, userId, constant.USER_ID);
                var clientsList = getClientList();
                sendMessage(null, clientsList, constant.CLIENT_LIST);
                break;
            case constant.MESSAGE:
                var body = {
                    username: clients[message.userId].username,
                    message: message.message
                };

                sendMessage(message.target, body, constant.MESSAGE);
                break;
        }
    });

    ws.on('close', function close() {
        console.log("%s disconnected", clients[userId].username);
        delete clients[userId];
        sendMessage(null, getClientList(), constant.CLIENT_LIST);
    });
});

console.log("Server listening on port 9000");