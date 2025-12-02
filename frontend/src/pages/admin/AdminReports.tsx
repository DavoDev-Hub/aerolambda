import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Calendar,
  DollarSign,
  Users,
  TrendingDown,
  Download,
  Filter,
  BarChart3
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Reporte {
  resumen: {
    totalReservas: number;
    reservasConfirmadas: number;
    reservasCanceladas: number;
    reservasPendientes: number;
    ingresosTotal: number;
    tasaCancelacion: number;
    pasajerosTransportados: number;
  };
  reservasPorDia: Array<{ fecha: string; cantidad: number }>;
  ingresosPorVuelo: Array<{ vuelo: string; ingresos: number; reservas: number }>;
  distribucionEstados: {
    confirmadas: number;
    canceladas: number;
    pendientes: number;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reservas: Array<any>;
}

export default function AdminReports() {
  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Filtros
  const [fechaInicio, setFechaInicio] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Últimos 30 días por defecto
    return date.toISOString().split('T')[0];
  });
  const [fechaFin, setFechaFin] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [estado, setEstado] = useState('');

  useEffect(() => {
    fetchReportes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReportes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      if (estado) params.append('estado', estado);

      const response = await fetch(`/api/reservas/reportes?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        setReporte(data.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!reporte) return;

    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Colores
    const primaryColor: [number, number, number] = [37, 99, 235];
    const lightBlue: [number, number, number] = [219, 234, 254];
    const darkGray: [number, number, number] = [31, 41, 55];
    const greenColor: [number, number, number] = [16, 185, 129];
    const redColor: [number, number, number] = [239, 68, 68];
    const purpleColor: [number, number, number] = [168, 85, 247];

    let currentY = 20;

    // === HEADER ===
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, pageWidth, 40, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AEROLAMBDA', 20, 20);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Reporte de Reservas', 20, 28);

    // Fecha del reporte
    pdf.setFontSize(9);
    pdf.text(`Generado: ${new Date().toLocaleString('es-MX')}`, pageWidth - 20, 20, { align: 'right' });
    pdf.text(`Período: ${new Date(fechaInicio).toLocaleDateString('es-MX')} - ${new Date(fechaFin).toLocaleDateString('es-MX')}`, pageWidth - 20, 28, { align: 'right' });

    currentY = 50;

    // === STATS CARDS ===
    const cardWidth = (pageWidth - 50) / 4;
    const cardHeight = 25;
    const cardGap = 5;
    const stats: Array<{ label: string; value: string; color: readonly [number, number, number] }> = [
      { label: 'Total Reservas', value: reporte.resumen.totalReservas.toString(), color: primaryColor },
      { label: 'Ingresos', value: `$${reporte.resumen.ingresosTotal.toLocaleString()}`, color: greenColor },
      { label: 'Pasajeros', value: reporte.resumen.pasajerosTransportados.toString(), color: purpleColor },
      { label: 'Cancelación', value: `${reporte.resumen.tasaCancelacion.toFixed(1)}%`, color: redColor }
    ];

    stats.forEach((stat, index) => {
      const x = 20 + (cardWidth + cardGap) * index;
      
      // Card background
      pdf.setFillColor(...lightBlue);
      pdf.roundedRect(x, currentY, cardWidth, cardHeight, 3, 3, 'F');

      // Label
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.setFont('helvetica', 'normal');
      pdf.text(stat.label, x + cardWidth / 2, currentY + 8, { align: 'center' });

      // Value
      pdf.setFontSize(16);
      pdf.setTextColor(...stat.color);
      pdf.setFont('helvetica', 'bold');
      pdf.text(stat.value, x + cardWidth / 2, currentY + 18, { align: 'center' });
    });

    currentY += cardHeight + 15;

    // === RESUMEN DETALLADO ===
    pdf.setFillColor(...lightBlue);
    pdf.roundedRect(20, currentY, pageWidth - 40, 35, 2, 2, 'F');

    pdf.setFontSize(10);
    pdf.setTextColor(...primaryColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RESUMEN EJECUTIVO', 25, currentY + 8);

    pdf.setFontSize(9);
    pdf.setTextColor(...darkGray);
    pdf.setFont('helvetica', 'normal');

    const resumenTexto = [
      `• Reservas Confirmadas: ${reporte.resumen.reservasConfirmadas} (${((reporte.resumen.reservasConfirmadas / reporte.resumen.totalReservas) * 100).toFixed(1)}%)`,
      `• Reservas Canceladas: ${reporte.resumen.reservasCanceladas} (${reporte.resumen.tasaCancelacion.toFixed(1)}%)`,
      `• Reservas Pendientes: ${reporte.resumen.reservasPendientes}`,
      `• Ingreso Promedio por Reserva: $${(reporte.resumen.ingresosTotal / (reporte.resumen.reservasConfirmadas || 1)).toFixed(0)}`
    ];

    resumenTexto.forEach((texto, index) => {
      pdf.text(texto, 25, currentY + 18 + (index * 5));
    });

    currentY += 45;

    // === TOP 5 VUELOS ===
    pdf.setFontSize(11);
    pdf.setTextColor(...primaryColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TOP 5 VUELOS POR INGRESOS', 20, currentY);
    currentY += 8;

    const topVuelos = reporte.ingresosPorVuelo.slice(0, 5);
    topVuelos.forEach((vuelo, index) => {
      const barWidth = (vuelo.ingresos / topVuelos[0].ingresos) * 100;
      
      pdf.setFillColor(200, 200, 200);
      pdf.rect(60, currentY, 100, 6, 'F');
      
      pdf.setFillColor(...greenColor);
      pdf.rect(60, currentY, barWidth, 6, 'F');

      pdf.setFontSize(8);
      pdf.setTextColor(...darkGray);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${index + 1}. ${vuelo.vuelo}`, 22, currentY + 4);
      pdf.text(`$${vuelo.ingresos.toLocaleString()}`, 165, currentY + 4);
      
      currentY += 10;
    });

    currentY += 5;

    // === TABLA DE RESERVAS ===
    pdf.setFontSize(11);
    pdf.setTextColor(...primaryColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DETALLE DE RESERVAS', 20, currentY);
    currentY += 5;

    // Preparar datos para la tabla
    const tableData = reporte.reservas.slice(0, 30).map(r => [
      r.codigoReserva || 'N/A',
      r.vuelo?.numeroVuelo || 'N/A',
      `${r.pasajero.nombre} ${r.pasajero.apellido}`,
      new Date(r.createdAt).toLocaleDateString('es-MX'),
      r.estado,
      `$${r.precioTotal.toLocaleString()}`
    ]);

    autoTable(pdf, {
      startY: currentY,
      head: [['Código', 'Vuelo', 'Pasajero', 'Fecha', 'Estado', 'Precio']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 7,
        textColor: darkGray
      },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold' },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 45 },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 20, halign: 'right', fontStyle: 'bold' }
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      margin: { left: 20, right: 20 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      didParseCell: function(data: any) {
        if (data.column.index === 4 && data.section === 'body') {
          const estado = data.cell.raw;
          if (estado === 'confirmada') {
            data.cell.styles.textColor = [16, 185, 129];
            data.cell.styles.fontStyle = 'bold';
          } else if (estado === 'cancelada') {
            data.cell.styles.textColor = [239, 68, 68];
            data.cell.styles.fontStyle = 'bold';
          } else if (estado === 'pendiente') {
            data.cell.styles.textColor = [245, 158, 11];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    // === FOOTER ===
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (pdf as any).lastAutoTable.finalY + 10;
    
    if (finalY < pageHeight - 30) {
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, finalY, pageWidth - 20, finalY);
      
      pdf.setFontSize(7);
      pdf.setTextColor(150, 150, 150);
      pdf.setFont('helvetica', 'italic');
      pdf.text('AeroLambda - Sistema de Gestión de Vuelos', pageWidth / 2, finalY + 8, { align: 'center' });
      pdf.text(`Página 1 de 1 | Total de reservas en reporte: ${reporte.reservas.length}`, pageWidth / 2, finalY + 12, { align: 'center' });
    }

    // Si hay más de 30 reservas, agregar nota
    if (reporte.reservas.length > 30) {
      pdf.addPage();
      pdf.setFontSize(10);
      pdf.setTextColor(...darkGray);
      pdf.text(`Nota: Este reporte muestra las primeras 30 reservas de un total de ${reporte.reservas.length}.`, 20, 30);
      pdf.text('Para ver el reporte completo, ajuste los filtros de fecha.', 20, 38);
    }

    // Guardar PDF
    pdf.save(`Reporte-AeroLambda-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const COLORS = {
    confirmadas: '#10b981',
    canceladas: '#ef4444',
    pendientes: '#f59e0b'
  };

  if (loading && !reporte) {
    return (
      <AdminLayout pageTitle="Reportes">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Reportes">
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Reportes y Análisis</h1>
          <p className="text-slate-500">Visualiza las estadísticas de reservas</p>
        </div>

        {/* Filtros */}
        <Card className="p-6 bg-white border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-800">Filtros</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Estado
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={fetchReportes} className="flex-1">
                Aplicar Filtros
              </Button>
              <Button
                onClick={exportToPDF}
                variant="outline"
                disabled={!reporte}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                PDF
              </Button>
            </div>
          </div>
        </Card>

        {reporte && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white p-5 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Total Reservas</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">
                      {reporte.resumen.totalReservas}
                    </h3>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="bg-white p-5 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Ingresos</p>
                    <h3 className="text-3xl font-bold text-green-600 mt-1">
                      ${reporte.resumen.ingresosTotal.toLocaleString()}
                    </h3>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="bg-white p-5 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Pasajeros</p>
                    <h3 className="text-3xl font-bold text-purple-600 mt-1">
                      {reporte.resumen.pasajerosTransportados}
                    </h3>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </Card>

              <Card className="bg-white p-5 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Tasa Cancelación</p>
                    <h3 className="text-3xl font-bold text-red-600 mt-1">
                      {reporte.resumen.tasaCancelacion.toFixed(1)}%
                    </h3>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Gráfico de Línea - Reservas por Día */}
              <Card className="p-6 bg-white border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-slate-800">Reservas por Día</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reporte.reservasPorDia}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="fecha" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('es-MX')}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="cantidad" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      name="Reservas"
                      dot={{ fill: '#2563eb', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Gráfico de Pastel - Distribución por Estado */}
              <Card className="p-6 bg-white border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribución por Estado</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Confirmadas', value: reporte.distribucionEstados.confirmadas },
                        { name: 'Canceladas', value: reporte.distribucionEstados.canceladas },
                        { name: 'Pendientes', value: reporte.distribucionEstados.pendientes }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill={COLORS.confirmadas} />
                      <Cell fill={COLORS.canceladas} />
                      <Cell fill={COLORS.pendientes} />
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              {/* Gráfico de Barras - Ingresos por Vuelo */}
              <Card className="p-6 bg-white border border-slate-200 lg:col-span-2">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Top 10 Vuelos por Ingresos</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reporte.ingresosPorVuelo.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="vuelo" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => `$${Number(value).toLocaleString()}`}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Legend />
                    <Bar dataKey="ingresos" fill="#10b981" name="Ingresos (MXN)" />
                    <Bar dataKey="reservas" fill="#3b82f6" name="Reservas" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Tabla de Reservas */}
            <Card className="bg-white border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">
                  Detalle de Reservas ({reporte.reservas.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Código</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Vuelo</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Pasajero</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Precio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reporte.reservas.slice(0, 50).map((reserva) => (
                      <tr key={reserva._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-mono text-slate-800">
                          {reserva.codigoReserva}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {reserva.vuelo?.numeroVuelo || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {reserva.pasajero.nombre} {reserva.pasajero.apellido}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {new Date(reserva.createdAt).toLocaleDateString('es-MX')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            reserva.estado === 'confirmada' 
                              ? 'bg-green-100 text-green-700' 
                              : reserva.estado === 'cancelada'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {reserva.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-slate-800">
                          ${reserva.precioTotal.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}