errUp = require(__dirname+"/../")
fs = require("fs")
should1 = require('should')

describe("Import", function(){
    it("is function", function(){
        errUp.should.be.a("function");
    });
    it("call return is function", function(){
        errUp().should.be.a("function");
    });
});

describe("return function success", function(){
    it("and it work", function($done){
        fs.stat(__dirname, errUp(function(stats){
            $done()
        }));
    });

    it("callback called without err argument", function($done){
        fs.stat(__dirname, errUp(function(stats){
            stats.should.be.a("object");
            stats.isFile.should.be.a("function");
            $done();
        }));
    });

    it("pass all aguments to callback", function($done){
        var asyncFunc = function(callback){
            callback(null, 'arg1', 'arg2', 'arg3')
        };
        asyncFunc(errUp(function(arg1, arg2, arg3){
            arg1.should.equal('arg1');
            arg2.should.equal('arg2');
            arg3.should.equal('arg3');
            $done();
        }));
    });

    it("callback called only once", function(done){
        var calls = 0;
        var asyncFuncTwiceCb = function(callback){
            callback(null, 'arg1');
            callback(null, 'arg2');
            callback('err');
        };
        (function($cb){
            asyncFuncTwiceCb(errUp(function(arg1){
                $cb(null, arg1);
            }));
        })(function(err, arg1){
            should1.not.exist(err);
            arg1.should.equal('arg1');
            calls++;
        });
        setTimeout(function(){
            calls.should.equal(1);
            done();
        }, 300);
    });

    it("recursion", function(done){
        var calls = 0;
        var func = function (i, $next){
            if (i<5) {
                func(i+1, errUp(function(i, n){
                    calls++;
                    $next();
                }));
            } else {
                $next()
            }
        }
        func(0, function(err){
            calls.should.equal(5);
            done(err)
        })
    });

    // it("zzz", function(done){
    //     errUp(function(){
    //         asyncFunc(function(){
    //             errUp();
    //             doSomethink();
    //             done();
    //         })
    //     }, done);
    // });
});

describe("return function is fail", function(){
    var asyncFunc = function(callback){
        callback('err');
    };
    // it("it pass err up", function(done){
    //     var checkAsyncFunc = function(callback){
    //         err.should.equal('err');
    //         done();
    //     };
    //     checkAsyncFunc(errUp(function(){
    //         asyncFunc(errUp(function(){
    //             done('error');
    //         }))
    //     }));
    // });
    
    it("pass err to $cb", function(done){
        (function($cb){
            asyncFunc(errUp(function(){
                done('error')
            }))
        })(function(err, data){
            err.should.equal('err');
            done();
        });
    });

    it("pass err up", function(done){
        (function($cb){
            fs.stat(__dirname, errUp(function(stats){
                asyncFunc(errUp(function(arg1){
                    done('error');
                }));
            }));
        })(function(err){
            err.should.throw();
            done()
        });
    });

    it("err callback called only once", function(done){
        var calls = 0;
        var asyncFuncTwiceCb = function(callback){
            callback('err1');
            callback('err2');
        };
        (function($cb){
            asyncFuncTwiceCb(errUp(function(){
                done('error')
            }));
        })(function(err){
            err.should.equal('err1');
            calls++;
        })
        setTimeout(function(){
            calls.should.equal(1);
            done();
        }, 300);
    });

    it("if havnt $cb", function(done){
        (function(){
            asyncFunc(errUp(function(){
                done('error');
            }));
        })()
        setTimeout(function(){
            done();
        }, 250);
    });
});