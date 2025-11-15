/* eslint-disable @typescript-eslint/no-explicit-any */
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Plane, DollarSign, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

const reservasPorMes = [
  { mes: 'Ene', reservas: 120 },
  { mes: 'Feb', reservas: 145 },
  { mes: 'Mar', reservas: 168 },
  { mes: 'Abr', reservas: 192 },
  { mes: 'May', reservas: 215 },
  { mes: 'Jun', reservas: 238 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalFlights: 0,
    totalReservations: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');

        // Obtener estadísticas básicas
        const [flightsRes, reservasRes] = await Promise.all([
          fetch('/api/vuelos', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/reservas/todas', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
        ]);

        const flightsData = await flightsRes.json();
        const reservasData = await reservasRes.json();

        if (flightsData.success && reservasData.success) {
          const totalRevenue = reservasData.data.reservas
             
            .filter((r: any) => r.estado === 'confirmada')
            .reduce((sum: number, r: any) => sum + r.precioTotal, 0);

          setStats({
            totalFlights: flightsData.data.vuelos?.length || 0,
            totalReservations: reservasData.data.reservas?.length || 0,
            totalRevenue: totalRevenue,
            totalCustomers: 0, // TODO: agregar endpoint de usuarios
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    { label: 'Vuelos Activos', value: stats.totalFlights, icon: Plane, color: 'bg-blue-500' },
    { label: 'Reservas Totales', value: stats.totalReservations, icon: Calendar, color: 'bg-green-500' },
    { label: 'Clientes', value: stats.totalCustomers, icon: Users, color: 'bg-purple-500' },
    { label: 'Ingresos', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-orange-500' },
  ];

  if (loading) {
    return (
      <AdminLayout pageTitle="Dashboard">
        <div className="p-8">
          <p>Cargando estadísticas...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Dashboard">
      <div className="p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {statsCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Reservas por Mes</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reservasPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="reservas" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}