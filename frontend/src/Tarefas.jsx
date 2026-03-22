import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Tarefas() {
  const [tarefas, setTarefas] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarTarefas() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const resposta = await fetch("http://localhost:4242/tarefas", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const dados = await resposta.json();

        if (resposta.ok) {
          setTarefas(Array.isArray(dados) ? dados : []);
        } else {
          setMensagem(dados.erro || "Erro ao carregar tarefas.");
        }
      } catch (erro) {
        setMensagem("Erro no servidor.");
      }
    }

    carregarTarefas();
  }, [navigate]);

  async function apagarTarefa(id) {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:4242/tarefas/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    setTarefas(tarefas.filter(t => t.id !== id));
  }

  function logout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <div style={estilos.container}>
      <div style={estilos.caixa}>
        <div style={estilos.topo}>
          <h1 style={estilos.titulo}>Tarefas</h1>

          <button onClick={logout} style={estilos.botao}>
            Logout
          </button>
        </div>

        {mensagem && <p style={estilos.mensagem}>{mensagem}</p>}

        {tarefas.length === 0 ? (
          <p style={estilos.semTarefas}>Sem tarefas.</p>
        ) : (
          <ul style={estilos.lista}>
            {tarefas.map((tarefa) => (
              <li key={tarefa.id} style={estilos.item}>
                <div>
                  <strong>{tarefa.titulo}</strong>
                  <p style={estilos.estado}>
                    {tarefa.concluida ? "Concluída" : "Por fazer"}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={estilos.prioridade}>
                    {tarefa.prioridade}
                  </span>

                  <button
                    onClick={() => apagarTarefa(tarefa.id)}
                    style={estilos.botaoApagar}
                  >
                    X
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const estilos = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#2951a6",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "60px 20px"
  },

  caixa: {
    backgroundColor: "white",
    width: "700px",
    maxWidth: "100%",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
  },

  topo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },

  titulo: {
    margin: 0
  },

  botao: {
    padding: "10px 16px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#1e3a8a",
    color: "white",
    cursor: "pointer"
  },

  botaoApagar: {
    border: "none",
    backgroundColor: "#d33030",
    color: "white",
    borderRadius: "6px",
    padding: "5px 8px",
    cursor: "pointer"
  },

  mensagem: {
    textAlign: "center",
    marginBottom: "15px"
  },

  semTarefas: {
    textAlign: "center",
    margin: 0
  },

  lista: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },

  item: {
    backgroundColor: "#f7f8fc",
    padding: "15px",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #e3e6f0"
  },

  estado: {
    margin: "6px 0 0 0",
    fontSize: "14px",
    color: "#555"
  },

  prioridade: {
    backgroundColor: "#e8eefc",
    color: "#1e3a8a",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "bold",
    textTransform: "capitalize"
  }
};

export default Tarefas;