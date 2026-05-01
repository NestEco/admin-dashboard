import { useState } from "react";
import "./App.css";
import Usuarios from "./pages/Usuarios";
import Comics   from "./pages/Comics";
import Ventas   from "./pages/Ventas";

const TABS = [
  { id: "inicio",   label: "Inicio",   icon: "⌂" },
  { id: "usuarios", label: "Usuarios", icon: "◎" },
  { id: "comics",   label: "Cómics",   icon: "◈" },
  { id: "ventas",   label: "Ventas",   icon: "◇" },
];

function Placeholder({ label }) {
  return (
    <div className="placeholder">
      <span>— sección: {label} —</span>
    </div>
  );
}

function renderPage(id) {
  switch (id) {
    case "usuarios": return <Usuarios />;
    case "comics":   return <Comics />;
    case "ventas":   return <Ventas />;
    default:         return <Placeholder label={TABS.find(t => t.id === id)?.label} />;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState("inicio");

  return (
    <div className="admin-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-dot" />
          AdminPanel
        </div>
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
