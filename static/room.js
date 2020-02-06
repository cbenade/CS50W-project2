const template = Handlebars.compile(document.querySelector('#new_message').innerHTML);

// Add message to DOM
function render_message(data) {

    // Delete empty_message if it exists
    const element = document.getElementById('empty_message');
    if (element != null) {
        element.parentNode.removeChild(element);
    }
    
    // Add new message to DOM.
    context = {
        "text": data["text"],
        "time": data["time"]
    };
    const content = template(context);
    document.querySelector('#message_list').innerHTML += content;
};

// Functions used to hide/unhide timestamps when messages are moused over/out
function hide_times() {
    document.querySelectorAll('.message_time').forEach(time => {
        time.hidden = true;
    });
};

function unhide_times() {
    document.querySelectorAll('.message_time').forEach(time => {
        time.hidden = false;
    });
}

document.addEventListener('DOMContentLoaded', () => {

    // Set document variables
    const room_name = document.querySelector('#room').innerHTML;

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // Add onsubmit property to form
    document.querySelector('#form').onsubmit = () => {
        data = {
            'room': room_name,
            'text': document.querySelector('#message').value
        };
        socket.emit('message_sent', data);
        document.querySelector('#message').value = '';

        // Stop page from reloading
        return false;
    };

    // Upon recieving message, append message to message_list
    socket.on('message_relayed', data => {
        
        // Check message room tag prior to appending
        if (data.room === room_name) {
            
            render_message(data);
        };
    });

    // Initialize new request for existing message data
    const request = new XMLHttpRequest();
    request.open('POST', `/room/${room_name}`);

    // Callback function for when request completes
    request.onload = () => {

        // Extract JSON data from request
        const data = JSON.parse(request.responseText);

        // Add messages to DOM
        for (i = 0, len = data.length; i < len; i++) { 
            render_message(data[i]);
        };
    };

    // Send request
    request.send();
    return false;
});