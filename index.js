var _ = require("underscore");
var buildTags = function(metas, prefix,ignorePrefix) {
    var tags = "";
    var links = metas[prefix].meta;
    prefix = ignorePrefix ? '' : prefix+':';
    for (var i in links) {
        var link = links[i];
        var keys = Object.keys(link);
        for (var j in keys) {
            var key = keys[j];
            tags += '<meta property="'+ prefix + key + '" content="' + link[key] + '">\n';
        }
        return tags;
    }
};

var injectMetaOptions = function(str, options, prefix,ignorePrefix) {
    return str.replace(/<head>((?:.|\n|\r)+?)<\/head>/i, "<head>$1" + buildTags(options, prefix, ignorePrefix)+"</head>");
};

var Meta = function(prefix, ignorePrefix){

    return function(platforms) {
        return function(req, res, next) {
            res._metas = res._metas || {};
            if (_.isFunction(platforms)) {
                platforms = platforms(req, res);
            }
            if (!_.isArray(platforms)) {
                platforms = [ platforms ];
            }
            var htmlMetaHeaders = req.headers["prefer-html-meta-tags"] || "";
            var preferMetas = _.some(htmlMetaHeaders.split(","), function(value) {
                return value.trim() === prefix;
            });
            if (preferMetas) {
                // Always returns html
                res.set("Content-Type", "text/html");
            }
            // Only modify the render function once in case app links
            // is defined multiple times
            if (!res._metas[prefix]) {
                var render = res.render;
                res.render = function(view, options, finishCallback) {
                    options = options || {};
                    // Support callback function as second arg
                    if (_.isFunction(options)) {
                        finishCallback = options, options = {};
                    }
                    var self = this;
                    var defaultCallback = function(err, str) {
                        if (err) {
                            return req.next(err);
                        }
                        self.send(str);
                    };
                    if (!_.isFunction(finishCallback)) {
                        finishCallback = defaultCallback;
                    }
                    if (res._metas[prefix].preferMetas) {
                        // If we prefer App Links, let's render simple HTML
                        str = "<html><head></head><body></body><html>";
                        str = injectMetaOptions(str, res._metas, prefix, ignorePrefix);
                        res.send(str);
                    } else {
                        render.call(res, view, options, function(err, str) {
                            str = injectMetaOptions(str, res._metas, prefix,ignorePrefix);
                            // remove _appLinks object from response
                            delete res._metas[prefix];
                            finishCallback(err, str);
                        });
                    }
                };
            }

            // Inject app links meta to response object
            res._metas = res._metas || {};
            res._metas[prefix] = res._metas[prefix] || {};
            res._metas[prefix].meta =  res._metas[prefix].meta || [];
            // Render more specific meta tag first
            res._metas[prefix].meta = platforms.concat(res._metas[prefix].meta);
            res._metas[prefix].preferAppLinks = preferMetas;
            next();
        };
    }
}

module.exports = Meta;
