var mongoose = require('mongoose');
var admSchema = new mongoose.Schema({
    nome: {
        unique: true,
        type: String
    },
    senha: {
        type: String
    },
},
    {
        versionKey: false
    }
);
module.exports = mongoose.model('User', userSchema)
