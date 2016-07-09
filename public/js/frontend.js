$(document).ready(function ()
{

    var socket = io();
    var username = window.localStorage.getItem("username");
    var timeout = undefined;
    
    var currentRoom=''

    if (username == '' || username == undefined)
    {
        console.log('not set');
        $('#chat').hide();
        $('input[name="username"]').focus()
    } else {
        socket.emit('login', username);
    }
    $('#login').submit(function ()
    {
        var username = santize($('#username').val());
        valid = username.indexOf(' ');
        if (valid != -1) {
            $('#username').val('Please enter a username without spaces')
            return false;
        }   
        setTimeout(function() {$('input[name="inputarea"]').focus()},100); // Delay needed as the element is hidden
        socket.emit('login', username);
        return false;
    });
    
    $('#chatinput').submit(function ()
    {
        msg=$('#m').val()
        if (msg.indexOf("/") == 0) {
            if (msg.indexOf("joinroom")==1) {
                room=msg.slice(msg.indexOf(' ')+1)
                joinRoom(room);
                return false
            }
        } else { 
            console.log('sending msg to ', currentRoom)
            socket.emit('chat message',{room:currentRoom,msg:msg} );
        }
        $('#m').val('');
        return false;
    });


    socket.on('chat message', function (data)
    {
        var line = data.author + ":" + data.text;
        if (data.type == 'system')
        {
            addMessage(data.author, data.text, data.colour,data.textColour);
        }
        else
        {
            console.log("Recieved msg in room: ",data.room)
            addMessage(data.author, data.text, data.colour,data.textColour, data.time);
        }
        // clearTimeout(timeout);
        // time = setTimeout(timeoutFunction,0);
    });

    socket.on('login', function (response)
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
            socket.emit('join room', 'general',function(response) {
                console.log('Response from joining room is',response)
                if (response.success) {
                    console.log('successfully joined room general')
                    setCurrentRoom('general');
                    console.log('current room is ', currentRoom)

                } else {
                    // TODO Error handler
                }
            });
        } else {
            $('#username').val("The username '" + response.username + "' is taken already")
        }
    });

    socket.on('users', function (list)
    {
        console.log('Updating online users');
        // $('#online li').remove();
        for (var i = list.length - 1; i >= 0; i--)
        {
            var text = '<a href="" class="privateusername" id="' + list[i]['username'] + '"> <li>' + list[i]['username'] + '</li></a>';
            // console.log(text);
            $('#online').append(text);
        };
    });

    socket.on('send rooms', function(rooms) {
        console.log(rooms); // TODO. Sending blank array down??
        // for (var i = rooms.length - 1; i >= 0; i--) {
        // $('#rooms').append('<a href="" id="' + rooms[i] + '" class="inactive room"><li>' + rooms[i] + ' </li></a>');  
        // };
        $('#rooms').children().remove();

        for (room in rooms) {
            console.log(currentRoom,room);
            if (room == currentRoom) {
                anchorClass='active'
            }
            else {
                anchorClass='inactive'
            }
            $('#rooms').append('<a href="" id="' + room + '" class="' + anchorClass + ' room" onclick="return false"><li>' + room + ' </li></a>');  
        }
        console.log('rooms updated')
    });



    // $(document).on('click', '.privateusername', function (e)
    // {
    //     e.preventDefault();
    //     console.log("adding text");
    //     var user = e.currentTarget.id;
    //     $("#m").val('W:' + user);
    // });

$('#rooms').on('click','.room',function () { 
    removeActiveRoom()
    setCurrentRoom($(this).attr('id'));
    return false; //prevents reload of page.
});

$('#joinRoom').click(function() {
    var room = $('#roomInput').val();
    joinRoom(room);
    return false;
});

function removeActiveRoom() {
    $('.active').removeClass('active');
}


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

function setCurrentRoom(room)
{
    currentRoom=room
    $('#'+currentRoom).removeClass('inactive');
    $('#'+currentRoom).addClass('active');
    console.log("Current room is now " + room);
    $("#current_room").text(currentRoom);
}

function joinRoom(room) {
    socket.emit("join room",room,function(response) {
        if (response.success) {
            console.log('successfully joined room ' + room)
            setCurrentRoom(room);
    } else {
        // TODO Error handler
    }
    })
}

});

