import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Header from '@/components/flight/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ArrowRight, Check, ChevronLeft, Armchair, CreditCard, Luggage, Users, X as LockIcon, Sparkles } from 'lucide-react';

// --- Interfaces ---
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
    mano: { permitido: boolean; peso: number; dimensiones: string };
    documentado: { permitido: boolean; peso: number; piezas: number; precioExtra: number };
  };
}

interface Seat {
  _id: string;
  numero: string;
  fila: number;
  columna: string;
  tipo: 'economica' | 'ejecutiva';
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
  const [passengersData, setPassengersData] = useState<PassengerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const numPasajeros = (location.state?.numPasajeros as number) || 1;

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
          nombre: '', apellido: '', email: '', telefono: '',
          tipoDocumento: 'INE', numeroDocumento: '',
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
            setFlight(fullFlight || flightData.data.vuelos[0]);
          } else {
            setFlight({
              _id: vueloBasico.id, numeroVuelo: vueloBasico.numeroVuelo,
              origen: vueloBasico.origen, destino: vueloBasico.destino,
              fechaSalida: new Date().toISOString(), horaSalida: '00:00',
              duracion: '0h 0m', precio: 0
            });
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Error al cargar los asientos');
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
      toast.error(`Solo puedes seleccionar ${numPasajeros} ${numPasajeros === 1 ? 'asiento' : 'asientos'}`);
      return;
    }
    setSelectedSeats([...selectedSeats, seat]);
  };

  const removeSeat = (seatId: string) => {
    setSelectedSeats(selectedSeats.filter(s => s._id !== seatId));
    if (step === 2) setStep(1);
  };

  const updatePassengerData = (index: number, field: keyof PassengerData, value: string) => {
    const newData = [...passengersData];
    newData[index] = { ...newData[index], [field]: value };
    setPassengersData(newData);
  };

  const handleContinueToPassengers = () => {
    // Validar que se hayan seleccionado todos los asientos
    if (selectedSeats.length !== numPasajeros) {
      toast.error(`Debes seleccionar ${numPasajeros} ${numPasajeros === 1 ? 'asiento' : 'asientos'}`);
      return;
    }
    setStep(2);
  };

  const handleContinue = async () => {
    // Validaciones
    if (selectedSeats.length !== numPasajeros) {
      toast.error(`Debes seleccionar ${numPasajeros} ${numPasajeros === 1 ? 'asiento' : 'asientos'}`);
      return;
    }

    for (let i = 0; i < passengersData.length; i++) {
      const passenger = passengersData[i];
      if (!passenger.nombre || !passenger.apellido || !passenger.email || !passenger.numeroDocumento) {
        toast.error(`Por favor completa todos los campos del pasajero ${i + 1}`);
        return;
      }
      
      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(passenger.email)) {
        toast.error(`El email del pasajero ${i + 1} no es válido`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }

      const payload = numPasajeros === 1 
        ? { 
            vueloId: vueloId, 
            asientoId: selectedSeats[0]._id, 
            pasajero: passengersData[0]  // ← Singular y [0]
          }
        : { 
            vueloId: vueloId, 
            asientos: selectedSeats.map(s => s._id), 
            pasajeros: passengersData 
          };

      console.log('📤 Enviando payload:', payload);

      const response = await fetch('/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      console.log('📥 Respuesta del servidor:', data);

      if (data.success) {
        toast.success('Reserva creada exitosamente');
        
        // ✅ Extraer reservaId de forma segura (maneja diferentes estructuras)
        const reservaId = data.data?.reserva?._id || data.data?._id;
        const amount = data.data?.precioTotal || data.data?.reserva?.precioTotal || precioTotal;
        
        if (!reservaId) {
          console.error('❌ No se pudo obtener reservaId:', data);
          toast.error('Error: No se recibió el ID de reserva');
          return;
        }
        
        console.log('✅ Navegando a pago:', { reservaId, amount });
        
        navigate(`/reservas/${reservaId}/pago`, { 
          state: { 
            amount: amount
          }
        });
      } else {
        toast.error(data.message || 'Error al crear la reserva');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error(error.message || 'Error al procesar la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  const getSeatColor = (seat: Seat) => {
    const isSelected = isSelectedSeat(seat);
    if (isSelected) return 'bg-primary border-primary text-white shadow-lg scale-110';
    if (seat.estado === 'ocupado') return 'bg-red-500 text-white border-red-600 cursor-not-allowed';
    if (seat.estado === 'bloqueado') return 'bg-yellow-400 text-white border-yellow-500 cursor-not-allowed';
    if (seat.tipo === 'ejecutiva') return 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200 hover:border-blue-400 hover:scale-105 cursor-pointer';
    return 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 hover:scale-105 cursor-pointer';
  };

  const getStats = () => {
    const total = seats.length;
    const disponibles = seats.filter(s => s.estado === 'disponible').length;
    const ocupados = seats.filter(s => s.estado === 'ocupado').length;
    const bloqueados = seats.filter(s => s.estado === 'bloqueado').length;
    const ejecutivos = seats.filter(s => s.tipo === 'ejecutiva').length;
    const economicos = seats.filter(s => s.tipo === 'economica').length;
    return { total, disponibles, ocupados, bloqueados, ejecutivos, economicos };
  };

  function isSelectedSeat(seat: Seat) {
    return selectedSeats.find(s => s._id === seat._id);
  }

  // 💰 CÁLCULO DE PRECIO CON EJECUTIVOS 2X
  const calcularPrecioAsiento = (seat: Seat): number => {
    if (!flight) return 0;
    const precioBase = flight.precio;
    return seat.tipo === 'ejecutiva' ? precioBase * 2 : precioBase;
  };

  const precioTotal = selectedSeats.reduce((total, seat) => total + calcularPrecioAsiento(seat), 0);

  const rows = Array.from(new Set(seats.map(s => s.fila))).sort((a, b) => a - b);
  const columns = ['A', 'B', 'C', 'D', 'E', 'F'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-4"></div>
            <p className="text-gray-600 text-lg">Cargando asientos disponibles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <Card className="p-8 text-center">
            <p className="text-red-600 text-lg">No se pudo cargar la información del vuelo</p>
            <Button onClick={() => navigate(-1)} className="mt-4">Volver</Button>
          </Card>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="text-primary hover:text-primary/80 flex items-center gap-2 mb-4 transition-colors">
            <ChevronLeft className="w-5 h-5" /> Volver a vuelos
          </button>
          
          <div className="flex items-center gap-4 text-sm">
            <div className={`flex items-center gap-2 ${step === 1 ? 'text-primary font-bold' : 'text-gray-400'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 1 ? 'bg-primary text-white border-primary' : 'border-gray-300'}`}>1</span>
              <span>Asientos</span>
            </div>
            <div className="h-px bg-gray-300 w-12"></div>
            <div className={`flex items-center gap-2 ${step === 2 ? 'text-primary font-bold' : 'text-gray-400'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 2 ? 'bg-primary text-white border-primary' : 'border-gray-300'}`}>2</span>
              <span>Pasajeros</span>
            </div>
            <div className="h-px bg-gray-300 w-12"></div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-gray-300">3</span>
              <span>Pago</span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* PASO 1: SELECCIÓN DE ASIENTOS */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="p-6 shadow-lg">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecciona tus asientos</h2>
                    <p className="text-gray-500">Selecciona {numPasajeros} {numPasajeros === 1 ? 'asiento' : 'asientos'} en el mapa</p>
                  </div>

                  {/* ESTADÍSTICAS */}
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-6">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                      <p className="text-xs text-gray-500 font-medium">Total</p>
                      <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
                      <p className="text-xs text-green-600 font-medium">Disponibles</p>
                      <p className="text-xl font-bold text-green-700">{stats.disponibles}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-center">
                      <p className="text-xs text-red-600 font-medium">Ocupados</p>
                      <p className="text-xl font-bold text-red-700">{stats.ocupados}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-center">
                      <p className="text-xs text-yellow-600 font-medium">Bloqueados</p>
                      <p className="text-xl font-bold text-yellow-700">{stats.bloqueados}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
                      <p className="text-xs text-blue-600 font-medium">Ejecutivos</p>
                      <p className="text-xl font-bold text-blue-700">{stats.ejecutivos}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                      <p className="text-xs text-slate-600 font-medium">Económicos</p>
                      <p className="text-xl font-bold text-slate-700">{stats.economicos}</p>
                    </div>
                  </div>

                  {/* LEYENDA */}
                  <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded-lg"></div>
                      <span className="text-sm text-gray-600">Disponible (Económica)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 border-2 border-blue-300 rounded-lg flex items-center justify-center">
                        <Sparkles size={14} className="text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-600">Disponible (Ejecutiva 2x)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-red-500 border-2 border-red-600 rounded-lg flex items-center justify-center">
                        <Users size={14} className="text-white" />
                      </div>
                      <span className="text-sm text-gray-600">Ocupado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-yellow-400 border-2 border-yellow-500 rounded-lg flex items-center justify-center">
                        <LockIcon size={14} className="text-white" />
                      </div>
                      <span className="text-sm text-gray-600">Bloqueado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary border-2 border-primary rounded-lg flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                      <span className="text-sm text-gray-600">Seleccionado</span>
                    </div>
                  </div>

                  {/* MAPA DE ASIENTOS */}
                  <div className="bg-white rounded-[3rem] rounded-b-[2rem] shadow-xl border-2 border-gray-200 p-6 pb-12 max-w-md mx-auto relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100 rounded-t-[3rem] flex justify-center pt-6">
                      <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
                    </div>

                    <div className="mt-16">
                      <div className="grid grid-cols-7 gap-2 mb-3 px-4 text-xs font-bold text-gray-400 text-center">
                        <div></div>
                        {columns.map(col => <div key={col}>{col}</div>)}
                      </div>

                      <div className="space-y-2 px-4">
                        {rows.map(row => (
                          <div key={row} className="grid grid-cols-7 gap-2 items-center">
                            <span className="text-xs font-bold text-gray-400 text-center">{row}</span>
                            {columns.map(col => {
                              const seat = seats.find(s => s.fila === row && s.columna === col);
                              if (!seat) return <div key={`${row}-${col}`} className="w-10 h-10" />;

                              const isSelected = isSelectedSeat(seat);
                              if (col === 'D') {
                                return (
                                  <div key={`${row}-${col}`} className="flex gap-2 items-center">
                                    <div className="w-1 h-10 bg-gray-200/50 rounded-full"></div>
                                    <button onClick={() => handleSeatClick(seat)} disabled={seat.estado !== 'disponible'} className={`w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-200 ${getSeatColor(seat)}`} title={`${seat.numero} - ${seat.tipo} - ${seat.estado}${seat.tipo === 'ejecutiva' ? ' - 2x precio' : ''}`}>
                                      {seat.estado === 'ocupado' && <Users size={16} />}
                                      {seat.estado === 'bloqueado' && <LockIcon size={16} />}
                                      {seat.estado === 'disponible' && !isSelected && <Armchair size={16} />}
                                      {isSelected && <Check size={16} />}
                                    </button>
                                  </div>
                                );
                              }

                              return (
                                <button key={`${row}-${col}`} onClick={() => handleSeatClick(seat)} disabled={seat.estado !== 'disponible'} className={`w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-200 ${getSeatColor(seat)}`} title={`${seat.numero} - ${seat.tipo} - ${seat.estado}${seat.tipo === 'ejecutiva' ? ' - 2x precio' : ''}`}>
                                  {seat.estado === 'ocupado' && <Users size={16} />}
                                  {seat.estado === 'bloqueado' && <LockIcon size={16} />}
                                  {seat.estado === 'disponible' && !isSelected && <Armchair size={16} />}
                                  {isSelected && <Check size={16} />}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-24 bg-gradient-to-r from-gray-100 to-transparent rounded-r-full -translate-x-6 opacity-50"></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-24 bg-gradient-to-l from-gray-100 to-transparent rounded-l-full translate-x-6 opacity-50"></div>
                  </div>

                  <p className="text-xs text-gray-500 text-center mt-6">Distribución: 3 asientos - pasillo - 3 asientos (A, B, C | pasillo | D, E, F)</p>
                </Card>
              </div>

              {/* Resumen */}
              <div className="lg:col-span-1">
                <Card className="p-6 shadow-lg sticky top-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Armchair className="w-5 h-5 text-primary" /> Tu selección
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Vuelo</span>
                      <span className="font-bold text-gray-900">{flight.numeroVuelo}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Ruta</span>
                      <span className="font-medium text-gray-900">{flight.origen.codigo} → {flight.destino.codigo}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Pasajeros</span>
                      <span className="font-medium text-gray-900">{numPasajeros}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Precio base (Económica)</span>
                      <span className="font-bold text-gray-900">${flight.precio.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t pt-2">
                      <span className="text-blue-600 flex items-center gap-1">
                        <Sparkles size={14} />
                        Ejecutiva (2x)
                      </span>
                      <span className="font-bold text-blue-700">${(flight.precio * 2).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Asientos seleccionados</h4>
                    {selectedSeats.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No has seleccionado asientos</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedSeats.map((seat, idx) => (
                          <div key={seat._id} className="flex items-center justify-between bg-primary/5 p-3 rounded-lg border border-primary/20">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-sm">{idx + 1}</div>
                              <div>
                                <p className="font-bold text-gray-900 flex items-center gap-1">
                                  {seat.numero}
                                  {seat.tipo === 'ejecutiva' && <Sparkles size={12} className="text-blue-600" />}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                  {seat.tipo} - ${calcularPrecioAsiento(seat).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <button onClick={() => removeSeat(seat._id)} className="text-red-500 hover:text-red-700 transition-colors">
                              <LockIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 text-center">
                      <span className="text-sm text-gray-600">Seleccionados: <span className={`font-bold ${selectedSeats.length === numPasajeros ? 'text-green-600' : 'text-primary'}`}>{selectedSeats.length} / {numPasajeros}</span></span>
                    </div>
                  </div>

                  {/* Total provisional */}
                  {selectedSeats.length > 0 && (
                    <div className="bg-primary/10 p-4 rounded-lg mb-4 border border-primary/20">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Total estimado:</span>
                        <span className="text-xl font-bold text-primary">${precioTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {flight.equipaje && (
                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Luggage className="w-4 h-4" /> Equipaje Incluido
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
                            <span className="font-medium text-gray-900">{flight.equipaje.documentado.piezas} {flight.equipaje.documentado.piezas === 1 ? 'pieza' : 'piezas'} ({flight.equipaje.documentado.peso}kg)</span>
                          </div>
                        )}
                        {flight.equipaje.documentado.permitido && flight.equipaje.documentado.precioExtra > 0 && (
                          <p className="text-xs text-gray-500 mt-2">Piezas adicionales: ${flight.equipaje.documentado.precioExtra} MXN c/u</p>
                        )}
                      </div>
                    </div>
                  )}

                  <Button className="w-full mt-6 h-12 text-lg shadow-lg hover:shadow-primary/25 transition-all flex items-center justify-center" disabled={selectedSeats.length !== numPasajeros} onClick={handleContinueToPassengers}>
                    Continuar <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Card>
              </div>
            </motion.div>
          )}

          {/* PASO 2: FORMULARIOS DE PASAJEROS */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Datos de los pasajeros</h2>
                <p className="text-gray-500">Ingresa la información para los {numPasajeros} pasajeros</p>
              </div>

              <div className="space-y-6 mb-8">
                {passengersData.map((passenger, index) => (
                  <Card key={index} className="p-6 sm:p-8 shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-primary">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">{index + 1}</span>
                        Pasajero {index + 1}
                      </h3>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Asiento asignado</p>
                        <p className="text-xl font-bold text-primary flex items-center gap-1 justify-end">
                          {selectedSeats[index]?.numero}
                          {selectedSeats[index]?.tipo === 'ejecutiva' && <Sparkles size={16} className="text-blue-600" />}
                        </p>
                        <p className="text-xs text-gray-600 capitalize">{selectedSeats[index]?.tipo}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor={`nombre-${index}`}>Nombre(s) *</Label>
                        <Input id={`nombre-${index}`} value={passenger.nombre} onChange={(e) => updatePassengerData(index, 'nombre', e.target.value)} placeholder="Ej. Juan Carlos" className="bg-gray-50 focus:bg-white transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`apellido-${index}`}>Apellidos *</Label>
                        <Input id={`apellido-${index}`} value={passenger.apellido} onChange={(e) => updatePassengerData(index, 'apellido', e.target.value)} placeholder="Ej. Pérez" className="bg-gray-50 focus:bg-white transition-colors" />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor={`email-${index}`}>Correo electrónico *</Label>
                        <Input id={`email-${index}`} type="email" value={passenger.email} onChange={(e) => updatePassengerData(index, 'email', e.target.value)} placeholder="juan@ejemplo.com" className="bg-gray-50 focus:bg-white transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`tipoDocumento-${index}`}>Tipo de documento</Label>
                        <select id={`tipoDocumento-${index}`} value={passenger.tipoDocumento} onChange={(e) => updatePassengerData(index, 'tipoDocumento', e.target.value)} className="w-full h-10 px-3 py-2 rounded-md border border-input bg-gray-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors">
                          <option value="INE">INE / IFE</option>
                          <option value="Pasaporte">Pasaporte</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`numeroDocumento-${index}`}>Número de documento *</Label>
                        <Input id={`numeroDocumento-${index}`} value={passenger.numeroDocumento} onChange={(e) => updatePassengerData(index, 'numeroDocumento', e.target.value)} placeholder="ABCD123456" className="bg-gray-50 focus:bg-white transition-colors" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Resumen final desglosado */}
              <Card className="p-6 mb-6 shadow-lg border-2 border-primary/20">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen de tu compra</h3>
                <div className="space-y-3">
                  {selectedSeats.map((seat, idx) => (
                    <div key={seat._id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 flex items-center gap-2">
                        Pasajero {idx + 1} - {seat.numero} 
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                          {seat.tipo}
                          {seat.tipo === 'ejecutiva' && ' (2x)'}
                        </span>
                      </span>
                      <span className="font-bold text-gray-900">${calcularPrecioAsiento(seat).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total a pagar</span>
                    <span className="text-2xl font-bold text-primary">${precioTotal.toLocaleString()}</span>
                  </div>
                </div>
              </Card>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky bottom-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-gray-500 text-sm">Total a pagar</p>
                    <p className="text-3xl font-bold text-primary">${precioTotal.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 sm:flex-none h-12" disabled={submitting}>Volver</Button>
                    <Button onClick={handleContinue} disabled={submitting} className="flex-1 sm:flex-none h-12 px-8 text-lg shadow-lg hover:shadow-primary/25">
                      {submitting ? (<span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>Procesando...</span>) : (<span className="flex items-center gap-2">Ir a pagar <CreditCard className="w-5 h-5" /></span>)}
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
}