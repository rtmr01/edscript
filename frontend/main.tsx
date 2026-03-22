// frontend/main.tsx
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./app/LandingPage";
import { LobbyPage } from "./app/LobbyPage"; // Importe com chaves {}
import App from "./app/App"; // Seu dashboard de análise final
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/lobby/:sport" element={<LobbyPage />} />
    <Route path="/analise/:sport/:id" element={<App />} />
    </Routes>
  </BrowserRouter>
);