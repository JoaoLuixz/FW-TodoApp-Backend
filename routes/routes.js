const express = require('express');
const { get } = require('mongoose');
const tarefa = require('../models/tarefa');
const router = express.Router()
module.exports = router;
const modeloTarefa = require('../models/tarefa');

router.post('/post', verificaJWT, async (req, res) => {
    const objetoTarefa = new modeloTarefa({
        descricao: req.body.descricao,
        statusRealizada: req.body.statusRealizada
    })
    try {
        const tarefaSalva = await objetoTarefa.save();
        res.status(200).json(tarefaSalva)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

// 1º parte
router.get('/getAll', verificaJWT, async (req, res, next) => {

    try {
        const resultados = await modeloTarefa.find();
        res.json(resultados)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})


router.delete('/delete/:id', verificaJWT, async (req, res) => {
    try {
        const resultado = await modeloTarefa.findByIdAndDelete(req.params.id)
        res.json(resultado)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

router.patch('/update/:id', verificaJWT, async (req, res) => {
    try {
        const id = req.params.id;
        const novaTarefa = req.body;
        const options = { new: true };
        const result = await modeloTarefa.findByIdAndUpdate(
            id, novaTarefa, options
        )
        res.json(result)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

// 2º parte

router.get('/Tarefas/search', verificaJWT, async (req, res) => {
    const { descricao } = req.query;
    try {
        const resultados = await modeloTarefa.find({ descricao: new RegExp(descricao, 'i') });
        res.json(resultados)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// localhost:3000/api/Tarefas/search?descricao=again

router.delete('/Tarefas', verificaJWT, async (req, res) => {
    try {
        await tarefa.deleteMany({});
        res.send({ message: 'AI CARAMBA!!! Todas as tarefas foram deletadas!' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error' });
    }
});


router.delete('/Tarefas/completas', verificaJWT, async (req, res) => {
    try {
        await tarefa.deleteMany({ statusRealizada: true });
        res.send({ message: 'AI CARAMBA!!! Todas as tarefas completas foram removidas!!!' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error' });
    }
});






// Autorizacao
function verificaUsuarioSenha(req, res, next) {
    if (req.body.nome !== 'branqs' || req.body.senha !== '1234') {
        return res.status(401).json({ auth: false, message: 'Usuario ou Senha incorreta' });
    }
    next();
}

// Autenticacao (mudar usuário e senha aqui)
// var jwt = require('jsonwebtoken');
// router.post('/login', (req, res, next) => {
//     if (req.body.nome === 'Joao' && req.body.senha === '222') {
//         const token = jwt.sign({ id: req.body.nome }, 'AICARAMBA', { expiresIn: 300 });
//         return res.json({ auth: true, token: token });
//     }
//     res.status(500).json({ message: 'Login invalido!' });
// })


//Segunda forma de Autenticacao - Busca usuário no BD e compara senha
const userModel = require('../models/user');
var jwt = require('jsonwebtoken');
router.post('/login', async (req, res) => {
    try {
        const data = await userModel.findOne({ 'nome': req.body.nome });
        
        
        // admin
        // if (data != null && data.senha === "admin") {
        //     const token = jwt.sign({ id: req.body.user }, 'AICARAMBA',
        //         { expiresIn: 300 });
        //     return res.json({ token: token });
        // }

        if (data != null && data.senha === req.body.senha) {
            const token = jwt.sign({ id: req.body.user }, 'AICARAMBA',
                { expiresIn: 300 });
            return res.json({ token: token });
        }

        res.status(500).json({ message: 'Login invalido!' });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})




// Nova forma de Autorizacao
function verificaJWT(req, res, next) {
    const token = req.headers['id-token'];
    if (!token) return res.status(401).json({
        auth: false, message: 'Token nao fornecido'
    });
    jwt.verify(token, 'AICARAMBA', function (err, decoded) {
        if (err) return res.status(500).json({ auth: false, message: 'Falha !' });
        next();
    });
}
// Parte do undo
// localhost:3000/api/Tarefas/search?descricao=again

// router.put('/Tarefas/:id', async (req, res) => {
//     try {
//         const tarefa = await tarefa.findById(req.params.id);
//         if (!tarefa) {
//             return res.status(404).send({ message: 'AI CARAMBA! Tarefa Não Encontrada' });
//         } const tarefaAntiga = tarefa.toObject(); tarefa.description = req.body.description || tarefa.description;
//         tarefa.completed = req.body.completed || tarefa.completed; await tarefa.save();
//         res.send(tarefa); const undoData = { tarefaAntiga, newTask: tarefa.toObject() };
//         undoStack.push(undoData);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send({ message: 'Server error' });
//     }
// });

// router.post('/Tarefas/undo', (req, res) => {
//     const undoData = undoStack.pop();
//     if (!undoData) {
//         return res.status(404).send({ message: 'AI CARAMBA!!! Nada para remover!!' });
//     } const { tarefaAntiga, newTask } = undoData;
//     tarefa.findByIdAndUpdate(tarefaAntiga._id, { description: tarefa.description, completed: tarefaAntiga.completed }, { new: true }, (error, tarefa) => {
//         if (error) {
//             console.error(error);
//             res.status(500).send({ message: 'Server error' });
//         } else {
//             res.send(tarefa);
//         }
//     });
// });