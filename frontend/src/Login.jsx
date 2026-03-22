import { useState } from "react";
import { useNavigate } from "react-router-dom";
import imagem from "./assets/image.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  async function fazerLogin() {
    if (!email || !password) {
      setMensagem("Preenche o email e a password.");
      return;
    }

    try {
      const resposta = await fetch("http://localhost:4242/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        localStorage.setItem("token", dados.token);
        navigate("/tasks");
      } else {
        setMensagem(dados.erro || "Credenciais inválidas.");
      }
    } catch (erro) {
      setMensagem("Erro no servidor.");
    }
  }

  return (
    <div style={estilos.container}>
      <div style={estilos.conteudo}>
        <img src={imagem} alt="Imagem de login" style={estilos.imagem} />

        <div style={estilos.caixa}>
          <h2 style={estilos.titulo}>Login</h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={estilos.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={estilos.input}
          />

          <button onClick={fazerLogin} style={estilos.botao}>
            Entrar
          </button>

          {mensagem && <p style={estilos.mensagem}>{mensagem}</p>}
        </div>
      </div>
    </div>
  );
}

const estilos = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#96b1ec",
    padding: "20px"
  },

  conteudo: {
    display: "flex",
    alignItems: "center",
    gap: "40px",
    flexWrap: "wrap",
    justifyContent: "center"
  },

  imagem: {
    width: "300px",
    maxWidth: "100%"
  },

  caixa: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "300px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
  },

  titulo: {
    margin: 0
  },

  input: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px"
  },

  botao: {
    padding: "12px",
    backgroundColor: "#1e3a8a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px"
  },

  mensagem: {
    textAlign: "center",
    fontSize: "14px",
    margin: 0
  }
};

export default Login;