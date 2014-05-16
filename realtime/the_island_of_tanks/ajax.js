var ajax = {};
ajax.x = function() {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
    }
    else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
    } else {
        // CORS not supported.
        xhr = null;
    }
    return xhr;
};

ajax.send = function(url, handlers, method, data, sync) {
    var xhr = ajax.x();
    if (handlers) {
        var h = ['onerror', 'ontimeout', 'onabort', 'onloadend'];
        for (var i=0; i<h.length; i++) {
            if (handlers[h[i]]) {
                xhr[h[i]] = handlers[h[i]];
            }
        }
    }
    xhr.open(method, url, sync);
    xhr.onload = function() {
        try {
            xhr.responseJSON = JSON.parse(this.responseText);
        }
        catch(e) {}
        var status = this.status;
        if (status == 200 && handlers.onload) {
            handlers.onload.apply(this, arguments);
        }
        else if (handlers.onerror) {
            handlers.onerror.apply(this, arguments);
        }
    };
    if (method == 'POST') {
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    xhr.send(data)
};

ajax.get = function(url, data, handlers, sync) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url + '?' + query.join('&'), handlers, 'GET', null, sync)
};

ajax.post = function(url, data, handlers, sync) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url, handlers, 'POST', query.join('&'), sync)
};
