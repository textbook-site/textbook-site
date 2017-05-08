(function($) {

    $(function() {
        $("#purchase").submit(function(e) {
            var cardName = $("#name").val();
            var cardNumber = $("#cardNumber").val();
            var address = $("#address").val();
            var cvc = $("#cvc").val();
            var expirationMonth = $("#expirationMonth option:selected").val();
            var expirationYear = $("#expirationYear option:selected").text();


            var expirationDate = new Date(parseInt(expirationYear), parseInt(expirationMonth)-1);

            if(cardName === "" || cardNumber === "" || address === "" ||
                cvc === "") {
                alert("You must provide information in each field");
                return false;
            }
            else if(cardNumber.length != 15) {
                alert("You must provide a valid credit card number");   
                return false;
            }
            else if(isNaN(cvc) || cvc.length > 3) {
                alert("CVC must be a valid number");
                return false;
            }
            else if(expirationDate < new Date()) {
                alert("The card with this expiration date has expired.");
                return false;
            }
        });
    });
})($);