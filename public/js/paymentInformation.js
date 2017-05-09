(function($) {

    $(function() {
        $("#purchase").submit(function(e) {
            var cardName = $("#name").val();
            var cardNumber = $("#cardNumber").val().replace(/-/g,"");
            var address = $("#address").val();
            var cvc = $("#cvc").val();
            var expirationMonth = $("#expirationMonth option:selected").val();
            var expirationYear = $("#expirationYear option:selected").text();

            var creditCardRe = new RegExp(["^(?:4[0-9]{12}(?:[0-9]{3})?|",
                                            "[25][1-7][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|",
                                            "3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])",
                                            "[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$"].join(''));

            var expirationDate = new Date(parseInt(expirationYear), parseInt(expirationMonth)-1);

            if(cardName === "" || cardNumber === "" || address === "" || cvc === "") {
                alert("You must provide information in each field");
                return false;
            }
            else if(!creditCardRe.test(cardNumber)) {
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