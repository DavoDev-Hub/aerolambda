import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Edit2, Trash2, Plane } from 'lucide-react';

interface Flight {
  _id: string;
  numeroVuelo: string;
  origen: { ciudad: string; codigo: string };
  destino: { ciudad: string; codigo: string };
  fechaSalida: string;
  horaSalida: string;
  duracion: string;
  precio: number;
  capacidadTotal: number;
  asientosDisponibles: number;
  estado: string;
}

export default function AdminFlights() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ origen: '', destino: '', estado: '' });

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
    };
    return labels[estado] || estado;
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Vuelos">
        <div className="p-8">
          <p>Cargando vuelos...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Vuelos">
      <div className="p-8 space-y-6">
        {/* Header con botón crear */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestión de Vuelos</h1>
          <Button className="bg-primary text-primary-foreground flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Crear Vuelo
          </Button>
        </div>

        {/* Filtros */}
        <Card className="p-4 flex gap-4">
          <input
            type="text"
            placeholder="Buscar vuelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
          />
          <select
            value={filters.origen}
            onChange={(e) => setFilters({ ...filters, origen: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Todos los orígenes</option>
            <option value="MEX">Ciudad de México</option>
            <option value="CUN">Cancún</option>
            <option value="GDL">Guadalajara</option>
            <option value="MTY">Monterrey</option>
          </select>
          <select
            value={filters.estado}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Todos los estados</option>
            <option value="programado">Programado</option>
            <option value="en_vuelo">En Vuelo</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </Card>

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
                {flights.map((flight) => (
                  <tr key={flight._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{flight.numeroVuelo}</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <Plane className="w-4 h-4" />
                      {flight.origen.codigo} → {flight.destino.codigo}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(flight.fechaSalida).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">{flight.horaSalida}</td>
                    <td className="px-6 py-4">{flight.duracion}</td>
                    <td className="px-6 py-4 font-semibold">${flight.precio.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${((flight.capacidadTotal - flight.asientosDisponibles) / flight.capacidadTotal) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm">
                          {flight.capacidadTotal - flight.asientosDisponibles}/{flight.capacidadTotal}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(flight.estado)}>
                        {getStatusLabel(flight.estado)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(flight._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {flights.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay vuelos disponibles</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}