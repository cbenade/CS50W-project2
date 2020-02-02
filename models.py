class Message:
    def __init__(self, user, text, time):
        self.user = user
        self.text = text
        self.time = time

    def __str__(self):
        return f'{self.user}: {self.text}'


class Room:
    def __init__(self, room):
        self.room = room
        self.messages = []

    def __str__(self):
        return f'{self.room} ( {len(self.messages)} Messages )'

    def add_message(self, user, text, time):
        self.messages.append(Message(user=user, text=text, time=time))
        if len(self.messages) > 100:
            self.messages.remove(self.messages[0])

    def message_count(self):
        return f'{len(self.messages)}'
