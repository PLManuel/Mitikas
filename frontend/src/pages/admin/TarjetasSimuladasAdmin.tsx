import { useEffect, useState } from 'react';

interface TarjetaSimulada {
  id: number;
  numero_tarjeta: string;
  nombre_titular: string;
  fecha_expiracion: string;
  cvv: string;
  saldo: number;
  idUsuario: number;
  nombreUsuario?: string;
  apellidosUsuario?: string;
}

export default function TarjetasSimuladasAdmin() {
  const [tarjetas, setTarjetas] = useState<TarjetaSimulada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTarjetas() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/tarjetas-simuladas');
        const data = await res.json();
        setTarjetas(Array.isArray(data) ? data : []);
      } catch (e) {
        setError('Error al cargar tarjetas');
      } finally {
        setLoading(false);
      }
    }
    fetchTarjetas();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tarjetas Simuladas</h1>
      {loading ? <div>Cargando...</div> : error ? <div>{error}</div> : (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Usuario</th>
              <th className="p-2 border">Número</th>
              <th className="p-2 border">Titular</th>
              <th className="p-2 border">Expiración</th>
              <th className="p-2 border">CVV</th>
              <th className="p-2 border">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {tarjetas.map(t => (
              <tr key={t.id}>
                <td className="border p-2">{t.id}</td>
                <td className="border p-2">{t.nombreUsuario} {t.apellidosUsuario}</td>
                <td className="border p-2 font-mono">{t.numero_tarjeta}</td>
                <td className="border p-2">{t.nombre_titular}</td>
                <td className="border p-2">{t.fecha_expiracion}</td>
                <td className="border p-2">{t.cvv}</td>
                <td className="border p-2">S/ {Number(t.saldo).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
