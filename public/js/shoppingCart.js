(function() {
    $(function() {
        var total = 0;
        var bookTotal = 0
        $('.bookPrice').each(function() {
            bookTotal = parseInt($(this).text());
            if(!isNaN(bookTotal) && bookTotal.length != 0) {
                total+= bookTotal;
            }
        }); 
    });
})()