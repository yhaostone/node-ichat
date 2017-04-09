/* 
    server 
    author: Yan Hao
*/
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');

var urlencodedParser = bodyParser.urlencoded({ extended: true });

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


server.listen(3000,function(){
    console.log("Listening on port 3000.");
});

// online users
var users = {};

app.get('/',function(req, res){
    console.log("user in cookie now: "+req.cookies.user);
    if (req.cookies.user == null) {
        res.redirect('/signin');
    } else {
        res.sendFile(path.join(__dirname, 'views', 'index.html'));
    }
});

// sign in
app.get('/signin', function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'signin.html'));
});

// post username
app.post('/signin', urlencodedParser, function (req, res) {
    if (users[req.body.username]) {
        // if exist, return to signin
        res.redirect('/signin');
    } else {
        console.log("username to put in cookie: "+req.body.username);
        // if not exist, save the user to cookie
        res.cookie("user", req.body.username, {maxAge: 1000*60*60*24*30});
        res.redirect('/');
    }
});

io.sockets.on('connection',function(socket){

    // when a user online
    socket.on('online', function (data) {
        // save online user's name as socket's name for further identification
        socket.name = data.user;
        // add user to users list
        if (!users[data.user]) {
            users[data.user] = data.user;
        }
        console.log("User " + data.user + " is online!");
        // broadcast to all
        io.sockets.emit('online', {users: users, user: data.user});
        console.log(users);
    });

    // when a user offline
    socket.on('disconnect', function() {
        // if exist in users list
        if (users[socket.name]) {
            // delete from users list
            delete users[socket.name];
            console.log("User " + socket.name + " leaves...");
            // broadcast to others
            socket.broadcast.emit('offline', {users: users, user: socket.name});
        }
    });

    socket.on('send message',function(msg){
        console.log("Message from: " + msg.from + ', to: ' + msg.to + ",content: " + msg.content);

        // broadcast to all
        io.sockets.emit('send message', msg);
    });

});

module.exports = app;