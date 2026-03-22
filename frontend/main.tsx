// frontend/main.tsx
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Importe o Router
import { LandingPage } from "./app/LandingPage.tsx"; // Nova Página
import DashboardPage from "./app/App.tsx"; // Sua página antiga renomeada
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      {/* Rota Raiz: Mostra a Nova Página Inicial */}
      <Route path="/" element={<LandingPage />} />

      {/* Rota de Análise: Mostra o Dashboard que você já fez */}
      {/* Usamos um parâmetro :sport para ser dinâmico no futuro */}
      <Route path="/analise/:sport" element={<DashboardPage />} />

      {/* Rota de Redirecionamento (Opcional): Se tentarem acessar /analise, vai para futebol */}
      <Route path="/analise" element={<Navigate to="/analise/futebol" replace />} />
    </Routes>
  </BrowserRouter>
);