const template = Handlebars.compile(document.querySelector('#new_channel').innerHTML);

document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // Add onsubmit property to form
    document.querySelector('#form').onsubmit = () => {
        data = {
            'room': document.querySelector('#channel').value
        };
        socket.emit('channel_creation_request', data);
        document.querySelector('#channel').value = '';

        // Stop page from reloading
        return false;
    };

    // Add new channel to list of rooms 
    socket.on('channel_created', data => {
         
        // Delete empty_message if it exists
        const element = document.getElementById('empty_message');
        if (element != null) {
            element.parentNode.removeChild(element);
        }
        // Add new channel to DOM.
        context = {
            "href": `/room/${data.room}`,
            "room": `${data.room}`
        };
        const content = template(context);
        document.querySelector('#room_list').innerHTML += content;
    });

    // Increment message counter for corresponding room
    socket.on('message_relayed', data => {
        let element = document.getElementById(`${data.room}_message_count`);
        if (parseInt(element.innerHTML) < 100) {
            element.innerHTML = parseInt(element.innerHTML) + 1;
        };
    });
});