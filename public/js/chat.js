/*
client 
author: Yan Hao
*/
$(document).ready(function(){

    // get current user from cookie
    var from = $.cookie('user');
    var to = 'all';

    console.log("current user: "+from);

    var socket = io();

    
    socket.emit('online', {user: from});
    // online event
    socket.on('online', function (data) {
        // show notification
        if (data.user != from) {
            var note = '<div style="color:#48C9B0">System(' + now() + '): ' + '<b>' + data.user + '</b> joins. Welcome!</div>';
        } else {
            // if current user == from
            $("#user").append("<font color='#48C9B0'> "+data.user+"</font>!");
            var note = '<div style="color:#A9CCE3">System(' + now() + '): You join!</div>';
        }
        $("#notification").prepend(note + "");
        
        // flush user list
        flushUsers(data.users);
    });

    socket.on('offline', function (data) {
        // show notification
        var note = '<div style="color:#F1948A">System(' + now() + '): ' + '<b>' + data.user + '</b> leaves.</div>';
        $("#notification").prepend(note + "");

        // flush user list
        flushUsers(data.users);
    });

    $('form').submit(function(){
        // send message to server
        socket.emit('send message', { content:$('#message').val(), from: from , to: to });
        $('#message').val('');
        return false;   // do not fresh
    });

    socket.on('send message', function(msg){
        if(from == msg.from){
            var line = msg.content;
            $('#messages').append($('<li>').text(line).addClass('message').addClass('self-message'));
        }else{
            var line = msg.from + ': ' + msg.content;
            $('#messages').append($('<li>').text(line).addClass('message'));
        }
        $('#messageList').scrollTop($('#messageList')[0].scrollHeight);
    });
    
    // formatted time
    function now() {
        var date = new Date();
        var time = date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" 
            + (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds()) + ' ' + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() ;
        return time;
    }

    // flush online user list
    function flushUsers(users) {
        // clear the list
        $("#users").empty().append($('<li>').text("Online Users").addClass("list-group-item list-group-item-success"));
        // loop and append users
        for (var i in users) {
            $("#users").append('<li href="#" class="list-group-item" alt="' + users[i] + '" title="chat to this user" onselectstart="return false">' + users[i] + '</li>');
        }
    }

    // support ctrl + enter to submit form
    $('textarea').keydown(function(e){
        if(e.which == 13 && e.ctrlKey){
            $('form').submit();
        }
    });
 
});
