document.addEventListener("DOMContentLoaded", () => {
    const ws = new WebSocket("ws://127.0.0.1:5678/");
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


    ws.onmessage = function (event) {
        //player.rooms.push({id: event.data, title: event.data});
    };
});