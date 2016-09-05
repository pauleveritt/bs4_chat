document.addEventListener("DOMContentLoaded", () => {
    let chat = Bind(
        {
            username: null,
            userId: null,
            currentRoom: null,
            rooms: []
        },
        {
            username: {
                dom: '#username',
                transform: (value) => value ? value : 'Disconnected'
            },
            currentRoom: "#currentRoom",
            rooms: {
                dom: '#rooms',
                transform: function (value) {
                    return `<li><a href="${value.id}">${value.title}</a></li>`;
                },
            }
        });

    var connect = function () {
        var socket = new WebSocket("ws://localhost:9002/");

        socket.onopen = function () {
            socket.send(JSON.stringify({type: "CONNECT", username: chat.username}));
        };

        socket.onclose = function () {
            console.log("You were disconnected from the server");
        };

        socket.onmessage = function (event) {
            var data = JSON.parse(event.data);

            switch (data.type) {
                case "CLIENT_LIST":
                    // refreshClientsList(data.body);
                    break;
                case "ROOM_LIST":
                    chat.rooms = data.body;
                    break;
                case "USER_ID":
                    chat.userId = data.body;
                    break;
                case "ROOM_MESSAGES":
                    console.log("room messages", data.body);
                    break;
                case "MESSAGE":
                    console.log("msg " + data.body.username + ": " + data.body.message);
                    chat.rooms.push({id: 1, title: data.body.message});
                    break;
            }
        };

        socket.onerror = function (event) {
            console.log(event);
        };

        window.onbeforeunload = function () {
            socket.onclose = function () {
            };
            socket.close()
        };

        document.querySelector('#addRoom').onsubmit = function (event) {
            event.preventDefault();

            let newRoom = document.querySelector("#newRoom"),
                obj = {
                    type: "ADD_ROOM",
                    title: newRoom.value
                };

            socket.send(JSON.stringify(obj));

            newRoom.value = "";
        };

        // Change rooms
        document.querySelector("#rooms").addEventListener("click", (event) => {
            event.preventDefault();
            let roomId = event.target.getAttribute("href");
            chat.currentRoom = chat.rooms.find(room => room.id === roomId).title;
            socket.send(JSON.stringify({type: "GET_ROOM", roomId: roomId}))
        })

    };

    chat.username = location.hash.substring(1);
    if (chat.username) {
        // If no # in URL, don't connect
        connect();
    }

});