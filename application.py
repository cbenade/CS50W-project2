import os
import requests

from flask import Flask, flash, jsonify, redirect, render_template, request, session
from flask_socketio import SocketIO, emit
from datetime import datetime

from helpers import login_required
from models import Message, Room 

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0
socketio = SocketIO(app)


##################################################################################################################
# Global Variables
users = set()
rooms = []

##################################################################################################################
@app.route("/", methods=["GET", "POST"])
@login_required
def index():
    if request.method == "POST":
        data = []
        for room in rooms:
            item = {'href': f'/room/{room.room}', 'room': room.room, 'count': len(room.messages)}
            data.append(item)
        return jsonify(data)
    else:
        try:
            if session["room"] is not None:
                return redirect(f'/room/{session["room"]}')
        except:
            pass    
        return render_template("index.html", user=session["username"], rooms=rooms)

##################################################################################################################
@app.route("/exit", methods=["GET", "POST"])
@login_required
def exit():
    session["room"] = None
    return redirect("/")

##################################################################################################################
@app.route("/login", methods=["GET", "POST"])
def login():
    clear_user_session()
    if request.method == "POST":
        username = request.form.get("username")
        if username not in users:
            session["username"] = username
            users.add(username)
            return redirect("/")
        else:
            flash('That username is currently in use, try a different one.')
            return render_template("login.html")
    else:
        return render_template("login.html")

##################################################################################################################
@app.route("/logout", methods=["GET", "POST"])
@login_required
def logout():
    clear_user_session()
    return redirect("/login")

##################################################################################################################
@app.route("/room/<string:room_name>", methods=["GET", "POST"])
@login_required
def room(room_name):
    for room in rooms:
        if room.room == room_name:
            if request.method == "POST":
                data = []
                for message in room.messages:
                    item = {'text': f'{message.user}: {message.text}', 'time': message.time}
                    data.append(item)
                return jsonify(data)
            else:
                session["room"] = room_name
                return render_template("room.html", user=session["username"], room=room_name)
    # Room name was not found
    return redirect("/exit")

##################################################################################################################
# SocketIO functions
@socketio.on('channel_creation_request')
def create_channel(data):
    room_name = data["room"]
    for room in rooms:
        if room.room == room_name:
            return
    rooms.append(Room(room_name))
    data["href"] = f'/room/{room_name}'
    data["count"] = 0
    emit('channel_created', data, broadcast=True)

@socketio.on('message_sent')
def relay_message(data):
    for room in rooms:
        if room.room == data['room']:
            time = datetime.now()
            time = f'{time}'[11:19] + ', ' + f'{time}'[0:10]
            room.add_message(session["username"], data['text'], time)
    data["text"] = f'{session["username"]}: {data["text"]}'
    data["time"] = time
    emit('message_relayed', data, broadcast=True)

##################################################################################################################
# Miscellaneous helper functions
def clear_user_session():
    try:
        if session["username"] in users:
            users.remove(session["username"])
    except:
        pass
    finally:
        session.clear()

##################################################################################################################
if __name__ == "__main__":
    socketio.run(app, debug=True)
