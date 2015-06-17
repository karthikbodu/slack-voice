var auth;

$(document).ready(function() {

    /* Define Connect button click handler. */
    $("#auth-connect").click(function() {
        auth = {}
        auth.token = $("#auth-token").val();
        localStorage.setItem('auth', JSON.stringify(auth));
        reconnectSocket();
    });

    /* Define Disconnect button click handler. */
    $("#auth-disconnect").click(function() {
        disconnectSocket();
    });

    /* Load token from localStorage. */
    var auth_str = localStorage.getItem('auth');
    if (auth_str != null) {
        auth = JSON.parse(auth_str);
        $("#auth-token").val(JSON.parse(auth_str).token);
        setTimeout('reconnectSocket()', 1000);
    }
});
