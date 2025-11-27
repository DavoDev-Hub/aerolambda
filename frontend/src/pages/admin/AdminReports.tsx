import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, TrendingUp, Ticket, Award } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface IngresoVuelo {
  numeroVuelo: string;
  ruta: string;
  totalIngresos: number;
  totalReservas: number;
}

interface ReservaVuelo {
  numeroVuelo: string;
  ruta: string;
  totalReservas: number;
}

interface TopCliente {
  nombre: string;
  email: string;
  totalReservas: number;
  gastoTotal: number;
}

export default function AdminReports() {
  const [ingresosPorVuelo, setIngresosPorVuelo] = useState<IngresoVuelo[]>([]);
  const [reservasPorVuelo, setReservasPorVuelo] = useState<ReservaVuelo[]>([]);
  const [topClientes, setTopClientes] = useState<TopCliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      const token = localStorage.getItem('token');

      const ingresosResponse = await fetch('/api/dashboard/ingresos-por-vuelo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ingresosData = await ingresosResponse.json();
      if (ingresosData.success) setIngresosPorVuelo(ingresosData.data);

      const reservasResponse = await fetch('/api/dashboard/reservas-por-vuelo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const reservasData = await reservasResponse.json();
      if (reservasData.success) setReservasPorVuelo(reservasData.data);

      const clientesResponse = await fetch('/api/dashboard/top-clientes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const clientesData = await clientesResponse.json();
      if (clientesData.success) setTopClientes(clientesData.data);
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const descargarReporte = () => {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString('es-MX');

    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('AeroLambda - Reporte Ejecutivo', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el: ${fecha}`, 14, 30);
    doc.line(14, 35, 196, 35);

    let yPosition = 45;

    // Tabla 1
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Rendimiento Financiero por Vuelo', 14, yPosition);
    yPosition += 10;

    autoTable(doc, {
      startY: yPosition,
      head: [['Vuelo', 'Ruta', 'Ingresos', 'Reservas']],
      body: ingresosPorVuelo.map(item => [
        item.numeroVuelo,
        item.ruta,
        `$${item.totalIngresos.toLocaleString()} MXN`,
        item.totalReservas.toString()
      ]),
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Tabla 2
    doc.text('Top Clientes (Loyalty)', 14, yPosition);
    yPosition += 10;

    autoTable(doc, {
      startY: yPosition,
      head: [['#', 'Cliente', 'Reservas', 'Gasto Total']],
      body: topClientes.map((item, index) => [
        (index + 1).toString(),
        item.nombre,
        item.totalReservas.toString(),
        `$${item.gastoTotal.toLocaleString()} MXN`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
    });

    doc.save(`AeroLambda_Reporte_${fecha.replace(/\//g, '-')}.pdf`);
  };

  // Helper para ranking
  const getRankStyle = (index: number) => {
    switch (index) {
        case 0: return 'bg-yellow-100 text-yellow-700 border-yellow-200'; // Oro
        case 1: return 'bg-slate-200 text-slate-700 border-slate-300';   // Plata
        case 2: return 'bg-orange-100 text-orange-800 border-orange-200'; // Bronce
        default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getRankIcon = (index: number) => {
      if (index === 0) return '👑';
      if (index === 1) return '🥈';
      if (index === 2) return '🥉';
      return `#${index + 1}`;
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Reportes">
        <div className="flex items-center justify-center h-full text-slate-500">Generando análisis...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Reportes y Análisis">
      <div className="space-y-8 pb-10">
        
        {/* HEADER DE SECCIÓN */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Resumen Ejecutivo</h3>
            <p className="text-sm text-slate-500">Visualiza el rendimiento financiero y operativo de la aerolínea.</p>
          </div>
          <Button
            onClick={descargarReporte}
            className="bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 shadow-lg shadow-slate-900/20 transition-all"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>

        {/* GRÁFICAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Ingresos por Vuelo */}
          <Card className="p-6 border border-slate-100 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Ingresos por Vuelo</h2>
                        <p className="text-xs text-slate-500">Top vuelos con mayor recaudación</p>
                    </div>
                </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ingresosPorVuelo} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="numeroVuelo" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ingresos']}
                  />
                  <Bar dataKey="totalIngresos" fill="url(#blueGradient)" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Reservas por Vuelo */}
          <Card className="p-6 border border-slate-100 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                        <Ticket className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Volumen de Reservas</h2>
                        <p className="text-xs text-slate-500">Vuelos con mayor demanda</p>
                    </div>
                </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reservasPorVuelo} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="numeroVuelo" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="totalReservas" fill="url(#emeraldGradient)" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* LEADERBOARD DE CLIENTES */}
        <Card className="overflow-hidden border border-slate-200 shadow-sm bg-white">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <Award className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Top Clientes</h2>
                    <p className="text-xs text-slate-500">Usuarios con mayor gasto acumulado</p>
                </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="text-center px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider w-20">Rank</th>
                  <th className="text-left px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="text-right px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Reservas</th>
                  <th className="text-right px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Gasto Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topClientes.map((cliente, index) => (
                  <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border ${getRankStyle(index)}`}>
                            {getRankIcon(index)}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                            {cliente.nombre.charAt(0)}{cliente.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-700">{cliente.nombre}</p>
                            <p className="text-xs text-slate-400">{cliente.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {cliente.totalReservas} vuelos
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono font-bold text-emerald-600">
                        ${cliente.gastoTotal.toLocaleString()}
                      </span>
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