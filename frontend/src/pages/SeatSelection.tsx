import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/flight/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ArrowRight, Check, ChevronLeft, Armchair, CreditCard, Luggage } from 'lucide-react';
// --- Interfaces (Misma lógica) ---
interface Flight {
  _id: string;
  numeroVuelo: string;
  origen: { ciudad: string; codigo: string; aeropuerto: string };
  destino: { ciudad: string; codigo: string; aeropuerto: string };
  fechaSalida: string;
  horaSalida: string;
  duracion: string;
  precio: number;
  equipaje?: {
    mano: {
      permitido: boolean;
      peso: number;
      dimensiones: string;
    };
    documentado: {
      permitido: boolean;
      peso: number;
      piezas: number;
      precioExtra: number;
    };
  };
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
  
  // Estados de datos
  const [flight, setFlight] = useState<Flight | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  
  // Estados de pasajeros
  const [passengersData, setPassengersData] = useState<PassengerData[]>([]);

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // 1: Selección de Asientos, 2: Datos de Pasajeros

  const numPasajeros = (location.state?.numPasajeros as number) || 1;

  // --- LÓGICA (Intacta) ---
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const initialPassengers: PassengerData[] = [];

    for (let i = 0; i < numPasajeros; i++) {
      if (i === 0 && userStr) {
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
          
          // Intentar obtener más detalles del vuelo si es necesario
          // (Aquí simplificamos manteniendo la lógica original)
          const flightResponse = await fetch(`/api/vuelos/buscar?origen=${vueloBasico.origen?.codigo || ''}&destino=${vueloBasico.destino?.codigo || ''}`);
          const flightData = await flightResponse.json();
          
          if (flightData.success && flightData.data.vuelos.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fullFlight = flightData.data.vuelos.find((v: any) => v._id === vueloId);
            setFlight(fullFlight || flightData.data.vuelos[0]);
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
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [vueloId]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.estado !== 'disponible') return;

    if (selectedSeats.find(s => s._id === seat._id)) {
      setSelectedSeats(selectedSeats.filter(s => s._id !== seat._id));
      return;
    }

    if (selectedSeats.length >= numPasajeros) {
      // Pequeña animación de "error" o alerta podría ir aquí
      return;
    }
    setSelectedSeats([...selectedSeats, seat]);
  };

  const removeSeat = (seatId: string) => {
    setSelectedSeats(selectedSeats.filter(s => s._id !== seatId));
    if (step === 2) setStep(1); // Si borra asiento en paso 2, volver al 1
  };

  const updatePassengerData = (index: number, field: keyof PassengerData, value: string) => {
    const newData = [...passengersData];
    newData[index] = { ...newData[index], [field]: value };
    setPassengersData(newData);
  };

  const handleContinue = async () => {
    // Validaciones finales
    if (selectedSeats.length !== numPasajeros) return;

    for (let i = 0; i < passengersData.length; i++) {
      const passenger = passengersData[i];
      if (!passenger.nombre || !passenger.apellido || !passenger.email || !passenger.numeroDocumento) {
        alert(`Por favor completa todos los campos del pasajero ${i + 1}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const payload = numPasajeros === 1 
        ? { vueloId: flight?._id, asientoId: selectedSeats[0]._id, pasajero: passengersData[0] }
        : { vueloId: flight?._id, asientos: selectedSeats.map(seat => seat._id), pasajeros: passengersData };

      const response = await fetch('/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
         
        const reservaId = data.data._id || data.data.reservas?.[0]._id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reservaIds = data.data.reservas?.map((r: any) => r._id) || [reservaId];
        
        navigate(`/reservas/${reservaId}/pago`, {
          state: { reservaIds, precioTotal: data.data.precioTotal || flight?.precio }
        });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Error al crear reserva');
    } finally {
      setSubmitting(false);
    }
  };

  // --- HELPERS VISUALES ---
  const getSeatStyle = (seat: Seat) => {
    const isSelected = selectedSeats.find(s => s._id === seat._id);
    
    if (isSelected) return 'bg-primary text-white border-primary shadow-md scale-105 ring-2 ring-blue-200';
    if (seat.estado === 'ocupado') return 'bg-slate-200 text-slate-400 cursor-not-allowed';
    if (seat.estado === 'bloqueado') return 'bg-slate-200 text-slate-400 cursor-not-allowed';
    
    return 'bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary cursor-pointer hover:shadow-sm';
  };

  const rows = Array.from(new Set(seats.map(s => s.fila))).sort((a, b) => a - b);
  const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
  const precioTotal = (flight?.precio || 0) * numPasajeros;

  // --- RENDER ---
  if (loading || !flight) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />

      {/* Header de Progreso */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Ruta y Pasos */}
            <div className="flex items-center gap-6">
              {step === 2 && (
                <button 
                  onClick={() => setStep(1)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <span className={step === 1 ? 'font-bold text-primary' : ''}>1. Asientos</span>
                  <span className="text-gray-300">/</span>
                  <span className={step === 2 ? 'font-bold text-primary' : ''}>2. Pasajeros</span>
                  <span className="text-gray-300">/</span>
                  <span>3. Pago</span>
                </div>
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  {flight.origen.codigo} <ArrowRight className="w-4 h-4 text-gray-400" /> {flight.destino.codigo}
                </h1>
              </div>
            </div>

            {/* Resumen de Precio Rápido */}
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500">Total estimado</p>
              <p className="text-xl font-bold text-primary">${precioTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8">
        <AnimatePresence mode='wait'>
          
          {/* --- PASO 1: SELECCIÓN DE ASIENTOS --- */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col lg:flex-row gap-8 items-start"
            >
              {/* Contenedor del Mapa (Forma de Avión) */}
              <div className="flex-1 w-full">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Selecciona tus asientos</h2>
                  <p className="text-gray-500">
                    Selecciona {numPasajeros} {numPasajeros > 1 ? 'asientos' : 'asiento'} en el mapa
                  </p>
                </div>

                {/* Fuselaje */}
                <div className="bg-white rounded-[3rem] rounded-b-[2rem] shadow-xl border border-gray-200 p-8 pb-16 max-w-md mx-auto relative overflow-hidden">
                  {/* Cabina decorativa */}
                  <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100 rounded-t-[3rem] flex justify-center pt-6">
                      <div className="w-16 h-1 bg-gray-200 rounded-full"></div>
                  </div>

                  <div className="mt-20">
                    {/* Guía de Columnas */}
                    <div className="grid grid-cols-7 gap-2 mb-4 px-4 text-xs font-bold text-gray-400 text-center">
                      <div></div>
                      {columns.map(col => <div key={col}>{col}</div>)}
                    </div>

                    {/* Grid de Asientos */}
                    <div className="space-y-2 px-4">
                      {rows.map(row => (
                        <div key={row} className="grid grid-cols-7 gap-2 items-center">
                          <span className="text-xs font-bold text-gray-400 text-center">{row}</span>
                          {columns.map(col => {
                            const seat = seats.find(s => s.fila === row && s.columna === col);
                            if (!seat) return <div key={`${row}-${col}`} />;
                            
                            // Pasillo
                            if (col === 'D') {
                              return (
                                <div key={`${row}-${col}`} className="flex gap-2 items-center">
                                    <div className="w-1 h-full bg-gray-200/50"></div>
                                    <motion.button
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleSeatClick(seat)}
                                      disabled={seat.estado !== 'disponible'}
                                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 ${getSeatStyle(seat)}`}
                                    >
                                      {isSelectedSeat(seat) ? <Check className="w-4 h-4" /> : seat.numero}
                                    </motion.button>
                                </div>
                              )
                            }

                            return (
                              <motion.button
                                key={seat._id}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleSeatClick(seat)}
                                disabled={seat.estado !== 'disponible'}
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 ${getSeatStyle(seat)}`}
                              >
                                {isSelectedSeat(seat) ? <Check className="w-4 h-4" /> : seat.numero}
                              </motion.button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alas decorativas (CSS simple) */}
                  <div className="absolute top-1/3 -left-10 w-8 h-32 bg-gray-100 rounded-r-full transform -skew-y-12 opacity-50 z-0"></div>
                  <div className="absolute top-1/3 -right-10 w-8 h-32 bg-gray-100 rounded-l-full transform skew-y-12 opacity-50 z-0"></div>
                </div>

                {/* Leyenda */}
                <div className="flex justify-center gap-6 mt-8 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                        <span className="text-gray-600">Libre</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-primary rounded"></div>
                        <span className="text-gray-600">Seleccionado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-slate-200 rounded"></div>
                        <span className="text-gray-600">Ocupado</span>
                    </div>
                </div>
              </div>

              {/* Sidebar de Resumen (Sticky) */}
              <div className="w-full lg:w-80 lg:sticky lg:top-24">
                <Card className="p-6 shadow-lg border-t-4 border-t-primary">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Armchair className="w-5 h-5 text-primary" />
                    Tu selección
                  </h3>
                  
                  {selectedSeats.length > 0 ? (
                    <div className="space-y-3 mb-6">
                      {selectedSeats.map((seat, idx) => (
                        <div key={seat._id} className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="bg-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-primary border border-blue-100">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-gray-800">Asiento {seat.numero}</span>
                          </div>
                          <button onClick={() => removeSeat(seat._id)} className="text-gray-400 hover:text-red-500">
                             <span className="sr-only">Eliminar</span>
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200 mb-6">
                        <p className="text-sm text-gray-500">No has seleccionado asientos</p>
                    </div>
                  )}

                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-500">Pasajeros</span>
                       <span className="font-medium">{numPasajeros}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-500">Asientos seleccionados</span>
                       <span className={`font-medium ${selectedSeats.length === numPasajeros ? 'text-green-600' : 'text-orange-500'}`}>
                         {selectedSeats.length} / {numPasajeros}
                       </span>
                    </div>
                  </div>
                  {/* Información de Equipaje */}
                  {flight.equipaje && (
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Luggage className="w-4 h-4" />
                        Equipaje Incluido
                      </h3>
                      <div className="space-y-2 text-sm">
                        {flight.equipaje.mano.permitido && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">✓ Equipaje de mano</span>
                            <span className="font-medium text-gray-900">{flight.equipaje.mano.peso}kg</span>
                          </div>
                        )}
                        {flight.equipaje.documentado.permitido && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">✓ Equipaje documentado</span>
                            <span className="font-medium text-gray-900">
                              {flight.equipaje.documentado.piezas} {flight.equipaje.documentado.piezas === 1 ? 'pieza' : 'piezas'} ({flight.equipaje.documentado.peso}kg)
                            </span>
                          </div>
                        )}
                        {flight.equipaje.documentado.permitido && flight.equipaje.documentado.precioExtra > 0 && (
                          <p className="text-xs text-gray-500 mt-2">
                            Piezas adicionales: ${flight.equipaje.documentado.precioExtra} MXN c/u
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                <Button 
                  className="w-full mt-6 h-12 text-lg shadow-lg hover:shadow-primary/25 transition-all flex items-center justify-center"
                  disabled={selectedSeats.length !== numPasajeros}
                  onClick={() => setStep(2)}
                >
                  Continuar
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                </Card>
              </div>
            </motion.div>
          )}

          {/* --- PASO 2: FORMULARIOS DE PASAJEROS --- */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Datos de los pasajeros</h2>
                <p className="text-gray-500">
                  Ingresa la información para los {numPasajeros} pasajeros
                </p>
              </div>

              <div className="space-y-6 mb-8">
                {passengersData.map((passenger, index) => (
                  <Card key={index} className="p-6 sm:p-8 shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-primary">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                                {index + 1}
                            </span>
                            Pasajero {index + 1}
                        </h3>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Asiento asignado</p>
                            <p className="text-xl font-bold text-primary">{selectedSeats[index]?.numero}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor={`nombre-${index}`}>Nombre(s) *</Label>
                        <Input
                          id={`nombre-${index}`}
                          value={passenger.nombre}
                          onChange={(e) => updatePassengerData(index, 'nombre', e.target.value)}
                          placeholder="Ej. Juan Carlos"
                          className="bg-gray-50 focus:bg-white transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`apellido-${index}`}>Apellidos *</Label>
                        <Input
                          id={`apellido-${index}`}
                          value={passenger.apellido}
                          onChange={(e) => updatePassengerData(index, 'apellido', e.target.value)}
                          placeholder="Ej. Pérez"
                          className="bg-gray-50 focus:bg-white transition-colors"
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor={`email-${index}`}>Correo electrónico *</Label>
                        <Input
                          id={`email-${index}`}
                          type="email"
                          value={passenger.email}
                          onChange={(e) => updatePassengerData(index, 'email', e.target.value)} 
                          placeholder="juan@ejemplo.com"
                          className="bg-gray-50 focus:bg-white transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`tipoDocumento-${index}`}>Tipo de documento</Label>
                        <select
                          id={`tipoDocumento-${index}`}
                          value={passenger.tipoDocumento}
                          onChange={(e) => updatePassengerData(index, 'tipoDocumento', e.target.value)}
                          className="w-full h-10 px-3 py-2 rounded-md border border-input bg-gray-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                        >
                          <option value="INE">INE / IFE</option>
                          <option value="Pasaporte">Pasaporte</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`numeroDocumento-${index}`}>Número de documento *</Label>
                        <Input
                          id={`numeroDocumento-${index}`}
                          value={passenger.numeroDocumento}
                          onChange={(e) => updatePassengerData(index, 'numeroDocumento', e.target.value)}
                          placeholder="ABCD123456"
                          className="bg-gray-50 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Resumen final y botón de pago */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky bottom-4">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="text-center sm:text-left">
                          <p className="text-gray-500 text-sm">Total a pagar</p>
                          <p className="text-3xl font-bold text-primary">${precioTotal.toLocaleString()}</p>
                      </div>
                      
                      <div className="flex gap-3 w-full sm:w-auto">
                         <Button 
                            variant="outline" 
                            onClick={() => setStep(1)}
                            className="flex-1 sm:flex-none h-12"
                            disabled={submitting}
                         >
                            Volver
                         </Button>
                         <Button
                            onClick={handleContinue}
                            disabled={submitting}
                            className="flex-1 sm:flex-none h-12 px-8 text-lg shadow-lg hover:shadow-primary/25"
                         >
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                    Procesando...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Ir a pagar <CreditCard className="w-5 h-5" />
                                </span>
                            )}
                         </Button>
                      </div>
                  </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  function isSelectedSeat(seat: Seat) {
      return selectedSeats.find(s => s._id === seat._id);
  }
}