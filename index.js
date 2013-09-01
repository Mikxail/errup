var errTo = require('errto');
var errToFunc = errTo();

var slice = Array.prototype.slice;
var argRegExp = /\(([^)]+)\)/;
var splitRegExp = /\s*,\s*/;

var foundErrorHandler = function(_caller, errorTypes, catchHandler, errorHandler){
    var _callerArgs = _caller.arguments;
    return function (err){
        // var errorHandler;

        // try found type of error and do catch
        if (catchHandler) {
            if (errorTypes && errorTypes.length) {
                for (var i=0, errType; i<errorTypes.length; i++) {
                    errType = errorTypes[i]
                    if (typeof errType == "string") {
                        if (err == errType) {
                            errorHandler = catchHandler;
                            break;
                        }
                    } else if (err instanceof errType) {
                        errorHandler = catchHandler;
                        break;
                    }
                }
            } else if (errorTypes === null) {
                errorHandler = catchHandler;
            }
        }

        if (!errorHandler) {
            // when errUp is secont, third, .. in call stacks of errUp
            if (_caller.caller+"" == errToFunc) {
                errorHandler = _caller.caller.errorHandler;
            } else {
                var paths;
                if ( paths = (_caller+"").match(argRegExp) ) {
                    paths = paths[1].split(splitRegExp);
                    for (var i=paths.length-1; i>=0; i--) {
                        if ((paths[i].indexOf("$") == 0 || module.exports.cbNames.indexOf(paths[i]) != -1)
                            && (typeof _callerArgs[i] === "function")
                            ) {
                            errorHandler = _callerArgs[i];
                            break
                        }
                    }
                }
            }
        }

        if (errorHandler) {
            errorHandler.apply(this, arguments);
            return
        } else {
            throw new Error("can not find error handler");
        }
    }
};

module.exports = function fn (errorHandler, successHandler, errorTypes, catchHandler) {
    if (typeof successHandler != "function") {
        catchHandler = errorTypes;
        errorTypes = successHandler;
        successHandler = errorHandler;
        errorHandler = null;
    }

    var errHandler = foundErrorHandler(fn.caller, errorTypes, catchHandler, errorHandler);
    return errTo(errHandler, successHandler);
};

module.exports.cbNames = ['done','next', 'cb', 'callback'];