document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // Add onsubmit property to form
    document.querySelector('#form').onsubmit = () => {
        data = {
            'room': document.querySelector('#room').innerHTML,
            'message': document.querySelector('#message').value
        };
        socket.emit('message_sent', data);
        document.querySelector('#message').value = '';

        // Stop page from reloading
        return false;
    };

    // Upon recieving message, append message to message_list
    socket.on('message_relayed', data => {
        
        // Delete empty_message if it exists
        const element = document.getElementById('empty_message');
        if (element != null) {
            element.parentNode.removeChild(element);
        }

        // Append message to message_list
        const div = document.createElement('div');
        div.className = 'message_entry';
        div.innerHTML = data.message;
        document.querySelector('#message_list').append(div);
    });

    





// // Use ajax to dynamically load messages 
// document.querySelector('#form').onsubmit = () => {
//     // Initialize new request
//     const request = new XMLHttpRequest();
//     const message = document.querySelector('#message').value;
//     request.open('POST', window.location.pathname);

//     // Callback function for when request completes
//     request.onload = () => {

//         // Extract JSON data from request
//         const data = JSON.parse(request.responseText);

//         // Update the result div
//         if (data.success) {
//             const contents = `1 USD is equal to ${data.rate} ${currency}.`
//             document.querySelector('#result').innerHTML = contents;
//         }
//         else {
//             document.querySelector('#result').innerHTML = 'There was an error.';
//         }
//     }

//     // Add data to send with request
//     const data = new FormData();
//     data.append('currency', currency);

//     // Send request
//     request.send(data);
//     return false;
// };

});