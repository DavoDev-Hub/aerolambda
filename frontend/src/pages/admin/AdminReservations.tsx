import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { API_BASE_URL } from "@/config/api";
import {  
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User,
  Ticket
} from 'lucide-react';

interface Reservation {
  _id: string;
  codigoReserva: string;
  usuario: { 
    nombre: string; 
    apellido: string; 
    email: string;
  } | null;
  vuelo: { 
    numeroVuelo: string; 
    origen: { codigo: string }; 
    destino: { codigo: string };
  } | null;
  asiento: { 
    numero: string;
  } | null;
  pasajero: { 
    nombre: string; 
    apellido: string;
  };
  precioTotal: number;
  estado: string;
  createdAt: string;
}

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/reservas/todas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setReservations(data.data.reservas || []);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (estado: string) => {
    switch (estado) {
      case 'confirmada':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pendiente':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelada':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'completada':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Filtrado
  const filteredReservations = reservations.filter(res => {
    const matchesSearch = 
      res.codigoReserva.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.usuario?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.pasajero.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = filterEstado ? res.estado === filterEstado : true;

    return matchesSearch && matchesEstado;
  });

  // Estadísticas rápidas
  const stats = {
    total: reservations.length,
    confirmadas: reservations.filter(r => r.estado === 'confirmada').length,
    pendientes: reservations.filter(r => r.estado === 'pendiente').length,
    canceladas: reservations.filter(r => r.estado === 'cancelada').length,
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Reservas">
        <div className="flex items-center justify-center h-full text-slate-500">Cargando reservas...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Gestión de Reservas">
      <div className="space-y-6">
        
        {/* TOP BAR: Stats Cards con Iconos y Colores */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-blue-500 shadow-sm relative overflow-hidden group">
            <div className="p-3 rounded-full bg-blue-50 text-blue-600 z-10">
                <Ticket className="w-6 h-6" />
            </div>
            <div className="z-10">
                <p className="text-sm text-slate-500 font-medium">Total Reservas</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <Ticket className="absolute -right-4 -bottom-4 w-24 h-24 text-blue-50 group-hover:scale-110 transition-transform" />
          </Card>

          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-emerald-500 shadow-sm relative overflow-hidden group">
            <div className="p-3 rounded-full bg-emerald-50 text-emerald-600 z-10">
                <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="z-10">
                <p className="text-sm text-slate-500 font-medium">Confirmadas</p>
                <p className="text-2xl font-bold text-slate-800">{stats.confirmadas}</p>
            </div>
            <CheckCircle2 className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-50 group-hover:scale-110 transition-transform" />
          </Card>

          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-amber-500 shadow-sm relative overflow-hidden group">
            <div className="p-3 rounded-full bg-amber-50 text-amber-600 z-10">
                <Clock className="w-6 h-6" />
            </div>
            <div className="z-10">
                <p className="text-sm text-slate-500 font-medium">Pendientes</p>
                <p className="text-2xl font-bold text-slate-800">{stats.pendientes}</p>
            </div>
            <Clock className="absolute -right-4 -bottom-4 w-24 h-24 text-amber-50 group-hover:scale-110 transition-transform" />
          </Card>

          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-rose-500 shadow-sm relative overflow-hidden group">
            <div className="p-3 rounded-full bg-rose-50 text-rose-600 z-10">
                <XCircle className="w-6 h-6" />
            </div>
            <div className="z-10">
                <p className="text-sm text-slate-500 font-medium">Canceladas</p>
                <p className="text-2xl font-bold text-slate-800">{stats.canceladas}</p>
            </div>
            <XCircle className="absolute -right-4 -bottom-4 w-24 h-24 text-rose-50 group-hover:scale-110 transition-transform" />
          </Card>
        </div>

        {/* TOOLBAR: Buscador y Filtros */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-1 gap-3 w-full md:w-auto">
                <div className="relative group flex-1 md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por código, email o pasajero..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>
                
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        value={filterEstado}
                        onChange={(e) => setFilterEstado(e.target.value)}
                        className="pl-9 pr-8 py-2.5 bg-slate-50 border-none rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none min-w-[160px]"
                    >
                        <option value="">Estado: Todos</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="cancelada">Cancelada</option>
                        <option value="completada">Completada</option>
                    </select>
                </div>
            </div>

        </div>

        {/* TABLA DE RESERVAS */}
        <Card className="overflow-hidden border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Código</th>
                  <th className="text-left px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Vuelo</th>
                  <th className="text-left px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Ruta</th>
                  <th className="text-left px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Asiento</th>
                  <th className="text-left px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="text-left px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Estado</th>                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReservations.map((reservation) => (
                  <tr key={reservation._id} className="hover:bg-slate-50/80 transition-colors group">
                    
                    {/* Código */}
                    <td className="px-6 py-4">
                        <span className="font-mono text-sm font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                            {reservation.codigoReserva}
                        </span>
                        <p className="text-xs text-slate-400 mt-1">
                            {new Date(reservation.createdAt).toLocaleDateString()}
                        </p>
                    </td>

                    {/* Cliente */}
                    <td className="px-6 py-4">
                      {reservation.usuario ? (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                {reservation.usuario.nombre.charAt(0)}{reservation.usuario.apellido.charAt(0)}
                            </div>
                            <div>
                                <p className="font-medium text-slate-800 text-sm">
                                    {reservation.usuario.nombre} {reservation.usuario.apellido}
                                </p>
                                <p className="text-xs text-slate-500 max-w-[150px] truncate" title={reservation.usuario.email}>
                                    {reservation.usuario.email}
                                </p>
                            </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400 italic text-sm">
                            <User className="w-4 h-4" /> Usuario eliminado
                        </div>
                      )}
                    </td>

                    {/* Vuelo */}
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                      {reservation.vuelo?.numeroVuelo || 'N/A'}
                    </td>

                    {/* Ruta */}
                    <td className="px-6 py-4">
                      {reservation.vuelo ? (
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <span className="font-medium">{reservation.vuelo.origen.codigo}</span>
                            <span className="text-slate-300">→</span>
                            <span className="font-medium">{reservation.vuelo.destino.codigo}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">--</span>
                      )}
                    </td>

                    {/* Asiento */}
                    <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200">
                            {reservation.asiento?.numero || '?'}
                        </span>
                    </td>

                    {/* Precio */}
                    <td className="px-6 py-4 font-mono font-medium text-slate-700">
                      ${reservation.precioTotal.toLocaleString()}
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getStatusStyle(reservation.estado)}`}>
                        {reservation.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredReservations.length === 0 && (
            <div className="p-12 text-center text-slate-500">
                No se encontraron reservas con esos criterios.
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}