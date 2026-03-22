// Ficheiro .env
require("dotenv").config({ path: "./.env" });

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Ligação à base de dados
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({
  adapter: adapter
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Porta
const PORT = process.env.SERVER_PORT || 4242;
const JWT_SECRET = process.env.JWT_SECRET;

// --------------------------------------------------------------------
// Autenticação - Funções
// --------------------------------------------------------------------

// Verifica se a chave de acesso foi enviada e se foi valida
function authenticateToken(req, res, next){
  const authHeader = req.headers.authorization;

  if (!authHeader){
    return res.status(401).json({ erro: "Chave de acesso em falta" });
  }

  const partes = authHeader.split(" ");

  // Bearer é o nome usado antes da chave de acesso (header Authorization - transmite informações de autenticação)
  if (partes.length !== 2 || partes[0] !== "Bearer"){
    return res.status(401).json({ erro: "Chave de acesso inválida" });
  }

  const token = partes[1];

  try{
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  }
  catch (erro){
    return res.status(403).json({ erro: "Chave de acesso inválida" });
  }
}

// Rotas 

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Hello, my API works 🚀 v1.0.20" });
});

app.get("/users", (req, res) => {
  return res.status(200).json({ message: "OK - GET users" });
});

app.post("/users", (req, res) => {
  return res.status(201).json({ message: "OK - POST users" });
});

app.put("/users/:id", (req, res) => {
  return res.status(200).json({ message: "OK - PUT users" });
});

app.delete("/users/:id", (req, res) => {
  return res.status(200).json({ message: "OK - DELETE users" });
});

// --------------------------------------------------------------------
// Autenticação
// --------------------------------------------------------------------

// Registo - utilizador - Signup
app.post("/auth/signup", async (req, res) => {
  try{
    const nome = req.body.nome || req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    if (!nome || !email || !password){
      return res.status(400).json({ erro: "Nome, email e password são obrigatórios" });
    }

    const utilizadorExistente = await prisma.utilizador.findUnique({
      where: {
        email: email
      }
    });

    if (utilizadorExistente){
      return res.status(409).json({ erro: "Já existe um utilizador com esse email" });
    }

    const passwordEncriptada = await bcrypt.hash(password, 10);

    const novoUtilizador = await prisma.utilizador.create({
      data: {
        nome: nome,
        email: email,
        password: passwordEncriptada
      }
    });

    return res.status(201).json({
      mensagem: "Utilizador registado com sucesso",
      utilizador: {
        id: novoUtilizador.id,
        nome: novoUtilizador.nome,
        email: novoUtilizador.email
      }
    });
  }
  catch (erro){
    console.error("ERRO POST /auth/signup:", erro);
    return res.status(500).json({ erro: "Erro ao registar utilizador." });
  }
});

// Login - utilizador - Signin
app.post("/auth/signin", async (req, res) => {
  try{
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password){
      return res.status(400).json({ erro: "Email e password são obrigatórios" });
    }

    const utilizador = await prisma.utilizador.findUnique({
      where: {
        email: email
      }
    });

    if (!utilizador){
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    const passwordCorreta = await bcrypt.compare(password, utilizador.password);

    if (!passwordCorreta){
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      {
        id: utilizador.id,
        nome: utilizador.nome,
        email: utilizador.email
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      mensagem: "Login efetuado com sucesso",
      token: token
    });
  }
  catch (erro){
    console.error("ERRO POST /auth/signin:", erro);
    return res.status(500).json({ erro: "Erro no login." });
  }
});

// Perfil autenticado
app.get("/auth/profile", authenticateToken, async (req, res) => {
  try{
    const utilizador = await prisma.utilizador.findUnique({
      where: {
        id: req.user.id
      },
      select: {
        id: true,
        nome: true,
        email: true
      }
    });

    if (!utilizador){
      return res.status(404).json({ erro: "Utilizador não encontrado" });
    }

    return res.status(200).json(utilizador);
  }
  catch (erro){
    console.error("ERRO GET /auth/profile:", erro);
    return res.status(500).json({ erro: "Erro ao obter perfil." });
  }
});

// --------------------------------------------------------------------
// API de filmes
// --------------------------------------------------------------------

// Array 
let filmes = [
  { id: 1, titulo: "Inception", ano: 2010 },
  { id: 2, titulo: "Interstellar", ano: 2014 }
];

app.get("/filmes", (req, res) => {
  return res.status(200).json(filmes);
});

app.get("/filmes/:id", (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)){
    return res.status(400).json({ erro: "Id inválido" });
  }

  const filme = filmes.find((filmeAtual) => filmeAtual.id === id);

  if (!filme){
    return res.status(404).json({ erro: "Filme não encontrado" });
  }

  return res.status(200).json(filme);
});

app.post("/filmes", (req, res) => {
  const titulo = req.body.titulo;
  const ano = req.body.ano;

  if (!titulo || !ano){
    return res.status(400).json({ erro: "Titulo e ano são obrigatórios" });
  }

  const novoFilme = {
    id: filmes.length + 1,
    titulo: titulo,
    ano: ano
  };

  filmes.push(novoFilme);

  return res.status(201).json(novoFilme);
});

app.put("/filmes/:id", (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)){
    return res.status(400).json({ erro: "Id inválido" });
  }

  const filme = filmes.find((filmeAtual) => filmeAtual.id === id);

  if (!filme){
    return res.status(404).json({ erro: "Filme não encontrado" });
  }

  const titulo = req.body.titulo;
  const ano = req.body.ano;

  if (titulo){
    filme.titulo = titulo;
  }

  if (ano){
    filme.ano = ano;
  }

  return res.status(200).json(filme);
});

app.delete("/filmes/:id", (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)){
    return res.status(400).json({ erro: "Id inválido" });
  }

  const indice = filmes.findIndex((filmeAtual) => filmeAtual.id === id);

  if (indice === -1){
    return res.status(404).json({ erro: "Filme não encontrado" });
  }

  filmes.splice(indice, 1);

  return res.status(200).json({ mensagem: "Filme removido" });
});

// --------------------------------------------------------------------
// API de tarefas
// --------------------------------------------------------------------

// Prioridades
const PRIORIDADES = ["baixa", "media", "alta"];

// Verifica se a prioridade inserida existe
function prioridadeValida(prioridade){
  let i;

  for (i = 0; i < PRIORIDADES.length; i++){
    if (PRIORIDADES[i] === prioridade){
      return true;
    }
  }

  return false;
}


function parseIdTarefa(param){ 
  const id_tarefa = parseInt(param);

  if (isNaN(id_tarefa)){
    return -1;
  }

  return id_tarefa;
}

app.get("/tarefas", authenticateToken, async (req, res) => {
  try{
    const tarefas = await prisma.tarefa.findMany({
      where: {
        utilizadorId: req.user.id
      }
    });

    return res.status(200).json(tarefas);
  }
  catch (erro){
    console.error("ERRO GET /tarefas:", erro);
    return res.status(500).json({ erro: "Erro ao listar tarefas." });
  }
});

app.get("/tarefas/statistics", authenticateToken, async (req, res) => {
  try{
    const tarefas = await prisma.tarefa.findMany({
      where: {
        utilizadorId: req.user.id
      }
    });

    const total = tarefas.length;
    let completas = 0;

    for (let i = 0; i < tarefas.length; i++){
      if (tarefas[i].concluida){
        completas++;
      }
    }

    const pendentes = total - completas;

    return res.status(200).json({ total, completas, pendentes });
  }
  catch (erro){
    console.error("ERRO GET /tarefas/statistics:", erro);
    return res.status(500).json({ erro: "Erro no cálculo de estatísticas." });
  }
});

app.get("/tarefas/:id", authenticateToken, async (req, res) => {
  try{
    const id_tarefa = parseIdTarefa(req.params.id);

    if (id_tarefa === -1){
      return res.status(400).json({ erro: "Id inválido" });
    }

    const tarefa = await prisma.tarefa.findFirst({
      where: {
        id: id_tarefa,
        utilizadorId: req.user.id
      }
    });

    if (!tarefa){
      return res.status(404).json({ erro: "Tarefa não encontrada" });
    }

    return res.status(200).json(tarefa);
  }
  catch (erro){
    console.error("ERRO GET /tarefas/:id:", erro);
    return res.status(500).json({ erro: "Erro ao procurar tarefa." });
  }
});

app.post("/tarefas", authenticateToken, async (req, res) => {
  try{
    const titulo = req.body.titulo;
    const prioridade = req.body.prioridade;

    if (!titulo || !prioridade){
      return res.status(400).json({ erro: "A indicação do título e da prioridade são obrigatórias" });
    }

    if (!prioridadeValida(prioridade)){
      return res.status(400).json({ erro: "Prioridade inválida. Nota: Só existem 3 tipos de prioridade: baixa, média ou alta" });
    }

    const novaTarefa = await prisma.tarefa.create({
      data: {
        titulo: titulo,
        concluida: false,
        prioridade: prioridade,
        utilizadorId: req.user.id
      }
    });

    return res.status(201).json(novaTarefa);
  }
  catch (erro){
    console.error("ERRO POST /tarefas:", erro);
    return res.status(500).json({ erro: "Erro ao criar tarefa." });
  }
});

app.put("/tarefas/:id", authenticateToken, async (req, res) => {
  try{
    const id_tarefa = parseIdTarefa(req.params.id);

    if (id_tarefa === -1){
      return res.status(400).json({ erro: "Id inválido" });
    }

    const tarefa = await prisma.tarefa.findFirst({
      where: {
        id: id_tarefa,
        utilizadorId: req.user.id
      }
    });

    if (!tarefa){
      return res.status(404).json({ erro: "Tarefa não encontrada" });
    }

    const titulo = req.body.titulo;
    const concluida = req.body.concluida;
    const prioridade = req.body.prioridade;

    let dadosAtualizados = {};

    if (titulo !== undefined){
      if (!titulo){
        return res.status(400).json({ erro: "A secção do título não pode estar vazia" });
      }

      dadosAtualizados.titulo = titulo;
    }

    if (concluida !== undefined){
      if (concluida !== true && concluida !== false){
        return res.status(400).json({ erro: "Para estar concluída temos de indicar: true / false" });
      }

      dadosAtualizados.concluida = concluida;
    }

    if (prioridade !== undefined){
      if (!prioridadeValida(prioridade)){
        return res.status(400).json({ erro: "Prioridade inválida. Nota: Só existem 3 tipos de prioridade: baixa, média ou alta" });
      }

      dadosAtualizados.prioridade = prioridade;
    }

    const tarefaAtualizada = await prisma.tarefa.update({
      where: {
        id: id_tarefa
      },
      data: dadosAtualizados
    });

    return res.status(200).json(tarefaAtualizada);
  }
  catch (erro){
    console.error("ERRO PUT /tarefas/:id:", erro);
    return res.status(500).json({ erro: "Erro ao atualizar tarefa." });
  }
});

app.delete("/tarefas/:id", authenticateToken, async (req, res) => {
  try{
    const id_tarefa = parseIdTarefa(req.params.id);

    if (id_tarefa === -1){
      return res.status(400).json({ erro: "Id inválido" });
    }

    const tarefa = await prisma.tarefa.findFirst({
      where: {
        id: id_tarefa,
        utilizadorId: req.user.id
      }
    });

    if (!tarefa){
      return res.status(404).json({ erro: "Tarefa não encontrada" });
    }

    await prisma.tarefa.delete({
      where: {
        id: id_tarefa
      }
    });

    return res.status(200).json({ mensagem: "Tarefa removida" });
  }
  catch (erro){
    console.error("ERRO DELETE /tarefas/:id:", erro);
    return res.status(500).json({ erro: "Erro ao remover tarefa." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});

module.exports = app;