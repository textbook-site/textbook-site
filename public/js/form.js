(function ($) {
    $(function() {
        console.log("hello");
    $("#register").submit(function(e) {
        var name = $("#name").val();
        var username = $("#username").val();
        var password = $("#password").val();
        var passwordConfirmation = $("#passwordConfirmation").val(); 

        console.log(name);
        console.log(username);
        console.log(password);
        console.log(passwordConfirmation);

        if(name === '' || username === '' || password === '' || passwordConfirmation === '') {
            alert("You must provide a name, username, password, and password confirmation");
        }
        else if(password != passwordConfirmation) {
            alert("Your passwords do not match");
        }
        else {
            $.post("/register", {
                name: name,
                username: username,
                password: password
                });
            }
        });
    });
})($)