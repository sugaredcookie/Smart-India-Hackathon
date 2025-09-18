const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Your name is required"],
        maxLength: [50, "Your name cannot exceed more than 50 characters"],
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: "Please enter a valid email"
        }
    },

    message: {
        type: String,
        required: [true, "Messgae is required"],
        maxLength: [500, "Max length of the your message must not increase 500 characters"]
    },

    createdAt: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model("Contact", contactSchema);