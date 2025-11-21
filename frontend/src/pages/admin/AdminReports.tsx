import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, FileText, TrendingUp } from 'lucide-react';
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

export default function Reports() {
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

      // Obtener ingresos por vuelo
      const ingresosResponse = await fetch('/api/dashboard/ingresos-por-vuelo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ingresosData = await ingresosResponse.json();
      if (ingresosData.success) {
        setIngresosPorVuelo(ingresosData.data);
      }

      // Obtener reservas por vuelo
      const reservasResponse = await fetch('/api/dashboard/reservas-por-vuelo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const reservasData = await reservasResponse.json();
      if (reservasData.success) {
        setReservasPorVuelo(reservasData.data);
      }

      // Obtener top clientes
      const clientesResponse = await fetch('/api/dashboard/top-clientes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const clientesData = await clientesResponse.json();
      if (clientesData.success) {
        setTopClientes(clientesData.data);
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const descargarReporte = () => {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString('es-MX');

    // Título
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // primary color
    doc.text('AeroLambda - Reporte de Análisis', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha de generación: ${fecha}`, 14, 30);

    // Línea separadora
    doc.setDrawColor(200);
    doc.line(14, 35, 196, 35);

    let yPosition = 45;

    // Sección 1: Ingresos por Vuelo
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Ingresos por Vuelo', 14, yPosition);
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
      margin: { left: 14, right: 14 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Sección 2: Reservas por Vuelo
    doc.setFontSize(14);
    doc.text('Reservas por Vuelo', 14, yPosition);
    yPosition += 10;

    autoTable(doc, {
      startY: yPosition,
      head: [['Vuelo', 'Ruta', 'Total Reservas']],
      body: reservasPorVuelo.map(item => [
        item.numeroVuelo,
        item.ruta,
        item.totalReservas.toString()
      ]),
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      margin: { left: 14, right: 14 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Nueva página si es necesario
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Sección 3: Top Clientes
    doc.setFontSize(14);
    doc.text('Top Clientes', 14, yPosition);
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
      headStyles: { fillColor: [147, 51, 234] },
      margin: { left: 14, right: 14 },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Guardar PDF
    doc.save(`AeroLambda_Reporte_${fecha.replace(/\//g, '-')}.pdf`);
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Reportes">
        <div className="p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando reportes...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Reportes">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 mt-1">
              Análisis detallado de rendimiento y estadísticas
            </p>
          </div>
          <Button
            onClick={descargarReporte}
            className="flex items-center gap-2 bg-primary text-white"
          >
            <Download className="w-5 h-5" />
            Descargar Reporte PDF
          </Button>
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ingresos por Vuelo */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Ingresos por Vuelo</h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ingresosPorVuelo}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="numeroVuelo"
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
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ingresos']}
                  />
                  <Bar dataKey="totalIngresos" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Reservas por Vuelo */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Reservas por Vuelo</h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reservasPorVuelo}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="numeroVuelo"
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
                  <Bar dataKey="totalReservas" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Tabla de Top Clientes */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Top Clientes</h2>
            <p className="text-sm text-gray-600 mt-1">
              Clientes con mayor número de reservas y gasto total
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">#</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Nombre</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Reservas</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Gasto Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topClientes.map((cliente, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{cliente.nombre}</p>
                        <p className="text-xs text-gray-500">{cliente.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{cliente.totalReservas}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-primary">
                      ${cliente.gastoTotal.toLocaleString()} MXN
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {topClientes.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-500">No hay datos de clientes disponibles</p>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}