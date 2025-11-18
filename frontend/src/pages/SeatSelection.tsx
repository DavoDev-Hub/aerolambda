import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/flight/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { User, Mail, Phone, CreditCard, ArrowRight } from 'lucide-react';

interface Flight {
  _id: string;
  numeroVuelo: string;
  origen: { ciudad: string; codigo: string };
  destino: { ciudad: string; codigo: string };
  fechaSalida: string;
  horaSalida: string;
  duracion: string;
  precio: number;
}

interface Seat {
  _id: string;
  numero: string;
  fila: number;
  columna: string;
  tipo: string;
  estado: string;
}

export default function SeatSelection() {
  const { vueloId } = useParams();
  const navigate = useNavigate();
  
  const [flight, setFlight] = useState<Flight | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Datos del pasajero (pre-llenados desde el perfil)
  const [passengerData, setPassengerData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    tipoDocumento: 'INE' as 'INE' | 'Pasaporte',
    numeroDocumento: '',
  });

  // Cargar datos del usuario logueado
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setPassengerData(prev => ({
        ...prev,
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        telefono: user.telefono || '',
      }));
    }
  }, []);

useEffect(() => {
  const fetchData = async () => {
    try {
      // Cargar asientos
      const seatsResponse = await fetch(`/api/asientos/vuelo/${vueloId}`);
      const seatsData = await seatsResponse.json();

      if (seatsData.success) {
        setSeats(seatsData.data.asientos);
        
        // Extraer info básica del vuelo desde la respuesta de asientos
        const vueloBasico = seatsData.data.vuelo;
        
        // Cargar información completa del vuelo
        const flightResponse = await fetch(`/api/vuelos/buscar?origen=${vueloBasico.origen?.codigo || ''}&destino=${vueloBasico.destino?.codigo || ''}`);
        const flightData = await flightResponse.json();
        
        if (flightData.success && flightData.data.vuelos.length > 0) {
          // Buscar el vuelo específico por ID
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fullFlight = flightData.data.vuelos.find((v: any) => v._id === vueloId);
          if (fullFlight) {
            setFlight(fullFlight);
          } else {
            // Si no lo encuentra, usar el primer vuelo
            setFlight(flightData.data.vuelos[0]);
          }
        } else {
          // Fallback: construir objeto de vuelo básico
          setFlight({
            _id: vueloBasico.id,
            numeroVuelo: vueloBasico.numeroVuelo,
            origen: vueloBasico.origen,
            destino: vueloBasico.destino,
            fechaSalida: new Date().toISOString(),
            horaSalida: '00:00',
            duracion: '0h 0m',
            precio: 0
          });
        }
      }
    } catch (error) {
      console.error('Error loading flight data:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [vueloId]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.estado === 'disponible') {
      setSelectedSeat(seat);
    }
  };

  const getSeatColor = (seat: Seat) => {
    if (selectedSeat?._id === seat._id) return 'bg-blue-600 text-white';
    if (seat.estado === 'ocupado') return 'bg-gray-400 cursor-not-allowed';
    if (seat.estado === 'bloqueado') return 'bg-gray-300 cursor-not-allowed';
    return 'bg-gray-100 hover:bg-blue-100 cursor-pointer';
  };

  const handleContinue = async () => {
    if (!selectedSeat) {
      alert('Por favor selecciona un asiento');
      return;
    }

    // Validaciones
    if (!passengerData.nombre || !passengerData.apellido || !passengerData.email) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (!passengerData.numeroDocumento) {
      alert(`Por favor ingresa tu ${passengerData.tipoDocumento === 'INE' ? 'clave de elector' : 'número de pasaporte'}`);
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Debes iniciar sesión para continuar');
        navigate('/login');
        return;
      }

      const response = await fetch('/api/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          vueloId: flight?._id,
          asientoId: selectedSeat._id,
          pasajero: passengerData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        navigate(`/reservas/${data.data._id}/pago`);
      } else {
        alert(data.message || 'Error al crear la reserva');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Error al crear la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Cargando información del vuelo...</p>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <p className="text-red-500">Vuelo no encontrado</p>
        </div>
      </div>
    );
  }

  // Organizar asientos por fila
  const rows = Array.from(new Set(seats.map(s => s.fila))).sort((a, b) => a - b);
  const columns = ['A', 'B', 'C', 'D', 'E', 'F'];

return (
  <div className="min-h-screen bg-gray-50">
    <Header />

    {/* Información del vuelo */}
    {flight && (
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ruta</p>
              <p className="text-xl font-bold text-gray-900">
                {flight.origen?.codigo || 'N/A'} → {flight.destino?.codigo || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                {flight.origen?.ciudad || ''} a {flight.destino?.ciudad || ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha y Hora</p>
              <p className="text-lg font-semibold text-gray-900">
                {flight.fechaSalida ? new Date(flight.fechaSalida).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : 'N/A'}
              </p>
              <p className="text-sm text-gray-600">{flight.horaSalida || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duración</p>
              <p className="text-lg font-semibold text-gray-900">{flight.duracion || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Vuelo</p>
              <p className="text-lg font-semibold text-primary">{flight.numeroVuelo || 'N/A'}</p>
              <p className="text-lg font-bold text-gray-900">
                ${flight.precio ? flight.precio.toLocaleString() : '0'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Contenido principal */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className={`grid gap-8 transition-all duration-500 ${
        selectedSeat ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'
      }`}>
        {/* Mapa de asientos */}
        <div className={`transition-all duration-500 ${
          selectedSeat ? 'lg:col-span-2' : 'max-w-4xl mx-auto w-full'
        }`}>
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecciona tu asiento</h2>
            <p className="text-gray-600 mb-6">
              Vuelo desde {flight?.origen?.ciudad || 'N/A'} a {flight?.destino?.ciudad || 'N/A'}
            </p>

            {/* Leyenda */}
            <div className="flex items-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded border border-gray-300"></div>
                <span className="text-gray-700">Disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded"></div>
                <span className="text-gray-700">Seleccionado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-400 rounded"></div>
                <span className="text-gray-700">Ocupado</span>
              </div>
            </div>

            {/* Grid de asientos */}
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                <div></div>
                {columns.map(col => (
                  <div key={col} className="text-center font-semibold text-gray-700">
                    {col}
                  </div>
                ))}
              </div>

              {/* Filas */}
              {rows.map(row => (
                <div key={row} className="grid grid-cols-7 gap-2">
                  <div className="flex items-center justify-center font-semibold text-gray-700">
                    {row}
                  </div>
                  {columns.map(col => {
                    const seat = seats.find(s => s.fila === row && s.columna === col);
                    if (!seat) {
                      return <div key={`${row}-${col}`} className="w-full h-10"></div>;
                    }

                    // Pasillo entre C y D
                    if (col === 'D') {
                      return (
                        <div key={`${row}-${col}`} className="flex gap-2">
                          <div className="w-2"></div>
                          <button
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.estado !== 'disponible'}
                            className={`w-full h-10 rounded font-medium text-sm transition-colors ${getSeatColor(seat)}`}
                          >
                            {seat.numero}
                          </button>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={seat._id}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.estado !== 'disponible'}
                        className={`w-full h-10 rounded font-medium text-sm transition-colors ${getSeatColor(seat)}`}
                      >
                        {seat.numero}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Distribución: 3 asientos - pasillo - 3 asientos (A, B, C | pasillo | D, E, F)
            </p>

            {/* Mensaje cuando no hay asiento seleccionado */}
            {!selectedSeat && (
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-center font-medium">
                  👆 Selecciona un asiento para continuar
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Formulario de datos del pasajero - Solo aparece cuando hay asiento seleccionado */}
        {selectedSeat && (
          <div className="lg:col-span-1 animate-in slide-in-from-right duration-500">
            <Card className="p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Asiento {selectedSeat.numero}
                </h3>
                <button
                  onClick={() => setSelectedSeat(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Cancelar selección"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="nombre"
                      value={passengerData.nombre}
                      onChange={(e) => setPassengerData({ ...passengerData, nombre: e.target.value })}
                      className="pl-10"
                      placeholder="Juan"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="apellido">Apellido *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="apellido"
                      value={passengerData.apellido}
                      onChange={(e) => setPassengerData({ ...passengerData, apellido: e.target.value })}
                      className="pl-10"
                      placeholder="García"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={passengerData.email}
                      onChange={(e) => setPassengerData({ ...passengerData, email: e.target.value })}
                      className="pl-10"
                      placeholder="juan@email.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="telefono"
                      type="tel"
                      value={passengerData.telefono}
                      onChange={(e) => setPassengerData({ ...passengerData, telefono: e.target.value })}
                      className="pl-10"
                      placeholder="55 1234 5678"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tipoDocumento">Tipo de identificación *</Label>
                  <select
                    id="tipoDocumento"
                    value={passengerData.tipoDocumento}
                    onChange={(e) => setPassengerData({ ...passengerData, tipoDocumento: e.target.value as 'INE' | 'Pasaporte' })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="INE">INE (Credencial de Elector)</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="numeroDocumento">
                    {passengerData.tipoDocumento === 'INE' ? 'Clave de elector' : 'Número de pasaporte'} *
                  </Label>
                  <div className="relative mt-1">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="numeroDocumento"
                      value={passengerData.numeroDocumento}
                      onChange={(e) => setPassengerData({ ...passengerData, numeroDocumento: e.target.value })}
                      className="pl-10"
                      placeholder={passengerData.tipoDocumento === 'INE' ? 'ABCD123456789012' : 'M12345678'}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {passengerData.tipoDocumento === 'INE' 
                      ? 'La clave alfanumérica de 18 caracteres al reverso de tu INE'
                      : 'El número en la parte superior de tu pasaporte'}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Precio base</span>
                  <span className="font-semibold">
                    ${flight?.precio ? flight.precio.toLocaleString() : '0'}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Selección de asiento</span>
                  <span className="font-semibold text-green-600">Incluido</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-3 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-primary">
                    ${flight?.precio ? flight.precio.toLocaleString() : '0'}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleContinue}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? 'Procesando...' : (
                  <>
                    Continuar con el pago
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Los datos se auto-completaron desde tu perfil. Puedes modificarlos si es necesario.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  </div>
);
}