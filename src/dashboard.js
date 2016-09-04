document.addEventListener("DOMContentLoaded", () => {
    var player = Bind(
        {
            rooms: [
                {id: 1, title: "First Room"},
                {id: 2, title: "Second Room"},
                {id: 3, title: "Last"}
            ]
        },
        {
            rooms: {
                dom: '#rooms',
                transform: function (value) {
                    return `<li><a href="#${value.id}">${value.title}</a></li>`;
                },
            }
        });

    document.querySelector('form').onsubmit = function (event) {
        event.preventDefault();
        player.rooms.push(document.querySelector('#newSkill').value);
        this.reset();
    };


    let userId = "paul",
        clients = [];

    var refreshClientsList = function (updatedClients) {
        clients = updatedClients;
    };

    var connect = function (username) {
        var socket = new WebSocket("ws://localhost:9002/");

        socket.onopen = function (event) {
            socket.send(JSON.stringify({type: "CONNECT", username: username}));
        };

        socket.onclose = function () {
            console.log("You were disconnected from the server");
        };

        socket.onmessage = function (event) {
            var data = JSON.parse(event.data);

            switch (data.type) {
                case "CLIENT_LIST":
                    refreshClientsList(data.body);
                    break;
                case "USER_ID":
                    userId = data.body;
                    break;
                case "MESSAGE":
                    console.log("msg " + data.body.username + ": " + data.body.message);
                    player.rooms.push({id: 1, title: data.body.message});
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

        $("#send-message").click(function (e) {
            e.preventDefault();

            var message = $("#message").val();

            var obj = {
                type: "MESSAGE",
                target: userId,
                userId: userId,
                message: message
            };

            socket.send(JSON.stringify(obj));
        });


    };

    connect(userId);

});