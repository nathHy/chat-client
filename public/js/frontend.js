$(document).ready(function()
{

    var socket = io();
    var username = '';
    var typing = false;
    var timeout = undefined;

    if (username == '')
    {
        console.log('not set');
        $('#chat').hide();
    }
    $('#login').submit(function()
    {
        var username = santize($('#username').val());

        socket.emit('login', username);
        $('#username').val('');
        $('#login').hide();
        $('#chat').show();
        return false;
    });
    $('#m').keyup(function(e)
    {
        if (e.which !== 13)
        {
            if (typing === false && $("#m").is(":focus") || $('#m').val() != '')
            {
                typing = true;
                socket.emit("typing", true);
                console.log("typing!");
            }
            else
            {
                clearTimeout(timeout);
                timeout = setTimeout(timeoutFunction, 5000);
                console.log("reset timeout");
            }
        }
    });

    socket.on("isTyping", function(data)
    {
        console.log("typing function beg");
        console.log(data);
        if ($("#updates").children().length == 0)
        {
            $("#typing").css("display", 'none');
        }
        else
        {
            $("#typing").css("display", 'inline');
        }
        console.log(data.isTyping);
        if (data.isTyping)
        {
            console.log('istyping is true');
            if ($("#" + data.person + "").length === 0)
            {
                console.log('data.person length is 0');
                console.log(data.person);
                $("#updates").append("<span id='" + data.person + "'>" + data.person + " <span>");
                console.log("isTyping Function");
                timeout = setTimeout(timeoutFunction, 5000);
            }
        }
        else
        {
            $("#" + data.person + "").remove();
        }
        if ($("#updates").children().length == 0)
        {
            console.log('length is 0, hiding typing')
            $("#typing").css("display", 'none');
        }
        else
        {
            console.log('length is not 0,showing typing')
            $("#typing").css("display", 'inline');
        }
    });

    // socket.on('send history',function(data){
    //     console.log("history is " + data);

    // });

    $('#chatinput').submit(function()
    {
        socket.emit('chat message', $('#m').val());
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
        console.log('recieving msg');
        $("#" + data.author + "").remove();
        // clearTimeout(timeout);
        // time = setTimeout(timeoutFunction,0);
        console.log('finishing msg');
    });


    socket.on('login', function(msg)
    {
        $('#messages').append($('<li>').text(msg));
        $('#messages').animate(
        {
            scrollTop: $('#messages').scrollHeight
        }, 300);
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


    $(document).on('click', '.privateusername', function(e)
    {
        e.preventDefault();
        console.log("adding text");
        var user = e.currentTarget.id;
        $("#m").val('W:' + user);
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

function timeoutFunction()
{
    typing = false;
    socket.emit("typing", false);
}