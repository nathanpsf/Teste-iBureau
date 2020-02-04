const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const ProjetoLei = require('./ProjetoLei');

mongoose.connect('mongodb+srv://the_big_bang_theory:laYtqWcnOmb5loBF@cluster0-5pniq.mongodb.net/db_the_big_bang_theory?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


let projLei;

const url = 'http://www.legislador.com.br/LegisladorWEB.ASP?WCI=ProjetoTramite&ID=20&dsVerbete=Transporte&dsTexto=Transporte&inEOU=0&Navegar=Pesquisar';

// Verifica a página com pesquisa de Verbete transporte e prepara URL específica de cada projeto de lei para ser acessada
async function iniciarScrap() 
{
    await axios(url)
    .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);
    const divCards = $('section.container') .find('div > div.card');
    const infosPaginas = [];

    divCards.each(function () {
    if($(this).find('h5.card-title').text() != "")
    {
            const infos = $(this).find("a.btn").attr('onclick').substring(14, 27);
            infosPaginas.push({
                infos,
            });
        }
    });  

        for(let i = 0; i < infosPaginas.length; i++)
        {
            let cod = infosPaginas[i].infos.split(",");
            let urlProjeto = 'http://www.legislador.com.br/LegisladorWEB.ASP?WCI=ProjetoTexto&ID='+cod[0]+'&inEspecie='+cod[1]+'&nrProjeto='+cod[2]+'&aaProjeto='+cod[3]+'&dsVerbete=Transporte';
            carregarProjetos(urlProjeto);
        }
    })
    .catch(console.error);
}

// Carrega os projetos de lei de acordo com os dados recebidos da primeira função
async function carregarProjetos(urlProjeto) {
    await axios(urlProjeto)
      .then(response => {
        const html = response.data;
        const $ = cheerio.load(html);
        const divCards2 = $('section.container') .find('div.card');

        divCards2.each(async function () {

            const titulo = $(this).find('h5.card-title').first().text();
            const data = $(this).find('h6.card-subtitle').first().text().substr(3);
            const sit = $(this).find('dd.col-sm-9').first().text();
            const assunto = $(this).find('dd').eq(3).text();
            let autor = $(this).find('dd').eq(4).find('b').first().text();
            const ementa = $(this).find('.card-body').eq(2).find('.card-text').text();
            const tramiteElem = $(this).find('tbody > tr');
            if(titulo != '') 
            {
                let tramite = [];
                tramiteElem.each(function () {
                
                    tramite.push({
                        projeto: $(this).find('td').eq(0).find('dt').first().text(),
                        entrada: $(this).find('td').eq(1).text(),
                        prazo: $(this).find('td').eq(2).text(),
                        devolucao: $(this).find('td').eq(3).find('dt').text()
                    })
                });

                if(autor == "") { autor = $(this).find('dd').eq(4).find('br').get(0).nextSibling.nodeValue; }             

                projLei = await ProjetoLei.create({
                    titulo,
                    data,
                    sit,
                    assunto,
                    autor,
                    ementa,
                    tramite
                }); 
                
               console.log(projLei);       

            }

           });    
  
      })
      .catch(console.error);    
}

iniciarScrap();