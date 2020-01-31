import os
import requests

from flask import Flask, flash, jsonify, redirect, render_template, request, session
from flask_socketio import SocketIO, emit

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

r1 = Room("room1")
r1.add_user("alice")
r1.add_user("bob")
r1.add_user("charlie")

r2 = Room("room2")
r2.add_user("don")
r2.add_user("eddy")
r2.add_user("frank")

r3 = Room("room3")

r1.add_message("alice", "hi")
r1.add_message("bob", "hello")
r1.add_message("charlie", "bonjour")

rooms.append(r1)
rooms.append(r2)
rooms.append(r3)

##################################################################################################################
@app.route("/")
@login_required
def index():
    return render_template("index.html", user=session["username"], rooms=rooms)

##################################################################################################################
@app.route("/login", methods=["GET", "POST"])
def login():
    try:
        if session["username"] in users:
            users.remove(session["username"])
    except:
        pass
    finally:
        session.clear()

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
    if session["username"] in users:
        users.remove(session["username"])
    session.clear()
    return redirect("/login")

##################################################################################################################
@app.route("/room/<string:room_name>", methods=["GET"])
@login_required
def room(room_name):
    for room in rooms:
        if room.room == room_name:
            return render_template("room.html", user=session["username"], room=room)

    # Room name was not found
    return "Error, that room does not exist"

##################################################################################################################
# SocketIO functions
@socketio.on('message_sent')
def relay_message(data):
    for room in rooms:
        if room.room == data['room']:
            room.add_message(session["username"], data['message'])
    data["message"] = f'{session["username"]}: {data["message"]}'
    emit('message_relayed', data, broadcast=True)

##################################################################################################################
if __name__ == "__main__":
    socketio.run(app, debug=True)
