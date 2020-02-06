const template = Handlebars.compile(document.querySelector('#new_channel').innerHTML);

// Add channel to DOM
function render_channel(data) {

    // Delete empty_message if it exists
    const element = document.getElementById('empty_message');
    if (element != null) {
        element.parentNode.removeChild(element);
    }
    // Add new channel to DOM.
    context = {
        "href": data.href,
        "room": data.room,
        "count": data.count
    };
    const content = template(context);
    document.querySelector('#room_list').innerHTML += content;
};

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
        render_channel(data);
    });

    // Increment message counter for corresponding room
    socket.on('message_relayed', data => {
        let element = document.getElementById(`${data.room}_message_count`);
        if (parseInt(element.innerHTML) < 100) {
            element.innerHTML = parseInt(element.innerHTML) + 1;
        };
    });

    // Initialize new request for existing channel data
    const request = new XMLHttpRequest();
    request.open('POST', '/');

    // Callback function for when request completes
    request.onload = () => {

        // Extract JSON data from request
        const data = JSON.parse(request.responseText);

        // Add channels to DOM
        for (i = 0, len = data.length; i < len; i++) { 
            render_channel(data[i]);
        };
    };

    // Send request
    request.send();
    return false;
});