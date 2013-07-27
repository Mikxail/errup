## errup - magick error handling for node.js

All hates "callback hell" in node.js. With this module you doesn't need check 'err' every callback. Callback error will be checked automaticly and will be rised if it needed.

## Sample Usage (JavaScript)
```javascript
// old style - without errup module
function readDirectoryAsync (path, callback) {
    fs.readdir(path, function(err, filenames){
        if (err) {
            callback(err);
            return;
        }
        // do something
        console.log('Success');
        callback(null, filenames);
    });
}

// new style - with errup module
errUp = require('errup');
function readDirectoryAsync (path, callback) {
    fs.readdir(path, errUp(function(filenames){
        // Error check and rise to callback automaticly in errUp on error.
        // This code is called only when no error given.
        // do something
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

// process on error
app.use(function(err, req, res, next){
    res.send(404);
});


// async sample
fs = require('fs');
async = require('async');
function readDirDataAsync(path, callback) {
    readDirectoryAsync(path, errUp(function(filenames){
        totalLength = 0;
        async.map(filenames, function(filepath, next){
            fs.stat(filepath, errUp(function(stat){
                if(stat.isDirectory()){
                    return next(null, 'dir');
                }
                fs.readFile(filepath, errUp(function(data){
                    totalLength += data.length;
                    next(null, data);
                }));
            }));
        }, errUp(function(results){
            callback(null, {totalLength: totalLength, files: results});
        }));
    }));
}
```



