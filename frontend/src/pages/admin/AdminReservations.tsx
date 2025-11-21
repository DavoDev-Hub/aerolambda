import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Eye } from 'lucide-react';

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

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reservas/todas', {
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

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'confirmada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      case 'completada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (estado: string) => {
    const labels: Record<string, string> = {
      'confirmada': 'Confirmada',
      'pendiente': 'Pendiente',
      'cancelada': 'Cancelada',
      'completada': 'Completada',
    };
    return labels[estado] || estado;
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Reservas">
        <div className="p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando reservas...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Reservas">
      <div className="p-8 space-y-6">
        {/* Stats rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Total Reservas</p>
            <p className="text-2xl font-bold text-gray-900">{reservations.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Confirmadas</p>
            <p className="text-2xl font-bold text-green-600">
              {reservations.filter(r => r.estado === 'confirmada').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600">
              {reservations.filter(r => r.estado === 'pendiente').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Canceladas</p>
            <p className="text-2xl font-bold text-red-600">
              {reservations.filter(r => r.estado === 'cancelada').length}
            </p>
          </Card>
        </div>

        {/* Tabla de reservas */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">Código</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">Cliente</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">Vuelo</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">Ruta</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">Pasajero</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">Asiento</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">Precio</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">Estado</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900 font-mono text-sm">
                      {reservation.codigoReserva}
                    </td>
                    <td className="px-6 py-4">
                      {reservation.usuario ? (
                        <div>
                          <p className="font-medium text-gray-900">
                            {reservation.usuario.nombre} {reservation.usuario.apellido}
                          </p>
                          <p className="text-xs text-gray-500">{reservation.usuario.email}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">Usuario eliminado</p>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {reservation.vuelo?.numeroVuelo || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {reservation.vuelo ? (
                        <span>{reservation.vuelo.origen.codigo} → {reservation.vuelo.destino.codigo}</span>
                      ) : (
                        <span className="text-gray-400">Vuelo eliminado</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {reservation.pasajero.nombre} {reservation.pasajero.apellido}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {reservation.asiento?.numero || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      ${reservation.precioTotal.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(reservation.estado)}>
                        {getStatusLabel(reservation.estado)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          // TODO: Implementar modal de detalles
                          alert(`Ver detalles de reserva: ${reservation.codigoReserva}`);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {reservations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay reservas disponibles</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}