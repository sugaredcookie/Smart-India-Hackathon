const Contact = require('../models/contactModel');
const catchAsync = require('../utils/catchAsync');

exports.postContact = catchAsync(async (req, res, next) => {
    const newContact = await Contact.create({
        name: req.body.name,
        email: req.body.email,
        message: req.body.message
    });

    res.status(201).json({
        status: 'success',
        data: newContact
    });
});

exports.getContact = catchAsync(async (req, res, next) => {
    const contacts = await Contact.find();

    res.status(200).json({
        status: 'success',
        results: contacts.length,
        data: contacts
    });
});