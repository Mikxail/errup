var errTo = require('errto');
var errToFunc = errTo();

var slice = Array.prototype.slice;
var argRegExp = /\(([^)]+)\)/;
var splitRegExp = /\s*,\s*/;

module.exports = function fn (successHandler) {
    var errorHandler;
    if (fn.caller.caller+"" == errToFunc) {
        errorHandler = fn.caller.caller.errorHandler
    } else {
        var paths;
        if ( paths = (fn.caller+"").match(argRegExp) ) {

            paths = paths[1].split(splitRegExp);
            for (var i=paths.length-1; i>=0; i--) {
                if ((paths[i].indexOf("$") == 0 || module.exports.cbNames.indexOf(paths[i]) != -1)
                    && (typeof fn.caller.arguments[i] === "function")
                    ) {
                    errorHandler = fn.caller.arguments[i];
                    break;
                }
            }
        }
    }
    if (!errorHandler) {
        throw new Error("can not find error handler");
    }
    return errTo(errorHandler, successHandler);
};

module.exports.cbNames = ['done','next', 'cb', 'callback'];