var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

var messages = [];
var users = []; 

// Нижче реалізується патерн Factory

class Quotes {            
    constructor() {
        this.tips = [
            'Java относится к JavaScript так же, как Сом к Сомали.',
            'Это не баг — это незадокументированная фича.',
            'Плохое ПО одного человека — постоянная работа другого.',
            'Если сразу не получилось хорошо, назовите это версией 1.0.',
            'Не волнуйся, если не работает. Если бы все всегда работало, у тебя бы не было работы.'
        ];
    }
}

class Advises {
    constructor() {
        this.tips = [
            'Той, хто сміється останнім, можливо не зрозумів жарту.',
            'Як багато можна цікавого почути, якщо частіше мовчати.',
            'Посмішка має ефект дзеркала - посміхнися і ти побачиш посмішку...',
            'Рухайся не поспішаючи, але завжди тільки вперед.',
            'Старайся! І у тебе все обов\'язково вийде.'
        ]
    }
}

class getTip {
    create (type) {
      let tip;
      if (type === 'show quote') {
        tip = new Quotes()
      } else if (type === '#@)₴?$0') {
        tip = new Advises()
      } 

      tip.type = type
      tip.getMessage = function () {

            const minCountOfTips = 0;
            const maxCountOfTips = this.tips.length - 1;
            const getRoundomNumberOfTip = Math.floor(Math.random() * (maxCountOfTips - minCountOfTips + 1)) + minCountOfTips;
            const getStringOfTipByNumber = this.tips[getRoundomNumberOfTip];

            return getStringOfTipByNumber;
      }
      return tip;
    }
  }

// Кінець реалізації патерна Factory

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/script.js", function(req, res) {
    res.sendFile(__dirname + "/script.js");
});

app.get("/style.css", function(req, res) {
    res.sendFile(__dirname + "/style.css");
});

io.on("connection", function(socket) {

    console.log("client connected");

    function changeStatusOnline(user) {
        if(user.status == "just appeared") {
            user.status = "online";
            io.emit("change status",  user);
        }
    }

    function changeStatusOffline(user) {
        if(user.status == "just left") {
            user.status = "offline";
            io.emit("change status",  user);
        }
    }

    socket.on("typing", function(data) {
        if(data.lengthMes != 0 && data.focus) {
            socket.broadcast.emit("typing", `<p><em>${data.nick} is typing a message...</em></p>`);
        } else {
            socket.broadcast.emit("typing", "");
        }
    });

    

    socket.on("chat user", function(newUser) {

        if(newUser.name.length != 0 && newUser.nickname.length != 0) {
            var coincidence = false;

            for(let i = 0; i < users.length; i++) {
                if(users[i].nickname == newUser.nickname) {
                    if(users[i].name == newUser.name) {
                        if(users[i].status != "online" && users[i].status != "just appeared") {
                            console.log(users[i].status);
                            setTimeout(changeStatusOnline, 60000, users[i]);
                            users[i].dataInv = new Date();
                            users[i].status = "just appeared";
                            users[i].id = socket.id;
                            io.emit("change status",  users[i]);
                            io.emit("change position message", users);
                            coincidence = true;
                            socket.emit("chat history current user", {msg: messages, nick: users[i].nickname});
                            socket.emit("chat user invite");
                            socket.emit("adding user",  users);
                        } else {
                            socket.emit("incorrect fields", "This user is online currently");
                            coincidence = true;
                        }
                    } else {
                        socket.emit("incorrect fields", "Incorrect name for this nick");
                        coincidence = true;
                    }
                }
            }
    
            if(!coincidence) {
                setTimeout(changeStatusOnline, 60000, newUser);
                newUser.dataInv = new Date();
                newUser.status = "just appeared";
                newUser.id = socket.id;
                users.push(newUser);
                io.emit("chat user", newUser);
              //  io.emit("change position message", newUser);
                socket.emit("chat history current user", {msg: messages, nick: newUser.nickname});
                socket.emit("chat user invite");
                socket.emit("adding user",  users);
            }
        } else {
            socket.emit("incorrect fields", "Your data either incorrect or empty");
        }
    })

    socket.on("chat message", function(msg) {
        if(messages.length == 100) {
            messages.splice(0, 1);
        }
        if(msg.text.length == 0) {
            socket.emit("incorrect fields", "Your message is empty");
        } else {
            messages.push(msg);
            io.emit("chat message", msg);
            socket.emit("chat history current user", {msg: messages, nick: msg.nickname});
        }
    });

    function returnSpecialSymbols(message) {

        const result = message.filter(item => item == '#@)₴?$0');
        
        if(result.length) {    // Якщо є співпадіння з #@)₴?$0 то довжина буде більше нуля
            return result
        } else {
            return message
        }

    }

    function getRequestToBot(message, checkSpecialSymbols) {   
        
        const splitMessageToArray = message.split(' ');

        const cutNameBot = splitMessageToArray.filter(item => item != '@bot');

        const checkingBySymbols = checkSpecialSymbols.call(null, cutNameBot);

        const stringBodyMessage = checkingBySymbols.join(' ');

        return stringBodyMessage;

    }

    socket.on("chat message bot", function(msg) {
        if(messages.length == 100) {
            messages.splice(0, 1);
        }
        if(msg.text.length == 0) {
            socket.emit("incorrect fields", "Your message is empty");
        } else {
            const tip = new getTip();
            createTipDependsToRequest = tip.create(getRequestToBot(msg.text, returnSpecialSymbols)) 
            console.log(createTipDependsToRequest.getMessage());

            const answerBot = {
                name: '@bot',
                nickname: 'bot',
                text: createTipDependsToRequest.getMessage(),
                time: new Date()
            }

            messages.push(msg);
            io.emit("chat message", msg);
            messages.push(answerBot);
            io.emit("chat message", answerBot);
            socket.emit("chat history current user", {msg: messages, nick: msg.nickname});
        }
    });

    socket.on('disconnect', function(){
        for(let i = 0; i < users.length; i++) {
            if(users[i].id == socket.id) {
                console.log(`${users[i].nickname} is disconnected`);
                users[i].status = "just left"; 
                io.emit("change status",  users[i]);
                setTimeout(changeStatusOffline, 60000, users[i]);
            }
        }
    });
});

http.listen(1428, function() {
    console.log("litening on *:1428");
});