// server.js arquivo inicial da aplicação
// definições iniciais e configuração do servidor
require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Middleware para validação de token JWT
// Verifica se o token está presente no header Authorization

/*
const ValidarToken = (req, res, next) => {
    try {
        next();
    } catch (error) {
        res.status(401).json({ message: 'Autenticação falhou!' });
    }
};
*/

var app = express();

// configura o mongoose e user
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    safeFile: {
        type: String,
        required: false
    }
});

const User = mongoose.model('User', userSchema);

const arrayOfUsers = [{
    username: "Fulano",
    password: "1234",
    safeFile: "CatVideo.mp4"
},
{    username: "Ciclano",
    password: "5678",
    safeFile: "CatVideo.mp4"
},{    
    username: "Beltrano",
    password: "91011",
    safeFile: "CatVideo.mp4"
}];

// inserir os usuários no banco
// Primeiro remove todos os usuários existentes, depois insere os novos
async function initializeUsers() {
    try {
        // Deleta os usuarios existentes
        const deleteResult = await User.deleteMany({});
        console.log(`${deleteResult.deletedCount} usuários removidos`);
        
        // Insere os novos usuários
        const insertResult = await User.insertMany(arrayOfUsers);
        console.log(`${insertResult.length} usuários inseridos`);
    } catch (error) {
        console.error("Erro ao inicializar usuários:", error);
    }
}

// Executa a inicialização dos usuários
initializeUsers();


// Configura o CORS para permitir requisições de qualquer origem
app.use(cors());

// instancia os arquivos estaticos publicos
app.use(express.static('public'));

// middleware para parsing do JSON
app.use(express.json());

// serve a página inicial no caminho 'root'
app.get("/",(req,res)=>{
    res.sendFile(__dirname + "/views/index.html");
});

// serve a página de login no caminho /login via GET (navegador)
app.get("/login",(req,res)=>{
    res.sendFile(__dirname + "/views/login.html");
});

// API POST para login
// Recebe username e password, valida e retorna um token JWT

/*
app.post("/login",(req,res)=>{
    const {body} = req;
    const {username,password} = body;
});
*/

// serve a página safe no caminho /safe (sem verificar autenticação)
// reverificação de autenticação para abrir o cofre é feita no front-end
app.get("/safe", (req,res)=>{
    res.sendFile(__dirname + "/views/safe.html");
});

// API GET para pegar o arquivo seguro

/*
app.get("/api/safe-file/:videofile", (req, res) => {
    const videofile = req.params.videofile;
    const filePath = path.join(__dirname, 'safe-videos', videofile);
});
*/

// API GET para validar o token JWT
/*
app.get("/api/validate-token", ValidarToken, (req,res)=>{
    if(!req.user || !req.user.valid) {
            res.status(403).json({valid: false, message: "Invalid token"});
        } else {
            console.log("Usuário autenticado:", req.user);
            res.json(req.user);
        }
});
*/
// listener da aplicação
const listener = app.listen(process.env.PORT || 3000, function () {
    console.log("Seu app esta no port " + listener.address().port);
  });