import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminReports() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ingresosPorVuelo, setIngresosPorVuelo] = useState<any[]>([]);
       
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reservasPorVuelo, setReservasPorVuelo] = useState<any[]>([]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [topClientes, setTopClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Obtener todas las reservas
      const response = await fetch('/api/reservas/todas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        const reservas = data.data.reservas;

        // Calcular ingresos por vuelo
        const ingresosMap = new Map();
        const reservasMap = new Map();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        reservas.forEach((reserva: any) => {
          const numeroVuelo = reserva.vuelo.numeroVuelo;
          
          if (reserva.estado === 'confirmada') {
            ingresosMap.set(
              numeroVuelo,
              (ingresosMap.get(numeroVuelo) || 0) + reserva.precioTotal
            );
          }

          reservasMap.set(
            numeroVuelo,
            (reservasMap.get(numeroVuelo) || 0) + 1
          );
        });

        // Convertir a arrays para gráficas
        const ingresos = Array.from(ingresosMap.entries())
          .map(([vuelo, ingresos]) => ({ vuelo, ingresos }))
          .slice(0, 10);

        const reservasPorV = Array.from(reservasMap.entries())
          .map(([vuelo, reservas]) => ({ vuelo, reservas }))
          .slice(0, 10);

        setIngresosPorVuelo(ingresos);
        setReservasPorVuelo(reservasPorV);

        // Top clientes (mock data por ahora)
        setTopClientes([
          { nombre: 'Carlos Ramírez', reservas: 5, gasto: 12250 },
          { nombre: 'María González', reservas: 4, gasto: 9800 },
          { nombre: 'Juan Martínez', reservas: 3, gasto: 7350 },
        ]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Reportes">
        <div className="p-8">
          <p>Cargando reportes...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Reportes">
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-bold">Reportes y Análisis</h1>

        {/* Gráficas */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Ingresos por Vuelo</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={ingresosPorVuelo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vuelo" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ingresos" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Reservas por Vuelo</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={reservasPorVuelo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vuelo" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reservas" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Top Clientes */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Top Clientes</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">#</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">Nombre</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">Reservas</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">Gasto Total</th>
                </tr>
              </thead>
              <tbody>
                {topClientes.map((cliente, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 text-gray-900">{cliente.nombre}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{cliente.reservas}</td>
                    <td className="px-6 py-4 font-semibold text-blue-600">
                      ${cliente.gasto.toLocaleString()} MXN
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}