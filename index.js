var slice = Array.prototype.slice;
var argRegExp = /\(([^)]+)\)/;
module.exports = function fn (successHandler) {
    function fn2(err){
        if (called) return; // Ignore all calls after the first one.
        called = true;
        if (err) {
            if (fn2.errorHandler) {
                fn2.errorHandler.apply(this, slice.call(arguments, 0));
            }
        } else {
            if (successHandler) {
                successHandler.apply(this, slice.call(arguments, 1));
            }
        }
    };
    var called = false;
    var errorHandler;
    if (fn.caller.caller+"" == fn2) {
        errorHandler = fn.caller.caller.errorHandler
    } else {
        var paths;
        if ( paths = (fn.caller+"").match(argRegExp) ) {

            paths = paths[1].split(/\s*,\s*/)
            var index = -1;
            for (var i=paths.length-1; i>=0; i--) {
                if (paths[i].indexOf("$") == 0) {
                    index = i;
                    break;
                }
            }
            if (index != -1) {
                errorHandler = fn.caller.arguments[index];
            }
        }
    }
    fn2.errorHandler = errorHandler;
    return fn2;
};