const Beta = require("../models/betaModel");
const catchAsync = require("../utils/catchAsync");

exports.postEmail = catchAsync(async(req, res, next) => {
    const newBetaUser = await Beta.create({
        email: req.body.email
    });

    res.status(201).json({
        status: 'success',
        data: newBetaUser
    });
});