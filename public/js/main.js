function addToCart(sellerId, bookId) {
    if (sellerId === undefined || sellerId == "" || bookId === undefined || bookId == "")
        return;
    var status = undefined;
    $.ajax({
      type: "GET",
      url: "/addToCart/" + sellerId + "/" + bookId,
      success: function(data) {
        data = JSON.parse(data);
        status = data.status;
        if (status == 0) {
            $("#infoMessage").text("Successfully added item to cart!");
            $("#infoMessage").removeClass("hidden");
        } else if (status == 482) {
            $("#infoMessage").text("This item is already in your cart");
            $("#infoMessage").removeClass("hidden");
        } else {
            $("#infoMessage").text("There was an error adding your item to the cart please try again later");
            $("#infoMessage").removeClass("hidden");
        }
      }
    });
}
function removeFromCart(bookId, itemToRemove) {
    if (bookId === undefined || bookId == "" || itemToRemove === undefined)
        return;
    $.ajax({
      type: "GET",
      url: "/removeFromCart/" + bookId,
      success: function(data) {
        data = JSON.parse(data);
        status = data.status;
        if (status == 0) {
            $("#infoMessage").text("Successfully removed item from cart!");
            $("#infoMessage").removeClass("hidden");
            itemToRemove.parent().parent().parent().remove();
            if ($('.removeFromCartBtn').length == 0)
                location.reload();
        } else {
            $("#infoMessage").text("There was an error removing your item from the cart please try again later");
            $("#infoMessage").removeClass("hidden");
        }
      }
    });
}

$(document).ready(() => {
    $('.removeFromCartBtn').each(function() {
        $(this).on("click", function() {
            removeFromCart($(this).attr("sellerBookId"), $(this));
        });
    });
    $('button.addToCartBtn').each(function() {
        $(this).on("click", function() {
            addToCart($(this).attr("sellerId"), $(this).attr("sellerBookId"));
        });
    });
});