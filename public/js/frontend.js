$(document).ready(function()
{

    var socket = io();
    var username = '';
    var timeout = undefined;
    
    var currentRoom=''

    if (username == '')
    {
        console.log('not set');
        $('#chat').hide();
    }
    $('#login').submit(function()
    {
        var username = santize($('#username').val());
        valid = username.indexOf(' ');
        if (valid != -1) {
            $('#username').val('Please enter a username without spaces')
            return false;
        }
        socket.emit('login', username);
        return false;
    });
    
    $('#chatinput').submit(function()
    {
        msg=$('#m').val()
        if (msg.indexOf("/") == 0) {
            if (msg.indexOf("join")==1) {
                room=msg.slice(5)
                console.log("Joining room ",room)
                socket.emit("join room",room)
                return false
            }
        } else { 
            socket.emit('chat message',{room:currentRoom,msg:msg} );
        }
        $('#m').val('');
        return false;
    });


    socket.on('chat message', function(data)
    {
        console.log("message is " + data);
        var line = data.author + ":" + data.text;
        if (data.type == 'system')
        {
            addMessage(data.author, data.text, data.colour,data.textColour);
        }
        else
        {
            addMessage(data.author, data.text, data.colour,data.textColour, data.time);
        }
        $("#" + data.author + "").remove();
        // clearTimeout(timeout);
        // time = setTimeout(timeoutFunction,0);
    });


    socket.on('login', function(response)
    {
        msg = response.response
        success = response.success
        if (success) {
            $('#messages').append($('<li>').text(msg));
            $('#messages').animate(
            {
                scrollTop: $('#messages').scrollHeight
            }, 300);
            $('#username').val('');
            $('#login').hide();
            $('#chat').show();
        } else {
            $('#username').val("The username '" + response.username + "' is taken already")
        }
    });

    socket.on('users', function(list)
    {
        console.log('Updating online users');
        $('#online li').remove();
        for (var i = list.length - 1; i >= 0; i--)
        {
            var text = '<a href="" class="privateusername" id="' + list[i]['username'] + '"> <li>' + list[i]['username'] + '</li></a>';
            // console.log(text);
            $('#online').append(text);
        };
    });

    socket.on('joined room',function(response) {
        if (response.success==true) {
            addMessage('system',response.data.msg,black,red)
        }
    })

    $(document).on('click', '.privateusername', function(e)
    {
        e.preventDefault();
        console.log("adding text");
        var user = e.currentTarget.id;
        $("#m").val('W:' + user);
    });
    
    $(document).on('click', '.roomname', function(e)
    {
        e.preventDefault();
        console.log(e)
        console.log("selecting room")
        var room = e.currentTarget.textContent;
        console.log('room is ', room)
        $("#current_room").text("Current room:" + room)
        $("#current_room").val("Current room:" + room)
        socket.emit('join room', room)
        currentRoom=room
    });



});

function addMessage(author, text, colour,textColour, time)
{

    if (typeof time === 'undefined')
    {
        console.log("showing welcome msg");
        $('#messages').append('<li> <span style="color:black">' + text + "</span> <span style='color:" + colour + "'>" + author + "</span></li>");
    }
    else
    {
        timestamp = time.split(' ');
        timestamp = timestamp[4];
        $('#messages').append('<li>' + timestamp + "<span style='color:" + colour + "'> " + author + "</span>:" + '<span style="color:' + textColour + '">' + text);
    }
}


function santize(input)
{
    var output = input.replace(/(,|<|\.|>|\/|\?|\;|\:|\'|\"|\{|\[|\]|})/g, "\\$1");
    return output;
}

function setCurrentRoom(e)
{
    
    console.log(e);
}