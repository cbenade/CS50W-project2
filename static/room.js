// Functions used to hide/unhide timestamps when messages are moused over/out
function hidetimes() {
    document.querySelectorAll('.message_time').forEach(time => {
        time.hidden = true;
    });
};

function unhidetimes() {
    document.querySelectorAll('.message_time').forEach(time => {
        time.hidden = false;
    });
}

const template = Handlebars.compile(document.querySelector('#new_message').innerHTML);

document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // Variables
    const room_name = document.querySelector('#room').innerHTML;

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
            
            // Delete empty_message if it exists
            const element = document.getElementById('empty_message');
            if (element != null) {
                element.parentNode.removeChild(element);
            }

            // Add new message to DOM.
            context = {
                "message": data.text,
                "time": data.time
            };
            const content = template(context);
            document.querySelector('#message_list').innerHTML += content;
        }
    });
});