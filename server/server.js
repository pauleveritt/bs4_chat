var WebSocketServer = require("ws").Server,
    ws = new WebSocketServer({host: "localhost", port: 9002});

var clients = {},
    // Some dummy default data for rooms
    rooms = [
        {
            id: Math.random() * 1000000000,
            title: "General",
            posts: [
                {
                    from: "hadi",
                    body: "This is the first message"
                }
            ]
        },
        {
            id: Math.random() * 1000000000,
            title: "Random",
            posts: [
                {
                    from: "hadi",
                    body: "Another first message for another room"
                },
                {
                    from: "hadi",
                    body: "One more, right here"
                }
            ]
        }
    ];

// We maintain a list of connections by username, so we can
// route a message to a single user instead of broadcast.
var clientConnect = function (connection, username) {
    console.log("connection opened from %s", username);

    var userId = Math.round(Math.random() * 1000000000);

    clients[userId] = connection;
    clients[userId].username = username;

    return userId;
};


// All outgoing messages have a type and body
var sendMessage = function (userId, body, type) {
    var obj = {
        type: type,
        body: body
    };

    var message = JSON.stringify(obj);

    if (!userId) {
        // No username provided, so send to everyone
        for (var client in clients) {
            clients[client].send(message);
        }
    } else {
        // Only send to one user
        clients[userId].send(message);
    }
};

// A way to see what users are logged in
var getClientList = function () {
    var output = {};
    for (var client in clients) {
        output[client] = {user_id: client, username: clients[client].username};
    }
    return output;
};

ws.on('connection', function connection (ws) {
    var userId;

    ws.on('message', function incoming (message) {
        message = JSON.parse(message);

        console.log('incoming', message);

        switch (message.type) {
            case "CONNECT":
                userId = clientConnect(ws, message.username);
                sendMessage(userId, userId, "USER_ID");
                var clientsList = getClientList();
                sendMessage(null, clientsList, "CLIENT_LIST");
                sendMessage(userId, rooms, "ROOMS_LIST");
                sendMessage(userId, rooms[0], "ROOM_POSTS");
                break;
            case "ADD_ROOM":
                rooms.push({
                    id: Math.round(Math.random() * 1000000000),
                    title: message.title,
                    posts: []
                });
                sendMessage(null, rooms, "ROOMS_LIST");
                break;
            case "GET_ROOM":
                let room =rooms.find((room) => room.id == message.roomId);
                sendMessage(userId, room, "ROOM_POSTS");
                break;
            case "ADD_POST":
                let roomId = message.roomId,
                    from = message.from,
                    body = message.body;
                let thisRoom = rooms.find((r) => r.id == roomId);
                thisRoom.posts.push({
                    from: from,
                    body: body
                });
                sendMessage(null, thisRoom, "ROOM_POSTS");
                break;
        }
    });

    ws.on('close', function close () {
        console.log("%s disconnected", clients[userId].username);
        delete clients[userId];
        sendMessage(null, getClientList(), "CLIENT_LIST");
    });
});

console.log("Server listening on port 9002");