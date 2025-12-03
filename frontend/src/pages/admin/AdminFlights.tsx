import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast'; // ← AGREGADO
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { API_BASE_URL } from "@/config/api";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Plane, 
  Search, 
  Filter, 
  Calendar, 
  MapPin,
  Clock,
  Users,
  Armchair
} from 'lucide-react';
import FlightModal, { Flight, FlightFormData } from '@/components/admin/FlightModal';
import SeatMapModal from '@/components/admin/SeatMapModal';

export default function AdminFlights() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ origen: '', destino: '', estado: '' });
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  
  // Seat map modal state
  const [isSeatMapOpen, setIsSeatMapOpen] = useState(false);
  const [seatMapFlight, setSeatMapFlight] = useState<Flight | null>(null);

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/vuelos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setFlights(data.data.vuelos || []);
      }
    } catch (error) {
      console.error('Error fetching flights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setModalMode('create');
    setSelectedFlight(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (flight: Flight) => {
    setModalMode('edit');
    setSelectedFlight(flight);
    setIsModalOpen(true);
  };

  const handleViewSeats = (flight: Flight) => {
    setSeatMapFlight(flight);
    setIsSeatMapOpen(true);
  };

  // ✅ FUNCIÓN CORREGIDA - Sin alert() y sin cerrar modal en error
  const handleSaveFlight = async (flightData: FlightFormData) => {
    try {
      const token = localStorage.getItem('token');
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      const url = modalMode === 'create' ? `${API_BASE_URL}/api/vuelos` : `${API_BASE_URL}/api/vuelos/${selectedFlight?._id}`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(flightData)
      });

      const data = await response.json();
      
      // ✅ Verificar respuesta del servidor
      if (!response.ok || !data.success) {
        // Re-lanzar error para que FlightModal lo maneje
        throw new Error(data.message || 'Error al guardar el vuelo');
      }

      // ✅ Actualizar lista solo si fue exitoso
      await fetchFlights();
      
      // ⚠️ NO cerrar modal aquí - FlightModal lo hace automáticamente
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error:', error);
      // ✅ Re-lanzar el error para que FlightModal lo maneje con toast
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este vuelo? Todas las reservas asociadas serán canceladas.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/vuelos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        fetchFlights();
      } else {
        alert(data.message || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el vuelo');
    }
  };

  const filteredFlights = flights.filter((flight) => {
    const matchesSearch = 
      flight.numeroVuelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.origen.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.destino.ciudad.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOrigen = !filters.origen || flight.origen.codigo === filters.origen;
    const matchesEstado = !filters.estado || flight.estado === filters.estado;

    return matchesSearch && matchesOrigen && matchesEstado;
  });

  const getStatusStyle = (estado: string) => {
    switch (estado) {
      case 'programado': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'en_vuelo': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completado': return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'cancelado': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const stats = {
    total: flights.length,
    programados: flights.filter(f => f.estado === 'programado').length,
    enVuelo: flights.filter(f => f.estado === 'en_vuelo').length,
    completados: flights.filter(f => f.estado === 'completado').length
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Gestión de Vuelos">
        <div className="space-y-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Gestión de Vuelos">
      {/* ✅ TOASTER AGREGADO AQUÍ */}
      <Toaster position="top-right" />
      
      <div className="space-y-6">
        
        {/* Header con Stats */}
        <div>
          <p className="text-slate-500">Administra todos los vuelos disponibles</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Vuelos</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Plane className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="bg-white p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Programados</p>
                <h3 className="text-3xl font-bold text-emerald-600 mt-1">{stats.programados}</h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="bg-white p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">En Vuelo</p>
                <h3 className="text-3xl font-bold text-blue-600 mt-1">{stats.enVuelo}</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Plane className="w-6 h-6 text-blue-600 animate-pulse" />
              </div>
            </div>
          </Card>

          <Card className="bg-white p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Completados</p>
                <h3 className="text-3xl font-bold text-slate-600 mt-1">{stats.completados}</h3>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <Users className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Búsqueda y Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar vuelo, origen o destino..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        value={filters.origen}
                        onChange={(e) => setFilters({ ...filters, origen: e.target.value })}
                        className="pl-9 pr-8 py-2.5 bg-slate-50 border-none rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none min-w-[140px]"
                    >
                        <option value="">Origen: Todos</option>
                        {Array.from(new Set(flights.map(f => f.origen.codigo))).map(codigo => (
                            <option key={codigo} value={codigo}>{codigo}</option>
                        ))}
                    </select>
                </div>

                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        value={filters.estado}
                        onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                        className="pl-9 pr-8 py-2.5 bg-slate-50 border-none rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none min-w-[140px]"
                    >
                        <option value="">Estado: Todos</option>
                        <option value="programado">Programado</option>
                        <option value="en_vuelo">En Vuelo</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>
            </div>

            <Button 
                onClick={handleCreateClick}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all flex items-center gap-2 px-6 py-2.5 h-auto rounded-lg font-semibold"
            >
                <Plus className="w-5 h-5" />
                Nuevo Vuelo
            </Button>
        </div>

        {/* TABLA DE DATOS */}
        <Card className="overflow-hidden border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Vuelo</th>
                  <th className="text-left px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Ruta</th>
                  <th className="text-left px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Horario</th>
                  <th className="text-left px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Ocupación</th>
                  <th className="text-left px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Precio</th>
                  <th className="text-center px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFlights.map((flight) => {
                    const occupation = Math.round(((flight.capacidadTotal - flight.asientosDisponibles) / flight.capacidadTotal) * 100);
                    
                    return (
                    <tr key={flight._id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Vuelo */}
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded bg-blue-50 text-blue-600">
                                    <Plane className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-slate-800">{flight.numeroVuelo}</span>
                            </div>
                        </td>

                        {/* Ruta */}
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                                <span>{flight.origen.codigo}</span>
                                <span className="text-slate-300">→</span>
                                <span>{flight.destino.codigo}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 max-w-[150px] truncate">
                                {flight.origen.ciudad} a {flight.destino.ciudad}
                            </p>
                        </td>

                        {/* Horario */}
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    {flight.horaSalida}
                                </div>
                                <span className="text-xs text-slate-400 ml-5">
                                    {new Date(flight.fechaSalida).toLocaleDateString('es-MX', {day: 'numeric', month: 'short'})}
                                </span>
                            </div>
                        </td>

                        {/* Ocupación */}
                        <td className="px-6 py-4 min-w-[140px]">
                            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-1.5 overflow-hidden">
                                <div
                                    className={`h-2.5 rounded-full transition-all duration-500 ${
                                        occupation > 90 ? 'bg-red-500' : occupation > 60 ? 'bg-blue-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${occupation}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-medium text-slate-700">{occupation}% lleno</span>
                                <span className="text-slate-400">{flight.capacidadTotal - flight.asientosDisponibles}/{flight.capacidadTotal}</span>
                            </div>
                        </td>

                        {/* Estado */}
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(flight.estado)}`}>
                                {flight.estado.charAt(0).toUpperCase() + flight.estado.slice(1).replace('_', ' ')}
                            </span>
                        </td>

                        {/* Precio */}
                        <td className="px-6 py-4">
                            <span className="font-mono font-semibold text-slate-700">
                                ${flight.precio.toLocaleString()}
                            </span>
                        </td>

                        {/* Acciones */}
                        <td className="px-6 py-4">
                            <div className="flex justify-center items-center gap-2">
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleViewSeats(flight)}
                                    className="h-9 w-9 p-0 flex items-center justify-center border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                    title="Ver asientos"
                                >
                                    <Armchair className="w-4 h-4" />
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleEditClick(flight)}
                                    className="h-9 w-9 p-0 flex items-center justify-center border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDelete(flight._id)}
                                    className="h-9 w-9 p-0 flex items-center justify-center border-slate-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                    title="Eliminar"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </td>
                    </tr>
                    );
                })}
              </tbody>
            </table>

            {filteredFlights.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500">No se encontraron vuelos</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Modal de Crear/Editar */}
      <FlightModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFlight}
        flight={selectedFlight}
        mode={modalMode}
      />

      {/* Modal de Mapa de Asientos */}
      {seatMapFlight && (
        <SeatMapModal
          isOpen={isSeatMapOpen}
          onClose={() => setIsSeatMapOpen(false)}
          vueloId={seatMapFlight._id}
          numeroVuelo={seatMapFlight.numeroVuelo}
          origen={seatMapFlight.origen.codigo}
          destino={seatMapFlight.destino.codigo}
        />
      )}
    </AdminLayout>
  );
}