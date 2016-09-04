document.addEventListener("DOMContentLoaded", () => {
    let rooms = [
        {id: 1, title: "First Room"},
        {id: 2, title: "Second Room"},
        {id: 3, title: "Last"}
    ];
    var player = Bind(
        {
            rooms: rooms
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
});