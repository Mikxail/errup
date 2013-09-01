errUp   = require(__dirname+"/../")
fs      = require("fs")
async   = require("async");
should1 = require('should');

describe("Import", function(){
    it("is function", function(){
        errUp.should.be.a("function");
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
            err.should.be.throw();
            done();
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
        try {
            (function(){
                asyncFunc(errUp(function(){
                    done('error');
                }));
            })()
        } catch (e) {
            e.should.be.throw();
            done()
        }
    });
});

describe("found callback", function(){
    var errAsyncFunc = function(callback){
        callback('err');
    };

    function MyError(message) {
        this.name = "MyError";
        this.message = (message || "");
    }
    MyError.prototype = Error.prototype;
    var errmyAsyncFunc = function(callback){
        callback(new MyError('err'));
    };

    var asyncFunc = function(callback){
        callback(null, 'arg1', 'arg2', 'arg3')
    };

    it("if cb was last and func", function(done){
        (function(p1, p2, callback) {
            errAsyncFunc(errUp(function(){
                done('err');
            }));
        })(1,2, function(err){
            err.should.equal('err');
            done();
        });
    });

    it("if cb was not last and be a func", function(done){
        (function(p1, callback, p2) {
            errAsyncFunc(errUp(function(){
                done('err');
            }));
        })(1, function(err){
            err.should.equal('err');
            done();
        }, 2);
    });

    it("if cb was custom name", function(done){
        (function(p1, p2, $ccc) {
            errAsyncFunc(errUp(function(){
                done('err');
            }));
        })(1, 2, function(err){
            err.should.equal('err');
            done();
        });
    });

    it("if cb was bad custom name", function(done){
        try {
            (function(p1, p2, ccc) {
                errAsyncFunc(errUp(function(){
                    done('err');
                }));
            })(1, 2, function(err){
                err.should.equal('err');
                done();
            });
        } catch (e) {
            e.should.be.throw();
            done();
        }
    });

    it("if cb was last and not func", function(done){
        try {
            (function(p1, p2, callback) {
                errAsyncFunc(errUp(function(){
                    done('err');
                }));
            })(1,2, 3, function(err){
                done('error')
            });
        } catch (e) {
            e.should.be.throw();
            done();
        }
    });

    it("with async function", function(done){
        async.each([1,2,3,4], function(d, next){
            errAsyncFunc(errUp(function(){
                done('err');
            }))
        }, function(err, data){
            err.should.equal("err");
            done()
        });
    });


    it("catch some errors", function(done){
        (function(next){
            errAsyncFunc(errUp(function(){
                done('error');
            }, ['zzz', 'err'], function(err){
                err.should.equal("err")
                done()
            }));
        })(function(){
            done('error')
        })
    });

    it("catch some errors by typeof", function(done){
        (function(next){
            errmyAsyncFunc(errUp(function(){
                done('error');
            }, ['err', MyError], function(err){
                err.should.be.an.instanceOf(MyError)
                done()
            }));
        })(function(){
            done('error')
        })
    });

    it("catch some errors by typeof with inheritance", function(done){
        (function(next){
            errmyAsyncFunc(errUp(function(){
                done('error');
            }, ['err', Error], function(err){
                err.should.be.an.instanceOf(MyError)
                done()
            }));
        })(function(){
            done('error')
        })
    });


    it("do not catch not declared errors", function(done){
        (function(next){
            errAsyncFunc(errUp(function(){
                done('error');
            }, ['err1', Error], function(err){
                done('error')
            }));
        })(function(err){
            err.should.equal("err");
            done();
        })
    });

    it("catch all errors", function(done){
        (function(next){
            errmyAsyncFunc(errUp(function(){
                done('error');
            }, null, function(err){
                err.should.be.an.instanceOf(MyError)
                done()
            }));
        })(function(){
            done('error')
        })
    });

    it("catch error in long stack", function(done){
        (function(next){
            asyncFunc(errUp(function(){
                asyncFunc(errUp(function(){
                    errAsyncFunc(errUp(function(){
                        done('error')
                    }))
                }))
            }, ['err'], function(err){
                err.should.equal('err');
                done();
            }));
        })(function(){
            done('error')
        })
    });

    it("work good as errTo", function(done){
        (function(next){
            (function($cb){
                errAsyncFunc(errUp(next, function(){
                    done('error1');
                }));
            })(function(){
                done('error2')
            })
        })(function(err){
            err.should.equal('err');
            done()
        })
    });

    it("work good as errTo and catch some errors", function(done){
        (function(next){
            (function($cb){
                errAsyncFunc(errUp(next, function(){
                    done('error1');
                }, ['err'], function(err){
                    err.should.equal("err")
                    done()
                }));
            })(function(){
                done('error2')
            })
        })(function(){
            done('error3')
        })
    });

});