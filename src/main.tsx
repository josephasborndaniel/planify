
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import AdminApp from "./admin/AdminApp.tsx";
import App from "./app/App.tsx";
import { ThemeProvider } from "./app/context/ThemeContext.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
);