const express = require('express')
const bodyParder = require('body-parser')


const app = express()

app.use(bodyParder.urlencoded({extended:true}))

app.get('/', (req,res) => {
    res.sendFile(__filename + 'login/login.html')

    console.log(`Nome: ${nome}, Email: ${email}, Senha: ${senha}`);

    res.send('Cadastro realizado com sucesso!');
})

app.post('/login', (req, res) => {
    const email = req.body.email;
    const senha = req.body.senha;
})

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
  });