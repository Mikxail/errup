## errup - magick error handling for node.js

All hates "callback hell" in node.js. With this module you doesn't need check 'err' every callback. Callback error will be checked automaticly and will be rised if it needed.

## Old style(without errup)
```javascript
function readDirectoryAsync (path, callback) {
    fs.readdir(path, function(err, filenames){
        if (err) {
            callback(err);
            return;
        }
        // do something there
        console.log('Success');
        callback(null, filenames);
    });
}
```

## New style - with errup (JavaScript)
```javascript
errUp = require('errup');
function readDirectoryAsync (path, callback) {
    fs.readdir(path, errUp(function(filenames){
        // Error check and rise to callback automaticly in errUp on error.
        // This code is called only when no error given.
        // do something there
        console.log('Success');
        callback(null, filenames);
    }));
}

// express sample
app.get("/", function(req, res, next){
    readDirectoryAsync(__dirname, errUp(function(filenames){ // error will be raised and called next(err) on error
        res.send(filenames);
    }));
});
```

## With CoffeeScript
```coffeescript
errUp = require 'errup'
app.get "/", (req, res, next) ->
    readDirectoryAsync __dirname, errUp (filenames) ->
        res.send filenames
```

## Can also set error handler callback
May be need if last function in stack is not errUp(eg closure, or other)
```coffeescript
app.get "/", (req, res, next) ->
    do () ->
        anyAsyncFunc errUp next, (ret) ->
            res.send ret

anyAsyncFunc = (callback) ->
    fs.readdir __dirname, (err, dir) ->
        if err? return callback(null, []) # skip error
        async.map dir, errUp callback, (stat) ->
            return next null, stat
        , errUp callback, (statResult) ->
            // .. do something with statResult
            callback null, statResult
```

## Can also catch some errors
```coffeescript
LockError = (@message) ->
    @name = "LockError"
LockError:: = Error::

readDirAsync = (callback) ->
    fs.readdir __dirname, errUp (dir) ->
        for path in dir
            if path is "lock"
                return callnack new LockError("lock was found")
        callback null, dir

readStatus = (callback) ->
    fs.readFile "status", errUp (data) ->
        if data.langth > 1000000
            return callback "many"
        return callback null, data


readDirAsync errUp (dir) ->
    # error "many" will raised, and can be catched
    readStatus errUp (status) ->
        console.log(dir, status)
, [LockError, 'many'], (err) ->
    if err is 'many'
        console.warn "Panic! Get many."
    else
        console.warn "Lock found.. Delete it."
        fs.unlink "lock"
```