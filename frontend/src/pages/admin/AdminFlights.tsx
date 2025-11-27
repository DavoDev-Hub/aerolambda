import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
  Users
} from 'lucide-react';
import FlightModal, { Flight, FlightFormData } from '@/components/admin/FlightModal';

export default function AdminFlights() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ origen: '', destino: '', estado: '' });
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/vuelos', {
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

  const handleSaveFlight = async (flightData: FlightFormData) => {
    try {
      const token = localStorage.getItem('token');
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      const url = modalMode === 'create' ? '/api/vuelos' : `/api/vuelos/${selectedFlight?._id}`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(flightData)
      });

      const data = await response.json();
      
      if (data.success) {
        fetchFlights();
      } else {
        alert(data.message || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el vuelo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este vuelo?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/vuelos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        fetchFlights();
      }
    } catch (error) {
      console.error('Error deleting flight:', error);
    }
  };

  const getStatusStyle = (estado: string) => {
    switch (estado) {
      case 'programado': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'en_vuelo': return 'bg-emerald-100 text-emerald-700 border-emerald-200 animate-pulse';
      case 'completado': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'cancelado': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'retrasado': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredFlights = flights.filter(flight => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = flight.numeroVuelo.toLowerCase().includes(term) ||
                         flight.origen.ciudad.toLowerCase().includes(term) ||
                         flight.destino.ciudad.toLowerCase().includes(term);
    
    const matchesOrigen = !filters.origen || flight.origen.codigo === filters.origen;
    const matchesEstado = !filters.estado || flight.estado === filters.estado;

    return matchesSearch && matchesOrigen && matchesEstado;
  });

  // Calculamos stats rápidos basados en los datos cargados
  const stats = {
    total: flights.length,
    programados: flights.filter(f => f.estado === 'programado').length,
    enVuelo: flights.filter(f => f.estado === 'en_vuelo').length,
    completados: flights.filter(f => f.estado === 'completado').length
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Vuelos">
        <div className="flex items-center justify-center h-full text-slate-500">Cargando vuelos...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Gestión de Vuelos">
      <div className="space-y-6">
        
        {/* TOP BAR: Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 flex items-center gap-4 border-l-4 border-l-blue-500 shadow-sm">
                <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                    <Plane className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm text-slate-500 font-medium">Total Vuelos</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                </div>
            </Card>
            <Card className="p-4 flex items-center gap-4 border-l-4 border-l-emerald-500 shadow-sm">
                <div className="p-3 rounded-full bg-emerald-50 text-emerald-600">
                    <Calendar className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm text-slate-500 font-medium">Programados</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.programados}</p>
                </div>
            </Card>
            <Card className="p-4 flex items-center gap-4 border-l-4 border-l-indigo-500 shadow-sm">
                <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
                    <Plane className="w-5 h-5 transform -rotate-45" />
                </div>
                <div>
                    <p className="text-sm text-slate-500 font-medium">En Vuelo</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.enVuelo}</p>
                </div>
            </Card>
            <Card className="p-4 flex items-center gap-4 border-l-4 border-l-slate-500 shadow-sm">
                <div className="p-3 rounded-full bg-slate-50 text-slate-600">
                    <Users className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm text-slate-500 font-medium">Completados</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.completados}</p>
                </div>
            </Card>
        </div>

        {/* TOOLBAR: Buscador y Botón */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            {/* Buscador y Filtros */}
            <div className="flex flex-1 gap-3 w-full md:w-auto overflow-x-auto">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por vuelo o ciudad..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>
                
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        value={filters.origen}
                        onChange={(e) => setFilters({ ...filters, origen: e.target.value })}
                        className="pl-9 pr-8 py-2.5 bg-slate-50 border-none rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none min-w-[140px]"
                    >
                        <option value="">Origen: Todos</option>
                        <option value="MEX">CDMX (MEX)</option>
                        <option value="CUN">Cancún (CUN)</option>
                        <option value="GDL">Guadalajara</option>
                        <option value="MTY">Monterrey</option>
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

            {/* Acción Principal */}
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
                  <th className="text-right px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFlights.map((flight) => {
                    const occupation = Math.round(((flight.capacidadTotal - flight.asientosDisponibles) / flight.capacidadTotal) * 100);
                    
                    return (
                    <tr key={flight._id} className="hover:bg-slate-50/80 transition-colors group">
                        
                        {/* Vuelo */}
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
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
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleEditClick(flight)}
                                    className="h-8 w-8 p-0 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                                    title="Editar"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDelete(flight._id)}
                                    className="h-8 w-8 p-0 border-slate-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 rounded-lg"
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
          </div>
          
          {filteredFlights.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                  No se encontraron vuelos que coincidan con los filtros.
              </div>
          )}
        </Card>
      </div>

      {/* Modal */}
      <FlightModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFlight}
        flight={selectedFlight}
        mode={modalMode}
      />
    </AdminLayout>
  );
}