import { useState } from "react";
import "./App.css";
import Inicio   from "./pages/Inicio";
import Usuarios from "./pages/Usuarios";
import Comics   from "./pages/Comics";
import Ventas   from "./pages/Ventas";

const TABS = [
  { id: "inicio",   label: "Inicio",   icon: "⌂" },
  { id: "usuarios", label: "Usuarios", icon: "◎" },
  { id: "comics",   label: "Cómics",   icon: "◈" },
  { id: "ventas",   label: "Ventas",   icon: "◇" },
];

function renderPage(id) {
  switch (id) {
    case "inicio":   return <Inicio />;
    case "usuarios": return <Usuarios />;
    case "comics":   return <Comics />;
    case "ventas":   return <Ventas />;
    default:         return <Inicio />;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState("inicio");

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'http://localhost:5173';
  };

  return (
    <div className="admin-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-dot" />
          AdminPanel
        </div>
        <button
          onClick={handleLogout}
          className="logout-button"
          title="Cerrar sesión"
        >
          Cerrar Sesión
        </button>
        <nav className="nav-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab${activeTab === tab.id ? " active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="content-area">
        {renderPage(activeTab)}
      </main>
    </div>
  );
}
