var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

var messages = [];
var users = [];

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
        if(data.lengthMes != 0) {
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
            messages.length = 0;
        }
        if(msg.text.length == 0) {
            socket.emit("incorrect fields", "Your message is empty");
        } else {
            messages.push(msg);
            io.emit("chat message", msg);
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