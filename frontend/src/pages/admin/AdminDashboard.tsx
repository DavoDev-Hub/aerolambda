import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Plane, Calendar, Users, DollarSign } from 'lucide-react';
import { API_BASE_URL } from "@/config/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

export default function AdminDashboard() {
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    vuelosActivos: 0,
    reservasTotales: 0,
    totalClientes: 0,
    ingresosTotales: 0,
  });

  const [reservasPorMes, setReservasPorMes] = useState<ReservaMes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // 1. Estadísticas
        const statsResponse = await fetch(`${API_BASE_URL}/api/dashboard/estadisticas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statsData = await statsResponse.json();
        if (statsData.success) setEstadisticas(statsData.data);

        // 2. Gráfica
        const reservasResponse = await fetch(`${API_BASE_URL}/api/dashboard/reservas-por-mes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const reservasData = await reservasResponse.json();
        if (reservasData.success) setReservasPorMes(reservasData.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Tarjeta de Estadística Reutilizable con mejor contraste
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }: any) => (
    <Card className="p-6 border border-slate-100 shadow-sm bg-white relative overflow-hidden group">
      <div className={`absolute -right-4 -top-4 p-3 opacity-5 group-hover:opacity-10 transition-opacity`}>
         <Icon className={`w-32 h-32 ${colorClass}`} />
      </div>
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className={`w-12 h-12 ${bgClass} rounded-xl flex items-center justify-center mb-4`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        <div>
            <p className="text-slate-500 text-sm font-semibold mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
        </div>
      </div>
    </Card>
  );

  if (loading) return (
    <AdminLayout pageTitle="Panel de Control">
        <div className="flex items-center justify-center h-full">
            <div className="text-slate-500">Cargando datos...</div>
        </div>
    </AdminLayout>
  );

  return (
    <AdminLayout pageTitle="Panel de Control">
      <div className="space-y-8">
        
        {/* GRID DE ESTADÍSTICAS - Solo datos reales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Ingresos Totales" 
            value={`$${estadisticas.ingresosTotales.toLocaleString()}`} 
            icon={DollarSign}
            colorClass="text-emerald-600"
            bgClass="bg-emerald-50"
          />
          <StatCard 
            title="Reservas Totales" 
            value={estadisticas.reservasTotales}
            icon={Calendar}
            colorClass="text-blue-600"
            bgClass="bg-blue-50"
          />
          <StatCard 
            title="Vuelos Activos" 
            value={estadisticas.vuelosActivos}
            icon={Plane}
            colorClass="text-indigo-600"
            bgClass="bg-indigo-50"
          />
          <StatCard 
            title="Clientes" 
            value={estadisticas.totalClientes}
            icon={Users}
            colorClass="text-orange-600"
            bgClass="bg-orange-50"
          />
        </div>

        {/* GRÁFICA PRINCIPAL - Ocupa todo el ancho ahora que quitamos lo fake */}
        <Card className="p-6 border border-slate-100 shadow-sm bg-white">
            <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-800">Tendencia de Reservas</h3>
                <p className="text-sm text-slate-500">Reservas realizadas durante el año</p>
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reservasPorMes}>
                    <defs>
                    <linearGradient id="colorReservas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                        dataKey="mes" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748b', fontSize: 12}} 
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748b', fontSize: 12}} 
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="cantidad" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorReservas)" 
                        name="Reservas"
                    />
                </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>

      </div>
    </AdminLayout>
  );
}