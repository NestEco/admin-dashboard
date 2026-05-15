import { useState, useEffect } from "react";
import "./App.css";
import Usuarios from "./pages/Usuarios";
import Comics from "./pages/Comics";

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
    default:         return <Placeholder label={TABS.find(t => t.id === id)?.label} />;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState("inicio");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // 1) Verificar si viene auth data en la URL (desde Login cross-origin)
    const hash = window.location.hash;
    if (hash.startsWith('#auth=')) {
      try {
        const authData = JSON.parse(decodeURIComponent(hash.substring(6)));
        localStorage.setItem('token', authData.token);
        localStorage.setItem('user', JSON.stringify({
          id: authData.userId,
          nombre: authData.nombre,
          email: authData.email,
          rol: authData.rol
        }));
        // Limpiar el hash de la URL
        window.history.replaceState(null, '', window.location.pathname);
      } catch {
        // Hash inválido, ignorar
      }
    }

    // 2) Verificar localStorage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'http://localhost:5173';
      }
    } else {
      // No hay sesión, redirigir al login
      window.location.href = 'http://localhost:5173';
      return;
    }

    setChecking(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'http://localhost:5173';
  };

  if (checking) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Verificando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
        <div className="topbar-right">
          {user && (
            <span className="user-badge">
              {user.nombre || user.email}
            </span>
          )}
          <button 
            onClick={handleLogout}
            className="logout-button"
            title="Cerrar sesión"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="content-area">
        {renderPage(activeTab)}
      </main>
    </div>
  );
}
