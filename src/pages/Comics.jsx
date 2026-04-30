// src/pages/Comics.jsx
import { useEffect, useState } from "react";
import { comicsApi } from "../services/comicsApi";
import "./Comics.css";

// ── Helpers ───────────────────────────────────────────────

function formatPrecio(precio) {
  if (precio == null) return "—";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(precio);
}

function StockBadge({ stock }) {
  const cls =
    stock === 0 ? "stock-empty" : stock <= 5 ? "stock-low" : "stock-ok";
  const label =
    stock === 0 ? "Sin stock" : stock <= 5 ? `${stock} restantes` : stock;
  return <span className={`stock-badge ${cls}`}>{label}</span>;
}

function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${status}`}>
      {status === "UP" ? "Conectado" : "Sin conexión"}
    </span>
  );
}

// ── Fila de tabla ─────────────────────────────────────────

function ComicRow({ comic, onDelete }) {
  const [confirmando, setConfirmando] = useState(false);

  const handleDelete = async () => {
    if (!confirmando) { setConfirmando(true); return; }
    try {
      await onDelete(comic.id);
    } catch {
      setConfirmando(false);
    }
  };

  return (
    <tr>
      <td>
        <p className="comic-titulo">{comic.titulo}</p>
        <p className="comic-id">#{comic.id}</p>
      </td>
      <td>{comic.autor ?? "—"}</td>
      <td>
        <span className="editorial-badge">{comic.editorial ?? "—"}</span>
      </td>
      <td className="precio-cell">{formatPrecio(comic.precio)}</td>
      <td><StockBadge stock={comic.stock ?? 0} /></td>
      <td>
        <button
          className={`btn-delete${confirmando ? " confirming" : ""}`}
          onClick={handleDelete}
          onBlur={() => setConfirmando(false)}
        >
          {confirmando ? "¿Confirmar?" : "Eliminar"}
        </button>
      </td>
    </tr>
  );
}

// ── Panel de filtros ──────────────────────────────────────

function Filtros({ filtros, onChange, onReset, editoriales, autores }) {
  return (
    <div className="filtros-panel">
      <div className="filtros-row">

        <div className="filtro-group">
          <label className="filtro-label">Búsqueda</label>
          <input
            className="filtro-input"
            type="text"
            placeholder="Título, autor, editorial..."
            value={filtros.busqueda}
            onChange={(e) => onChange("busqueda", e.target.value)}
          />
        </div>

        <div className="filtro-group">
          <label className="filtro-label">Autor</label>
          <select
            className="filtro-input"
            value={filtros.autor}
            onChange={(e) => onChange("autor", e.target.value)}
          >
            <option value="">Todos</option>
            {autores.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="filtro-group">
          <label className="filtro-label">Editorial</label>
          <select
            className="filtro-input"
            value={filtros.editorial}
            onChange={(e) => onChange("editorial", e.target.value)}
          >
            <option value="">Todas</option>
            {editoriales.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        <div className="filtro-group filtro-group--range">
          <label className="filtro-label">Precio (CLP)</label>
          <div className="range-inputs">
            <input
              className="filtro-input filtro-input--sm"
              type="number"
              placeholder="Mín"
              min={0}
              value={filtros.precioMin}
              onChange={(e) => onChange("precioMin", e.target.value)}
            />
            <span className="range-sep">—</span>
            <input
              className="filtro-input filtro-input--sm"
              type="number"
              placeholder="Máx"
              min={0}
              value={filtros.precioMax}
              onChange={(e) => onChange("precioMax", e.target.value)}
            />
          </div>
        </div>

        <div className="filtro-group">
          <label className="filtro-label">Stock</label>
          <select
            className="filtro-input"
            value={filtros.stock}
            onChange={(e) => onChange("stock", e.target.value)}
          >
            <option value="">Todos</option>
            <option value="disponible">Con stock</option>
            <option value="bajo">Stock bajo (≤5)</option>
            <option value="vacio">Sin stock</option>
          </select>
        </div>

      </div>

      <button className="btn-reset" onClick={onReset}>
        ✕ Limpiar filtros
      </button>
    </div>
  );
}

// ── Filtros iniciales ─────────────────────────────────────

const FILTROS_INIT = {
  busqueda:  "",
  autor:     "",
  editorial: "",
  precioMin: "",
  precioMax: "",
  stock:     "",
};

// ── Componente principal ──────────────────────────────────

export default function Comics() {
  const [comics, setComics]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [filtros, setFiltros]     = useState(FILTROS_INIT);

  useEffect(() => {
    comicsApi.healthCheck()
      .then((d) => setApiStatus(d.status))
      .catch(() => setApiStatus("DOWN"));
  }, []);

  const cargarComics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await comicsApi.obtenerTodos();
      setComics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarComics(); }, []);

  const handleEliminar = async (id) => {
    await comicsApi.eliminar(id);
    setComics((prev) => prev.filter((c) => c.id !== id));
  };

  const handleFiltro = (key, value) =>
    setFiltros((prev) => ({ ...prev, [key]: value }));

  const handleReset = () => setFiltros(FILTROS_INIT);

  // Opciones únicas para los selects
  const editoriales = [...new Set(comics.map((c) => c.editorial).filter(Boolean))].sort();
  const autores     = [...new Set(comics.map((c) => c.autor).filter(Boolean))].sort();

  // Aplicar filtros
  const comicsFiltrados = comics.filter((c) => {
    const texto = filtros.busqueda.toLowerCase();
    if (texto && !(
      c.titulo?.toLowerCase().includes(texto) ||
      c.autor?.toLowerCase().includes(texto) ||
      c.editorial?.toLowerCase().includes(texto)
    )) return false;

    if (filtros.autor     && c.autor     !== filtros.autor)     return false;
    if (filtros.editorial && c.editorial !== filtros.editorial) return false;

    if (filtros.precioMin && c.precio < Number(filtros.precioMin)) return false;
    if (filtros.precioMax && c.precio > Number(filtros.precioMax)) return false;

    if (filtros.stock === "disponible" && c.stock <= 0)  return false;
    if (filtros.stock === "bajo"       && (c.stock <= 0 || c.stock > 5)) return false;
    if (filtros.stock === "vacio"      && c.stock !== 0) return false;

    return true;
  });

  const hayFiltros = Object.values(filtros).some((v) => v !== "");

  return (
    <div className="comics-page">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Cómics</h1>
          <p className="page-subtitle">
            {hayFiltros
              ? `${comicsFiltrados.length} de ${comics.length} cómics`
              : `${comics.length} cómic${comics.length !== 1 ? "s" : ""} en catálogo`}
          </p>
        </div>
        <div className="header-actions">
          <StatusBadge status={apiStatus ?? "—"} />
          <button className="btn-refresh" onClick={cargarComics}>↻ Actualizar</button>
        </div>
      </div>

      {/* Filtros */}
      <Filtros
        filtros={filtros}
        onChange={handleFiltro}
        onReset={handleReset}
        editoriales={editoriales}
        autores={autores}
      />

      {/* Estados */}
      {loading && <p className="state-msg">Cargando cómics...</p>}
      {error && (
        <div className="error-box">
          <strong>Error al conectar con el microservicio</strong>
          <p>{error}</p>
          <p className="error-hint">
            Asegúrate de que el servicio esté corriendo en{" "}
            <code>{import.meta.env.VITE_COMICS_API_URL}</code>
          </p>
        </div>
      )}

      {/* Tabla */}
      {!loading && !error && (
        <div className="table-wrapper">
          <table className="comics-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>Editorial</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {comicsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-row">
                    No se encontraron cómics con esos filtros
                  </td>
                </tr>
              ) : (
                comicsFiltrados.map((c) => (
                  <ComicRow key={c.id} comic={c} onDelete={handleEliminar} />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
