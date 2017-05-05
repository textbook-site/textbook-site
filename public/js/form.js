(function ($) {
    $(function() {
        $("#signupButton").click(function(e) {
            var name = $("#name").val();
            var username = $("#username").val();
            var password = $("#password").val();
            var passwordConfirmation = $("#passwordConfirmation").val(); 

            if(name === '' || username === '' || password === '' || passwordConfirmation === '') {
                alert("You must provide a name, username, password, and password confirmation");
                return false;
            }
            else if(password != passwordConfirmation) {
                alert("Your passwords do not match");
                return false;
            }
            // else {
            //     $.post("/register", {
            //         name: name,
            //         username: username,
            //         password: password
            //         });
            //     }
            });
        });
})($)