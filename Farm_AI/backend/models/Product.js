const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Vegetables', 'Fruits', 'Grains', 'Others']
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    unit: {
        type: String,
        required: true,
        default: 'kg' // e.g., kg, pieces, bunch
    },
    image: {
        type: String, // Path to uploaded image
        required: true
    },
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);
