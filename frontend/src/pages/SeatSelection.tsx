import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/flight/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {ArrowRight, Users, X } from 'lucide-react';

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

interface PassengerData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  tipoDocumento: 'INE' | 'Pasaporte';
  numeroDocumento: string;
}

export default function SeatSelection() {
  const { vueloId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [flight, setFlight] = useState<Flight | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Obtener número de pasajeros desde la navegación (viene de la búsqueda)
  const numPasajeros = (location.state?.numPasajeros as number) || 1;

  // Datos de los pasajeros (array)
  const [passengersData, setPassengersData] = useState<PassengerData[]>([]);

  // Cargar datos del usuario logueado para el primer pasajero
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const initialPassengers: PassengerData[] = [];

    for (let i = 0; i < numPasajeros; i++) {
      if (i === 0 && userStr) {
        // Primer pasajero: datos del usuario logueado
        const user = JSON.parse(userStr);
        initialPassengers.push({
          nombre: user.nombre || '',
          apellido: user.apellido || '',
          email: user.email || '',
          telefono: user.telefono || '',
          tipoDocumento: 'INE',
          numeroDocumento: '',
        });
      } else {
        // Resto: vacío
        initialPassengers.push({
          nombre: '',
          apellido: '',
          email: '',
          telefono: '',
          tipoDocumento: 'INE',
          numeroDocumento: '',
        });
      }
    }

    setPassengersData(initialPassengers);
  }, [numPasajeros]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const seatsResponse = await fetch(`/api/asientos/vuelo/${vueloId}`);
        const seatsData = await seatsResponse.json();

        if (seatsData.success) {
          setSeats(seatsData.data.asientos);
          
          const vueloBasico = seatsData.data.vuelo;
          
          const flightResponse = await fetch(`/api/vuelos/buscar?origen=${vueloBasico.origen?.codigo || ''}&destino=${vueloBasico.destino?.codigo || ''}`);
          const flightData = await flightResponse.json();
          
          if (flightData.success && flightData.data.vuelos.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fullFlight = flightData.data.vuelos.find((v: any) => v._id === vueloId);
            if (fullFlight) {
              setFlight(fullFlight);
            } else {
              setFlight(flightData.data.vuelos[0]);
            }
          } else {
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
    if (seat.estado !== 'disponible') return;

    // Si el asiento ya está seleccionado, quitarlo
    if (selectedSeats.find(s => s._id === seat._id)) {
      setSelectedSeats(selectedSeats.filter(s => s._id !== seat._id));
      return;
    }

    // Si ya tiene el máximo de asientos, no agregar más
    if (selectedSeats.length >= numPasajeros) {
      alert(`Solo puedes seleccionar ${numPasajeros} asiento${numPasajeros > 1 ? 's' : ''}`);
      return;
    }

    // Agregar asiento
    setSelectedSeats([...selectedSeats, seat]);
  };

  const removeSeat = (seatId: string) => {
    setSelectedSeats(selectedSeats.filter(s => s._id !== seatId));
  };

  const getSeatColor = (seat: Seat) => {
    if (selectedSeats.find(s => s._id === seat._id)) return 'bg-blue-600 text-white';
    if (seat.estado === 'ocupado') return 'bg-gray-400 cursor-not-allowed';
    if (seat.estado === 'bloqueado') return 'bg-gray-300 cursor-not-allowed';
    return 'bg-gray-100 hover:bg-blue-100 cursor-pointer';
  };

  const updatePassengerData = (index: number, field: keyof PassengerData, value: string) => {
    const newData = [...passengersData];
    newData[index] = { ...newData[index], [field]: value };
    setPassengersData(newData);
  };
const handleContinue = async () => {
  if (selectedSeats.length !== numPasajeros) {
    alert(`Debes seleccionar ${numPasajeros} asiento${numPasajeros > 1 ? 's' : ''}`);
    return;
  }

  // Validar datos de todos los pasajeros
  for (let i = 0; i < passengersData.length; i++) {
    const passenger = passengersData[i];
    if (!passenger.nombre || !passenger.apellido || !passenger.email) {
      alert(`Por favor completa todos los campos del pasajero ${i + 1}`);
      return;
    }
    if (!passenger.numeroDocumento) {
      alert(`Por favor ingresa el documento del pasajero ${i + 1}`);
      return;
    }
  }

  setSubmitting(true);

  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Debes iniciar sesión para continuar');
      navigate('/login');
      return;
    }

    // Preparar el payload según el número de pasajeros
    const payload = numPasajeros === 1 
      ? {
          // Reserva simple
          vueloId: flight?._id,
          asientoId: selectedSeats[0]._id,
          pasajero: passengersData[0],
        }
      : {
          // Reserva múltiple
          vueloId: flight?._id,
          asientos: selectedSeats.map(seat => seat._id),
          pasajeros: passengersData,
        };

    const response = await fetch('/api/reservas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.success) {
      // Navegar al pago con el ID de la primera reserva
      const reservaId = data.data._id || data.data.reservas?.[0]._id;
      navigate(`/reservas/${reservaId}/pago`, {
        state: { 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          reservaIds: data.data.reservas?.map((r: any) => r._id) || [reservaId],
          precioTotal: data.data.precioTotal || flight?.precio
        }
      });
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

  const rows = Array.from(new Set(seats.map(s => s.fila))).sort((a, b) => a - b);
  const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
  const precioTotal = (flight.precio || 0) * selectedSeats.length;

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
                <p className="text-sm text-gray-500">Pasajeros</p>
                <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {numPasajeros}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vuelo</p>
                <p className="text-lg font-semibold text-primary">{flight.numeroVuelo || 'N/A'}</p>
                <p className="text-lg font-bold text-gray-900">
                  ${flight.precio ? flight.precio.toLocaleString() : '0'} x {numPasajeros}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`grid gap-8 transition-all duration-500 ${
          selectedSeats.length > 0 ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'
        }`}>
          {/* Mapa de asientos */}
          <div className={`transition-all duration-500 ${
            selectedSeats.length > 0 ? 'lg:col-span-2' : 'max-w-4xl mx-auto w-full'
          }`}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Selecciona tus asientos</h2>
                  <p className="text-gray-600">
                    {selectedSeats.length} de {numPasajeros} asiento{numPasajeros > 1 ? 's' : ''} seleccionado{numPasajeros > 1 ? 's' : ''}
                  </p>
                </div>
                
                {/* Asientos seleccionados */}
                {selectedSeats.length > 0 && (
                  <div className="flex gap-2">
                    {selectedSeats.map((seat) => (
                      <div
                        key={seat._id}
                        className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {seat.numero}
                        <button
                          onClick={() => removeSeat(seat._id)}
                          className="hover:text-blue-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
                <div className="grid grid-cols-7 gap-2 mb-4">
                  <div></div>
                  {columns.map(col => (
                    <div key={col} className="text-center font-semibold text-gray-700">
                      {col}
                    </div>
                  ))}
                </div>

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

              {selectedSeats.length === 0 && (
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-center font-medium">
                    👆 Selecciona {numPasajeros} asiento{numPasajeros > 1 ? 's' : ''} para continuar
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Formulario de pasajeros */}
          {selectedSeats.length > 0 && (
            <div className="lg:col-span-1 space-y-4">
              {passengersData.map((passenger, index) => (
                <Card key={index} className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Pasajero {index + 1} - Asiento {selectedSeats[index]?.numero || '...'}
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`nombre-${index}`} className="text-sm">Nombre *</Label>
                      <Input
                        id={`nombre-${index}`}
                        value={passenger.nombre}
                        onChange={(e) => updatePassengerData(index, 'nombre', e.target.value)}
                        placeholder="Juan"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`apellido-${index}`} className="text-sm">Apellido *</Label>
                      <Input
                        id={`apellido-${index}`}
                        value={passenger.apellido}
                        onChange={(e) => updatePassengerData(index, 'apellido', e.target.value)}
                        placeholder="García"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`email-${index}`} className="text-sm">Email *</Label>
                      <Input
                        id={`email-${index}`}
                        type="email"
                        value={passenger.email}
                        onChange={(e) => updatePassengerData(index, 'email', e.target.value)} 
                        placeholder="juan@email.com"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`tipoDocumento-${index}`} className="text-sm">ID *</Label>
                      <select
                        id={`tipoDocumento-${index}`}
                        value={passenger.tipoDocumento}
                        onChange={(e) => updatePassengerData(index, 'tipoDocumento', e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="INE">INE</option>
                        <option value="Pasaporte">Pasaporte</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor={`numeroDocumento-${index}`} className="text-sm">
                        {passenger.tipoDocumento === 'INE' ? 'Clave elector' : 'No. Pasaporte'} *
                      </Label>
                      <Input
                        id={`numeroDocumento-${index}`}
                        value={passenger.numeroDocumento}
                        onChange={(e) => updatePassengerData(index, 'numeroDocumento', e.target.value)}
                        placeholder={passenger.tipoDocumento === 'INE' ? 'ABCD123456' : 'M12345678'}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </Card>
              ))}

              {/* Resumen y pago */}
              <Card className="p-6 sticky top-24">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Precio por asiento</span>
                    <span className="font-semibold">${flight.precio.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Asientos seleccionados</span>
                    <span className="font-semibold">{selectedSeats.length}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t">
                    <span>Total</span>
                    <span className="text-primary">${precioTotal.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  onClick={handleContinue}
                  disabled={submitting || selectedSeats.length !== numPasajeros}
                  className="w-full mt-4"
                >
                  {submitting ? 'Procesando...' : (
                    <>
                      Continuar con el pago
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}