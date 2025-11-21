import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Edit2, Trash2, Plane } from 'lucide-react';
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
      
      if (modalMode === 'create') {
        // Crear nuevo vuelo
        const response = await fetch('/api/vuelos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(flightData)
        });

        const data = await response.json();
        
        if (data.success) {
          alert('Vuelo creado exitosamente');
          fetchFlights();
        } else {
          alert(data.message || 'Error al crear vuelo');
        }
      } else {
        // Editar vuelo existente
        const response = await fetch(`/api/vuelos/${selectedFlight?._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(flightData)
        });

        const data = await response.json();
        
        if (data.success) {
          alert('Vuelo actualizado exitosamente');
          fetchFlights();
        } else {
          alert(data.message || 'Error al actualizar vuelo');
        }
      }
    } catch (error) {
      console.error('Error saving flight:', error);
      alert('Error al guardar el vuelo');
      throw error;
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
        alert('Vuelo eliminado exitosamente');
        fetchFlights();
      } else {
        alert(data.message || 'Error al eliminar vuelo');
      }
    } catch (error) {
      console.error('Error deleting flight:', error);
      alert('Error al eliminar vuelo');
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'programado':
        return 'bg-green-100 text-green-800';
      case 'en_vuelo':
        return 'bg-blue-100 text-blue-800';
      case 'completado':
        return 'bg-gray-100 text-gray-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      case 'retrasado':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (estado: string) => {
    const labels: Record<string, string> = {
      'programado': 'Programado',
      'en_vuelo': 'En Vuelo',
      'completado': 'Completado',
      'cancelado': 'Cancelado',
      'retrasado': 'Retrasado',
    };
    return labels[estado] || estado;
  };

  // Filtrar vuelos
  const filteredFlights = flights.filter(flight => {
    const matchesSearch = flight.numeroVuelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flight.origen.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flight.destino.ciudad.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOrigen = !filters.origen || flight.origen.codigo === filters.origen;
    const matchesEstado = !filters.estado || flight.estado === filters.estado;

    return matchesSearch && matchesOrigen && matchesEstado;
  });

  if (loading) {
    return (
      <AdminLayout pageTitle="Vuelos">
        <div className="p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando vuelos...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Vuelos">
      <div className="p-8 space-y-6">
        {/* Header con botón crear */}
        <div className="flex items-center justify-between">
          <Button 
            onClick={handleCreateClick}
            className="bg-primary text-primary-foreground flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Crear Vuelo
          </Button>
        </div>

        {/* Filtros */}
        <Card className="p-4 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Buscar vuelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <select
            value={filters.origen}
            onChange={(e) => setFilters({ ...filters, origen: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">Todos los orígenes</option>
            <option value="MEX">Ciudad de México</option>
            <option value="CUN">Cancún</option>
            <option value="GDL">Guadalajara</option>
            <option value="MTY">Monterrey</option>
            <option value="TIJ">Tijuana</option>
            <option value="SJD">Los Cabos</option>
            <option value="PVR">Puerto Vallarta</option>
            <option value="MZT">Mazatlán</option>
          </select>
          <select
            value={filters.estado}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">Todos los estados</option>
            <option value="programado">Programado</option>
            <option value="en_vuelo">En Vuelo</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
            <option value="retrasado">Retrasado</option>
          </select>
        </Card>

        {/* Stats rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Total Vuelos</p>
            <p className="text-2xl font-bold text-gray-900">{flights.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Programados</p>
            <p className="text-2xl font-bold text-green-600">
              {flights.filter(f => f.estado === 'programado').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">En Vuelo</p>
            <p className="text-2xl font-bold text-blue-600">
              {flights.filter(f => f.estado === 'en_vuelo').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Completados</p>
            <p className="text-2xl font-bold text-gray-600">
              {flights.filter(f => f.estado === 'completado').length}
            </p>
          </Card>
        </div>

        {/* Tabla de vuelos */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">Vuelo</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">Ruta</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">Salida</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">Hora</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">Duración</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">Precio</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">Asientos</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">Estado</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredFlights.map((flight) => (
                  <tr key={flight._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{flight.numeroVuelo}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{flight.origen.codigo} → {flight.destino.codigo}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {flight.origen.ciudad} a {flight.destino.ciudad}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(flight.fechaSalida).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium">{flight.horaSalida}</td>
                    <td className="px-6 py-4 text-gray-600">{flight.duracion}</td>
                    <td className="px-6 py-4 font-semibold text-primary">${flight.precio.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{
                              width: `${((flight.capacidadTotal - flight.asientosDisponibles) / flight.capacidadTotal) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {flight.asientosDisponibles}/{flight.capacidadTotal}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(flight.estado)}>
                        {getStatusLabel(flight.estado)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditClick(flight)}
                          className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 hover:border-red-600"
                          onClick={() => handleDelete(flight._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {filteredFlights.length === 0 && (
          <div className="text-center py-12">
            <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              {searchTerm || filters.origen || filters.estado 
                ? 'No se encontraron vuelos con esos filtros' 
                : 'No hay vuelos disponibles'}
            </p>
            <p className="text-gray-400 text-sm">
              {flights.length === 0 && 'Crea tu primer vuelo usando el botón "Crear Vuelo"'}
            </p>
          </div>
        )}
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