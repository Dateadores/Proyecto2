import React, { useState } from "react";

// Define la interfaz para un resultado de consulta
interface QueryResult {
  track_id: string;
  track_name: string;
  track_artist: string;
  lyrics: string;
  row_position: number;
  similitudCoseno: number;
}

const Consulta: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [topK, setTopK] = useState<number>(10);
  const [indexMethod, setIndexMethod] = useState<string>("Propio");
  const [results, setResults] = useState<QueryResult[]>([]);
  const [queryTime, setQueryTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleTopKChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTopK(Number(event.target.value));
  };

  const handleIndexMethodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setIndexMethod(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, k:topK }), // Enviar datos como JSON
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Error en la consulta: ${errorMessage}`);

      }

      const data = await response.json();
      setResults(data.results);
      setQueryTime(data.query_time * 1000); // Convertir a milisegundos si es necesario
      setError(null); // Limpiar el error si la consulta es exitosa
    } catch (error: unknown) {
      console.error("Error al realizar la consulta:", error);
      if (error instanceof Error) {
        setError(error.message); // Solo accedemos a `message` si `error` es una instancia de `Error`
      } else {
        setError("Hubo un problema con la consulta. Inténtalo de nuevo.");
      }
    }
  };

  return (
    <div className="consulta-container">
      <h2>Realiza tu consulta</h2>

      <div>
        <label>Consulta:</label>
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Ingresa tu consulta"
        />
      </div>

      <div>
        <label>Cantidad de resultados (Top K):</label>
        <input
          type="number"
          value={topK}
          onChange={handleTopKChange}
          min={1}
          max={1000}
        />
      </div>

      <div>
        <label>Método de indexación:</label>
        <select value={indexMethod} onChange={handleIndexMethodChange}>
          <option value="Propio">Implementación Propia</option>
          <option value="PostgreSQL">PostgreSQL</option>
        </select>
      </div>

      <button onClick={handleSubmit}>Buscar</button>

      {error && <p className="error">{error}</p>}

      {results.length > 0 && (
        <div className="results">
          <h3>Resultados</h3>
          <p>Tiempo de consulta: {queryTime.toFixed(2)} milisegundos</p>          
          <table>
            <thead>
              <tr>
                <th>Track ID</th>
                <th>Track Name</th>
                <th>Track Artist</th>
                <th>Lyrics</th>
                <th>Posición</th>
                <th>Similitud Coseno</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <td>{result.track_id}</td>
                  <td>{result.track_name}</td>
                  <td>{result.track_artist}</td>
                  <td>{result.lyrics}</td>
                  <td>{result.row_position}</td>
                  <td>{result.similitudCoseno}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Consulta;