var auth;

$(document).ready(function() {
    $("#con-status").hide();
    $("#auth-disconnect").hide();
    /* Define Connect button click handler. */
    $("#auth-connect").click(function() {
        var authToken = $("#auth-token").val();
        var msgType = $('input[name=message-type]:checked').val();
        if(msgType == undefined) {
            $("#conf-error").html('<p style="color:red">Choose the message type</p>');
        }
        else {
            $("#conf-error").html('');
        }
        if(authToken == '') {
            $("#api-error").html('<p style="color:red">Enter the slack api token.</p>');
        }
        else {
            $("#api-error").html('');
        }
        if (msgType != undefined && authToken != '') {
            auth = {};
            auth.token = authToken;
            localStorage.setItem('auth', JSON.stringify(auth));
            reconnectSocket();
        }
    });

    /* Define Disconnect button click handler. */
    $("#auth-disconnect").click(function() {
        $("#auth-disconnect").hide();
        $("#message").html("");
        $("#auth-token").val("");
        $("#apikey").show();
        $("#message-conf").show();
        $("#con-status").html("");
        $("#auth-connect").show();
        disconnectSocket();
    });
});
