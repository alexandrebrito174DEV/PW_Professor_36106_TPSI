import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Tarefas from "./Tarefas";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/tasks" element={<Tarefas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;