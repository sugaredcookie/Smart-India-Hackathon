class appError extends Error { //Error is an inbuilt class in js
    constructor(message, statusCode) {
        super(message);
        
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'         // ?=if this...,   : = otherwise this...
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = appError;