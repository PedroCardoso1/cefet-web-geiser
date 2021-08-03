// importação de dependência(s)

// import express from 'express'
const express = require('express')
const fs = require('fs')

// variáveis globais deste módulo

const PORT = 3000
let db = {}
let dados = {}
const app = express()

// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
// dica: 1-4 linhas de código (você deve usar o módulo de filesystem (fs))

fs.readFile('./server/data/jogadores.json', 'utf8', (err, data) => {
    if (err) {
        console.error(err)
        return
    }
    db.jogadores = JSON.parse(data)
})

fs.readFile('./server/data/jogosPorJogador.json', 'utf8', (err, data) => {
    if (err) {
        console.error(err)
        return
    }
    db.jogos = JSON.parse(data)
})

// configurar qual templating engine usar. Sugestão: hbs (handlebars)
//app.set('view engine', '???qual-templating-engine???');
//app.set('views', '???caminho-ate-pasta???');
// dica: 2 linhas

app.set('view engine', 'hbs');
app.set('views', 'server/views');

// EXERCÍCIO 2
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json (~3 linhas)

app.get('/', (rq, rp) => {
    rp.render('index', db)
})

// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter ~15 linhas de código
// db.jogadores.players.forEach(element => {
//     console.log(element.steamid)
// });
function calculaJogos(jogos) {
    let minJogados = 0
    let naoJogados = 0
    let count = 5
    let melhores = []
    jogos.games.sort(function (a, b) { // ordena decrescente pelo tempo de jogo
        return a.playtime_forever < b.playtime_forever ? 1 : a.playtime_forever > b.playtime_forever ? -1 : 0;
    });
    jogos.games.forEach(elemento => {
        minJogados += elemento.playtime_forever
        if (elemento.playtime_forever === 0) naoJogados++
        if (count > 0) {
            elemento.time = Math.floor(elemento.playtime_forever / 60)
            melhores.push(elemento)
            count--
        }
    })

    jogos.horas_jogadas = Math.floor(minJogados / 60)
    jogos.qtd_nao_jogados = naoJogados
    dados.jogos = jogos
    dados.melhores = melhores
}
app.get('/jogador/:numero_identificador', (rq, rp) => {
    let id = rq.params.numero_identificador
    db.jogadores.players.forEach(elemento => {
        if (elemento.steamid === id) {
            dados.jogador = elemento
        }
    })
    calculaJogos(db.jogos[`${id}`])
    rp.render('jogador', {
        profile: dados,
        gameInfo: dados.melhores,
        favorito: dados.melhores[0]
    })
})


// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
// dica: 1 linha de código

app.use(express.static("./client"))

// abrir servidor na porta 3000 (constante PORT)
// dica: 1-3 linhas de código

app.listen(PORT, () => {
    console.log(`Escutando em: http://localhost:${PORT}`)
})