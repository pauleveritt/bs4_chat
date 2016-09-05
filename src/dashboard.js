class ChatClient {
    constructor(userName) {
        this.model = Bind(
            {
                allUsers: [],
                userName: userName,
                userId: null,
                currentRoom: {title: ""},
                rooms: [],
                newRoom: null,
            },
            {
                userName: {
                    dom: '#username',
                    transform: (value) => value ? value : 'Disconnected'
                },
                "currentRoom.title": "#currentRoom",
                newRoom: '#newRoom',
                rooms: {
                    dom: '#rooms',
                    transform: (value) => `
                        <li><a href="${value.id}">${value.title}</a></li>
`
                }
            });
        this.socket = new WebSocket("ws://localhost:9002/");
        this.socket.onopen = () => this.onOpen();
        this.socket.onclose = () => this.onClose();
        this.socket.onmessage = (event) => this.onMessage(event);
        this.socket.onerror = (event) => this.onError(event);
    }

    onOpen() {
        this.socket.send(JSON.stringify({type: "CONNECT", username: this.model.userName}));
    }

    static onClose() {
        console.log("You were disconnected from the server");
    }

    static onError(event) {
        console.log("Error:", event);
    }

    onUnload() {
        this.socket.onclose = () => null;
        this.socket.close()
    }

    onMessage(event) {
        var data = JSON.parse(event.data);

        switch (data.type) {
            case "CLIENT_LIST":
                return this.listUsers(data);
            case "ROOMS_LIST":
                return this.listRooms(data);
            case "ROOM_POSTS":
                return this.listPosts(data);
        }
    }

    listUsers(message) {
        this.model.allUsers = message.body;
    }

    listRooms(message) {
        this.model.rooms = message.body;
    }

    listPosts(message) {
        this.model.posts = message.body;
    }

    addRoom() {
        if (this.model.newRoom) {
            console.log(this.model.newRoom);
        } else {
            console.log('no room');
        }
        this.model.newRoom = '';
    }

    setRoom(roomId) {
        this.model.currentRoom = this.model.rooms.find(room => room.id === roomId);
        console.log(999, this.model.currentRoom);
        // socket.send(JSON.stringify({type: "GET_ROOM", roomId: roomId}))
    }

}

document.addEventListener("DOMContentLoaded", () => {
    // let chat = Bind(
    //     {
    //         username: null,
    //         userId: null,
    //         currentRoom: null,
    //         rooms: []
    //     },
    //     {
    //         username: {
    //             dom: '#username',
    //             transform: (value) => value ? value : 'Disconnected'
    //         },
    //         currentRoom: "#currentRoom",
    //         rooms: {
    //             dom: '#rooms',
    //             transform: (value) => `<li><a href="${value.id}">${value.title}</a></li>`
    //         }
    //     });
    //
    // var connect = function () {
    //     var socket = new WebSocket("ws://localhost:9002/");
    //
    //     socket.onopen = function () {
    //         socket.send(JSON.stringify({type: "CONNECT", username: chat.username}));
    //     };
    //
    //     socket.onclose = function () {
    //         console.log("You were disconnected from the server");
    //     };
    //
    //     socket.onmessage = function (event) {
    //         var data = JSON.parse(event.data);
    //
    //         switch (data.type) {
    //             case "CLIENT_LIST":
    //                 // refreshClientsList(data.body);
    //                 break;
    //             case "ROOM_LIST":
    //                 chat.rooms = data.body;
    //                 break;
    //             case "USER_ID":
    //                 chat.userId = data.body;
    //                 break;
    //             case "ROOM_MESSAGES":
    //                 console.log("room messages", data.body);
    //                 break;
    //             case "MESSAGE":
    //                 console.log("msg " + data.body.username + ": " + data.body.message);
    //                 chat.rooms.push({id: 1, title: data.body.message});
    //                 break;
    //         }
    //     };
    //
    //     socket.onerror = function (event) {
    //         console.log(event);
    //     };
    //
    //     window.onbeforeunload = function () {
    //         socket.onclose = function () {
    //         };
    //         socket.close()
    //     };
    //
    //     document.querySelector('#addRoom').onsubmit = function (event) {
    //         event.preventDefault();
    //
    //         let newRoom = document.querySelector("#newRoom"),
    //             obj = {
    //                 type: "ADD_ROOM",
    //                 title: newRoom.value
    //             };
    //
    //         socket.send(JSON.stringify(obj));
    //
    //         newRoom.value = "";
    //     };
    //
    //     // Change rooms
    //     document.querySelector("#rooms").addEventListener("click", (event) => {
    //         event.preventDefault();
    //         let roomId = event.target.getAttribute("href");
    //         chat.currentRoom = chat.rooms.find(room => room.id === roomId).title;
    //         socket.send(JSON.stringify({type: "GET_ROOM", roomId: roomId}))
    //     })
    //
    // };

    let username = location.hash.substring(1);
    // If no # in URL, don't connect
    if (!username) return;
    let chat = new ChatClient(username);
    window.onbeforeunload = () => chat.onUnload();

    // Add some event handlers
    document.querySelector('#addRoom').addEventListener("submit", (event) => {
        event.preventDefault();
        chat.addRoom();
    });
    document.querySelector("#rooms").addEventListener("click", (event) => {
        event.preventDefault();
        chat.setRoom(event.target.getAttribute("href"));
    });

});