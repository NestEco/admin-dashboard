// src/pages/Comics.jsx
import { useEffect, useState } from "react";
import { comicsApi } from "../services/comicsApi";
import "./Comics.css";

function formatPrice(precio) {
  return `$${Number(precio).toFixed(2)}`;
}

function StockBadge({ stock }) {
  const level = stock > 7 ? "high" : stock > 3 ? "mid" : "low";
  return (
    <span className={`stock-badge stock-${level}`}>
      {stock} uds
    </span>
  );
}

function ComicRow({ comic }) {
  return (
    <tr>
      <td>
        <div className="comic-title-cell">
          <div className="comic-icon">📕</div>
          <div>
            <p className="comic-title">{comic.titulo}</p>
            <p className="comic-author">{comic.autor}</p>
          </div>
        </div>
      </td>
      <td>
        <span className="editorial-badge">{comic.editorial}</span>
      </td>
      <td className="price-cell">{formatPrice(comic.precio)}</td>
      <td><StockBadge stock={comic.stock} /></td>
    </tr>
  );
}

export default function Comics() {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    cargarComics();
  }, []);

  const totalStock = comics.reduce((sum, c) => sum + (c.stock || 0), 0);
  const totalValue = comics.reduce((sum, c) => sum + (c.precio || 0) * (c.stock || 0), 0);

  return (
    <div className="comics-page">
      {/* Header */}
      <div className="comics-header">
        <div>
          <h1 className="comics-title">Inventario de Cómics</h1>
          <p className="comics-subtitle">
            {comics.length} título{comics.length !== 1 ? "s" : ""} en catálogo
          </p>
        </div>
        <div className="comics-actions">
          <button className="btn-refresh-comics" onClick={cargarComics}>
            ↻ Actualizar
          </button>
        </div>
      </div>

      {/* Stats cards */}
      {!loading && !error && comics.length > 0 && (
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-label">Títulos</span>
            <span className="stat-value">{comics.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Stock Total</span>
            <span className="stat-value">{totalStock} uds</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Valor Inventario</span>
            <span className="stat-value">{formatPrice(totalValue)}</span>
          </div>
        </div>
      )}

      {/* Table */}
      {loading && <p className="comics-state-msg">Cargando inventario...</p>}
      {error && (
        <div className="comics-error-box">
          <strong>Error al conectar con el microservicio de cómics</strong>
          <p>{error}</p>
          <p className="comics-error-hint">
            Asegúrate de que el servicio esté corriendo en{" "}
            <code>http://localhost:8081</code>
          </p>
        </div>
      )}

      {!loading && !error && (
        <div className="comics-table-wrapper">
          <table className="comics-table">
            <thead>
              <tr>
                <th>Cómic</th>
                <th>Editorial</th>
                <th>Precio</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {comics.length === 0 ? (
                <tr>
                  <td colSpan={4} className="comics-empty-row">
                    No hay cómics en el inventario
                  </td>
                </tr>
              ) : (
                comics.map((c) => (
                  <ComicRow key={c.id} comic={c} />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
