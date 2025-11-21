import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Plane, Calendar, Users, DollarSign, TrendingUp, Clock } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface Estadisticas {
  vuelosActivos: number;
  reservasTotales: number;
  totalClientes: number;
  ingresosTotales: number;
}

interface ReservaMes {
  mes: string;
  cantidad: number;
  ingresos: number;
}

export default function Dashboard() {
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    vuelosActivos: 0,
    reservasTotales: 0,
    totalClientes: 0,
    ingresosTotales: 0,
  });

  const [reservasPorMes, setReservasPorMes] = useState<ReservaMes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Obtener estadísticas generales
      const statsResponse = await fetch('/api/dashboard/estadisticas', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsResponse.json();

      if (statsData.success) {
        setEstadisticas(statsData.data);
      }

      // Obtener reservas por mes
      const reservasResponse = await fetch('/api/dashboard/reservas-por-mes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const reservasData = await reservasResponse.json();

      if (reservasData.success) {
        setReservasPorMes(reservasData.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Dashboard">
        <div className="p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando estadísticas...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Dashboard">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <p className="text-gray-600 mt-1">
            Bienvenido al sistema de gestión de AeroLambda
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Vuelos Activos */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vuelos Activos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {estadisticas.vuelosActivos}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Plane className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">Programados</span>
            </div>
          </Card>

          {/* Reservas Totales */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reservas Totales</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {estadisticas.reservasTotales}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Clock className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-gray-600">Todas las reservas</span>
            </div>
          </Card>

          {/* Clientes */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {estadisticas.totalClientes}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">Usuarios registrados</span>
            </div>
          </Card>

          {/* Ingresos */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${estadisticas.ingresosTotales.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">MXN</span>
            </div>
          </Card>
        </div>

        {/* Chart */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Reservas por Mes</h2>
            <p className="text-sm text-gray-600 mt-1">
              Estadísticas de reservas del año {new Date().getFullYear()}
            </p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reservasPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="mes"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cantidad"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Reservas"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quick Actions or Recent Activity could go here */}
      </div>
    </AdminLayout>
  );
}