if (typeof framesApiCall !== "undefined") { 
    framesApiCall = framesApiCall.replace("http:", '');
    framesApiCall = framesApiCall.replace("https:", '');
}
var topics;
jQuery.Topic = function (t) {
    var e, i = t && topics[t];
    return i || (e = jQuery.Callbacks(),
        i = {
            publish: e.fire,
            subscribe: e.add,
            unsubscribe: e.remove
        },
    t && (topics[t] = i)),
        i
};
var UnlvCart = {

    new_cart: function (token) {
        var e = framesApiCall + "/v2/token/" + g_opt_obj.token + "/cart",
            i = createCORSRequest("GET", e);
        return i ? (i.onload = function () {
            var t = i.responseText;
            t = JSON.parse(t);
			if(t.error){ 
				console.log("error "+t.error); 
			} else {
            var e = t.cart.id;
            window.g_cart_id = e;
            var n, cookieDomain = $('.o-shoppingCart').attr('data-cookie'),
                ua = window.navigator.userAgent,
                msie = ua.indexOf("MSIE ")

            var o = {};
            o.cartId = e, o.cartTimestamp = Math.round((new Date).getTime() / 1e3), o.cartExpiration = o.cartTimestamp + 15768e4;
            var a = "_cart_" + g_opt_obj.token;
            UnlvCart.setCookie(a, JSON.stringify(o), "");

            Cart.render_cart_tab(g_opt_obj.token, t), console.log("cookie created");
			}
        }, void i.send()) : void console.log("CORS not supported")
    },
    setCookie: function (e, o, n) {
        n = n || 365 * 5;
        var t = new Date
            , i = new Date;
        i.setTime(t.getTime() + 36e5 * 24 * n),
            document.cookie = e + "=" + escape(o) + ";path=/;domain=" + location.host.split('.').splice(1).join('.') + ";expires=" + i.toGMTString()
    },

    get_cart: function (token, cartId) {
        var apiUrl = framesApiCall + '/v2/token/' + token + '/cart/' + cartId,
            request = '';
        try {
            if (window.XMLHttpRequest) {
                request = new XMLHttpRequest();
                request.open('GET', apiUrl, false);
            } else {
                request = new XDomainRequest();
                request.open('GET', apiUrl);
            }
            request.send('Data');
            request.onerror = function (e) {
            };
            var responseText = $.parseJSON(request.responseText);
            return responseText;
        }
        catch(e) {
            
        }
    },

    find_cookie: function (t) {
        for (var e = '_cart_' + g_opt_obj.token + '=', i = document.cookie.split(';'), o = 0; o < i.length; o++) {
            for (var n = i[o];
                 ' ' === n.charAt(0);) {
                n = n.substring(1);
            }
            if (-1 !== n.indexOf(e)) {
                return JSON.parse(unescape(n.substring(e.length, n.length)));
            }
        }
        return '';
    },

    GetCartId: function () {
        var cookie = this.find_cookie(this.activeToken());
        return cookie.cartId;
    },

    UpdateCartCount: function (json) {

        var result, count;
        if (typeof json == 'boolean') {
            result = UnlvCart.get_cart(g_opt_obj.token, UnlvCart.GetCartId());
            if(result.error) {
                console.log('result: Token error');
            }
            else {
                count = result.cart.qty;
            }

        } else {
            json = $.parseJSON(json);
            count = json.cart.cart.qty;
            $('#shoppable_magic_v1_pdp_container_close_btn').trigger('click');
            var mql = window.matchMedia("screen and (min-width: 1025px)")
            if (mql.matches) { // if media query matches
                // globalNavigation.buildViewBag(json);
            }
        }
        if (count > 0) {
            $('.o-shoppingCart > a span').html(count);
        } else {
            $('.o-shoppingCart > a span').html(0);
        }
    },

    put_item: function (selected_sku, token, cart_id, qty, putcallback, prodSkuId) {

        var apiUrl = framesApiCall + '/v2/token/' + g_opt_obj.token + "/cart/" + cart_id + "/put/" + selected_sku + "/qty/" + qty + "/idLookupType/" + "sku" + "/productId/" + selected_sku;
        var xhr = createCORSRequest('GET', apiUrl);
        xhr.onload = function () {
            var response_text = xhr.responseText;
            response_text = JSON.parse(response_text);
            putcallback(response_text, selected_sku, prodSkuId, g_opt_obj.token, cart_id);

        };
        xhr.send();
    },
    get_item: function (sku) {

        var request_url = squireApiCall2 + 'product?sku=' + sku;
        var xhr = createCORSRequest('GET', request_url);
        xhr.onload = function () {
            var response_text = JSON.parse(xhr.responseText);
            product = response_text.found_products;
            for (key in product) {
                if (product.hasOwnProperty(key)) {
                    var p_value = product[key]
                    UnlvCart.pop_pdp(p_value);
                    break
                }
            }

        };

        xhr.send();
    },

    /*functions*/
    buildItemList: function (shoppableBagData) { // shoppingbag page
        var result = UnlvCart.get_cart(UnlvCart.activeToken(), UnlvCart.GetCartId());
        UnlvCart.UpdateCartCount(true);
    },

    EditItem: function (data) {
    },

    closeViewBagPopup: function () { // pdp page
        $('#viewMyBag').siblings('.arrowLink').remove();
        $('#viewMyBag').remove();
    },

    activeToken: function () {
        return g_opt_obj.token;
    },

    init: function () {
        var script_tag = document.getElementById('shoppable_unlv_bundle_v0-1'),
            opt_string = script_tag.getAttribute('options'),
            opt_obj = JSON.parse("{" + opt_string + "}");

        window.g_opt_obj = opt_obj;

        this.activeToken();

        $.Topic('ADD_TO_CART').subscribe(UnlvCart.UpdateCartCount);
        $.Topic('BUY_AT').subscribe(UnlvCart.AmazonEvent);

        return this;
    }
}

$(document).ready(function () {
    UnlvCart.init();
});
