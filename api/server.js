require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const PORT = process.env.SERVER_PORT || 4242;


app.get("/", (req, res) => {
    res.status(200).json({ message: "Hello, my API works 🚀 v1.0.11" });
});

app.get("/users", (req, res) => {
    res.status(200).json({ message: "OK - GET users" });
});

app.post("/users", (req, res) => {
    res.status(201).json({ message: "OK - POST users" });
});

app.put("/users/:id", (req, res) => {
    res.status(200).json({ message: "OK - PUT users" });
});

app.delete("/users/:id", (req, res) => {
    res.status(200).json({ message: "OK - DELETE users" });
});


// --------------------------------------------------------------------


// Array de filmes (semelhante a uma pequena base de dados)
let filmes = [
  { id: 1, titulo: "Inception", ano: 2010 },
  { id: 2, titulo: "Interstellar", ano: 2014 }
];


// GET - lista todos os filmes
app.get("/filmes", (req, res) => {
  return res.status(200).json(filmes);
});


// GET - especifico
app.get("/filmes/:id", (req, res) => {

  let id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ erro: "Id inválido" });
  }

  let filme = filmes.find((filmeAtual) => filmeAtual.id === id);

  if (!filme) {
    return res.status(404).json({ erro: "Filme não encontrado" });
  }

  return res.status(200).json(filme);

});


// POST 
app.post("/filmes", (req, res) => {

  const titulo = req.body.titulo;
  const ano = req.body.ano;

  if (!titulo || !ano) {
    return res.status(400).json({ erro: "Titulo e ano são obrigatórios" });
  }

  const novoFilme = {
    id: filmes.length + 1, // id automático (incrementação)
    titulo: titulo,
    ano: ano
  };

  filmes.push(novoFilme); //adiciona um novo filme ao array

  return res.status(201).json(novoFilme);

});


// PUT 
app.put("/filmes/:id", (req, res) => {

  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ erro: "Id inválido" });
  }

  const filme = filmes.find((filmeAtual) => filmeAtual.id === id);

  if (!filme) {
    return res.status(404).json({ erro: "Filme não encontrado" });
  }

  const titulo = req.body.titulo;
  const ano = req.body.ano;

  if (titulo) {
    filme.titulo = titulo;
  }

  if (ano) {
    filme.ano = ano;
  }

  return res.status(200).json(filme);

});


// DELETE 
app.delete("/filmes/:id", (req, res) => {

  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ erro: "Id inválido" });
  }

  const indice = filmes.findIndex((filmeAtual) => filmeAtual.id === id);

  if (indice === -1) {
    return res.status(404).json({ erro: "Filme não encontrado" });
  }

  filmes.splice(indice, 1);

  return res.status(200).json({ mensagem: "Filme removido" });

});


//porta 
app.listen(PORT, () => {
  console.log("Servidor a correr na porta " + PORT);
});






//-------------------------------------------------------------------------------------------------------------------------------
// Lab-2- Api de gestão de tarefas 
//-------------------------------------------------------------------------------------------------------------------------------




app.use(express.json());

// Base de dados
let tarefas = [
  { id: 1, titulo: "Estudar JavaScript", concluida: false, prioridade: "alta" },
  { id: 2, titulo: "Fazer trabalho de Programação Web (LAB-2)", concluida: true, prioridade: "média" }
];

const PRIORIDADES = ["baixa", "média", "alta"];

function prioridadeValida(prioridade)
{
  return PRIORIDADES.includes(prioridade);
}

function parseIdTarefa(param)
{
  const id_tarefa = parseInt(param);

  if (isNaN(id_tarefa))
  {
    return -1;
  }
  else
  {
    return id_tarefa;
  }
}



// GET
app.get("/tarefas", (req, res) => {
  return res.status(200).json(tarefas);
});

// GET - estatísticas 
app.get("/tarefas/statistics", (req, res) => {
  const total = tarefas.length;
  let completas = 0;

  for (let i = 0; i < tarefas.length; i++) {
    if (tarefas[i].concluida) {
      completas++;
    }
  }

  const pendentes = total - completas;

  return res.status(200).json({ total, completas, pendentes });
});

// GET - por id
app.get("/tarefas/:id", (req, res) => {
  const id_tarefa = parseIdTarefa(req.params.id);

  if (id_tarefa === -1) {
    return res.status(400).json({ erro: "Id inválido" });
  }

  const tarefa = tarefas.find((t) => t.id === id_tarefa);

  if (!tarefa) {
    return res.status(404).json({ erro: "Tarefa não encontrada" });
  }

  return res.status(200).json(tarefa);
});


// POST
app.post("/tarefas", (req, res) => {

  const titulo = req.body.titulo;
  const prioridade = req.body.prioridade;

  if (!titulo || !prioridade)
  {
    return res.status(400).json({ erro: "A indicação de título e prioridade são obrigatórios" });
  }
  else
  {
    if (!prioridadeValida(prioridade))
    {
      return res.status(400).json({ erro: "Prioridade inválida. Nota: Só existe 3 tipos de prioridade: baixa, média ou alta" });
    }
    else
    {
      const novaTarefa = {
        id: tarefas.length + 1,
        titulo: titulo,
        concluida: false,
        prioridade: prioridade
      };

      tarefas.push(novaTarefa); // adiciona ao array

      return res.status(201).json(novaTarefa);
    }
  }

});


// PUT
app.put("/tarefas/:id", (req, res) => {

  const id_tarefa = parseIdTarefa(req.params.id);

  if (id_tarefa === -1)
  {
    return res.status(400).json({ erro: "Id inválido" });
  }
  else
  {
    const tarefa = tarefas.find((tarefaAtual) => tarefaAtual.id === id_tarefa);

    if (!tarefa)
    {
      return res.status(404).json({ erro: "Tarefa não encontrada" });
    }
    else
    {
      const titulo = req.body.titulo;
      const concluida = req.body.concluida;
      const prioridade = req.body.prioridade;

      if (titulo !== undefined)
      {
        if (!titulo)
        {
          return res.status(400).json({ erro: "A secção do titulo não pode ser vazio" });
        }
        else
        {
          tarefa.titulo = titulo;
        }
      }

      if (concluida !== undefined)
      {
        if (concluida !== true && concluida !== false)
        {
          return res.status(400).json({ erro: "Para estar concluída temos de colocar true ou false" });
        }
        else
        {
          tarefa.concluida = concluida;
        }
      }

      if (prioridade !== undefined)
      {
        if (!prioridadeValida(prioridade))
        {
          return res.status(400).json({ erro: "Prioridade inválida. Nota: Só existe 3 tipos de prioridade: baixa, média ou alta" });
        }
        else
        {
          tarefa.prioridade = prioridade;
        }
      }

      return res.status(200).json(tarefa);
    }
  }

});


// DELETE
app.delete("/tarefas/:id", (req, res) => {

  const id_tarefa = parseIdTarefa(req.params.id);

  if (id_tarefa === -1)
  {
    return res.status(400).json({ erro: "Id inválido" });
  }
  else
  {
    let encontrada = false;
    let novasTarefas = [];

    for (let i = 0; i < tarefas.length; i++)
    {
      if (tarefas[i].id === id_tarefa)
      {
        encontrada = true;
      }
      else
      {
        novasTarefas.push(tarefas[i]);
      }
    }

    if (!encontrada)
    {
      return res.status(404).json({ erro: "Tarefa não encontrada" });
    }
    else
    {
      tarefas = novasTarefas;
      return res.status(200).json({ mensagem: "Tarefa removida" });
    }
  }

});


//localhost
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
  });
}
//Para o Vercel
module.exports = app;
