const mongoose = require('mongoose');

const ProjetoLeiSchema = new mongoose.Schema({
    titulo: String,
    data: String,
    sit: String,
    assunto: String,
    autor: String,
    ementa: String,
    tramite: []
});

module.exports = mongoose.model('ProjetoLei', ProjetoLeiSchema);