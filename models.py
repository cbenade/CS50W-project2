class Message:
    def __init__(self, user, text):
        self.user = user
        self.text = text

    def __str__(self):
        return f'{self.user}: {self.text}'


class Room:
    def __init__(self, room):
        self.room = room
        self.users = []
        self.messages = []

    def __str__(self):
        return f'Room name: {self.room}'

    def add_user(self, user):
        if user not in self.users:
            self.users.append(user)

    def remove_user(self, user):
        if user in self.users:
            self.users.remove(user)

    def list_users(self):
        user_list = ""
        for user in self.users:
            string += user + " "
        if user_list == "":
            return "Room is empty"
        else:
            return user_list

    def add_message(self, user, text):
        self.messages.append(Message(user=user, text=text))
