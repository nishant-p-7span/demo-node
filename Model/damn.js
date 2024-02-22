const mongoose = require('mongoose')
const demoschema = new mongoose.Schema({

    name: {
        type:String,
        require: true
    },

    tech: {
        type: String,
        require: true
    },

    sub: {
        type: Boolean,
        require: true,
        default: false
    }
})

module.exports = mongoose.model("user", demoschema)