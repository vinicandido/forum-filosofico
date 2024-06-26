const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('./Usuario');

const app = express();

// Função para conectar ao MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/meubanco', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB conectado');
    } catch (err) {
        console.error('Erro ao conectar ao MongoDB', err.message);
        process.exit(1);
    }
};

// Conectar ao banco de dados
connectDB();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

app.post('/', async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Verificar se o email já está cadastrado
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).send('Email já cadastrado');
        }

        // Criptografar a senha
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        // Criar um novo usuário
        const novoUsuario = new Usuario({
            email,
            senha: senhaCriptografada
        });

        // Salvar no banco de dados
        await novoUsuario.save();

        console.log(`Email: ${email}, Senha: ${senhaCriptografada}`);
        res.send('Cadastro realizado com sucesso!');
    } catch (error) {
        console.error('Erro ao cadastrar usuário', error.message);
        res.status(500).send('Erro ao cadastrar usuário');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Verificar se o usuário existe
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).send('Email ou senha incorretos');
        }

        // Verificar a senha
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(400).send('Email ou senha incorretos');
        }

        // Gerar token JWT
        const token = jwt.sign({ id: usuario._id }, 'seu_segredo_jwt', { expiresIn: '1h' });

        res.send({ token });
    } catch (error) {
        console.error('Erro ao fazer login', error.message);
        res.status(500).send('Erro ao fazer login');
    }
});

const autenticarToken = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
        return res.status(401).send('Acesso negado');
    }

    try {
        const decoded = jwt.verify(token, 'seu_segredo_jwt');
        req.usuarioId = decoded.id;
        next();
    } catch (error) {
        res.status(400).send('Token inválido');
    }
};

// Exemplo de rota protegida
app.get('/dados-seguros', autenticarToken, (req, res) => {
    res.send('Dados acessíveis apenas para usuários autenticados');
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});

