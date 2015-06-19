var _socket;
var userID;
var userName;
var prefs;
var conn;
var retry_timer;
var heartbeat_timer;
var ping_counter = 1;
var defibrillate_timer;

function connectSocket(url) {
    _socket = new WebSocket(url);

    _socket.onopen = function (event) {
        clearTimeout(retry_timer);
        heartbeat_start();
        $("#apikey").hide();
        $("#message-conf").hide();
        $("#con-status").show();
        $("#con-status").html('<p>Connected</p></p><img src="img/circle_green.png"/>');
        $("#auth-connect").hide();
        $("#auth-disconnect").show();
        conn = true;
    };
    _socket.onmessage = function (event) {
        var message = JSON.parse(event.data);
        var matched = true;
        var patt = '';
        heartbeat_beat();
        var messageText = message.text;
        var msgPref = $('input[name=message-type]:checked').val();
        if (msgPref == "mentions" && messageText != '') {
            matched = false;
            var prefString = prefs.split(",");
            if (messageText != undefined && userName != undefined) {
                messageText = messageText.replace(/<@.*>/, userName);
                prefString.push('@' + userName);
            }
            var pstrlen = prefString.length;
            for (i = 0; i < pstrlen; i++) {
                patt = new RegExp(prefString[i], "g");
                matched = patt.test(messageText);
                if (matched) {
                    break;
                }
            }
        }

        // Translate the message to voice
        if (message.type == 'message' && userID != message.user && matched == true) {
            var userName = getSlackUser(message.user);
            messageText = userName + ' says ' + messageText;
            var tts = new GoogleTTS('en');
            tts.play(messageText);
        }
        else if (message.type == 'pong') {
            heartbeat_cancel_defibrillate();
        }
    };

    _socket.onerror = function (event) {
        setTimeout('reconnectSocket()', 1000);
        heartbeat_stop();
    };

    _socket.onclose = function (event) {
        if (conn) {
            setTimeout('reconnectSocket()', 1000);
            heartbeat_stop();
        }
    };
}

function disconnectSocket() {
    _socket.close();
    localStorage.setItem('auth', '');
    conn = false;
}

function reconnectSocket() {
    retry_timer = setTimeout('reconnectSocket()', 30000);
    $.ajax({
        url: "https://slack.com/api/rtm.start",
        data: {
            token: auth.token
        },
        success: function(data, status, jqxhr) {
            if(data.ok) {
                userName = data.self.name;
                userID = data.self.id;
                prefs = data.self.prefs.highlight_words;
                connectSocket(data.url);
            }
            else {
                $("#api-error").html('<p style="color:red">Invalid slack api token.</p>');
            }
        }
    });
}

function heartbeat_start() {
    heartbeat_timer = setTimeout('heartbeat_check()', 30000);
}

function heartbeat_beat() {
    clearTimeout(heartbeat_timer);
    heartbeat_timer = setTimeout('heartbeat_check()', 30000);
}

function heartbeat_check() {
    defibrillate_timer = setTimeout('heartbeat_defibrillate()', 10000);
    _socket.send(JSON.stringify({id: ping_counter++, type: "ping"}));
}

function heartbeat_defibrillate() {
    setTimeout('reconnectSocket()', 1000);
}

function heartbeat_cancel_defibrillate() {
    clearTimeout(defibrillate_timer);
}

function heartbeat_stop() {
    cleartTimeout(heartbeat_timer);
}

function getSlackUser(uid) {
    $.ajax({
        url: "https://slack.com/api/users.list",
        data: {
            token: auth.token
        },
        success: function(data, status, jqxhr) {
            if(data.ok) {
                var memCount = data.members.length;
                for(var i = 0; i < memCount; i++ ) {
                    if(data.members[i].id == uid) {
                        return data.members[i].real_name;
                    }
                }
            }
            //else {
            //    $("#api-error").html('<p style="color:red">Invalid slack api token.</p>');
            //}
        }
    });
}