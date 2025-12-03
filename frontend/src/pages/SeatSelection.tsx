import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Header from '@/components/flight/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ArrowRight, Check, ChevronLeft, Armchair, CreditCard, Users, X as LockIcon, Sparkles } from 'lucide-react';
import { API_BASE_URL } from "@/config/api";

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
        const seatsResponse = await fetch(`${API_BASE_URL}/api/asientos/vuelo/${vueloId}`);
        const seatsData = await seatsResponse.json();

        if (seatsData.success) {
          setSeats(seatsData.data.asientos);
          const vueloBasico = seatsData.data.vuelo;
          
          const flightResponse = await fetch(`${API_BASE_URL}/api/vuelos/buscar?origen=${vueloBasico.origen?.codigo || ''}&destino=${vueloBasico.destino?.codigo || ''}`);
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
    if (selectedSeats.length !== numPasajeros) {
      toast.error(`Debes seleccionar ${numPasajeros} ${numPasajeros === 1 ? 'asiento' : 'asientos'}`);
      return;
    }
    setStep(2);
  };

  const handleContinue = async () => {
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
            pasajero: passengersData[0]
          }
        : { 
            vueloId: vueloId, 
            asientos: selectedSeats.map(s => s._id), 
            pasajeros: passengersData 
          };

      const response = await fetch(`${API_BASE_URL}/api/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const data = await response.json();


      if (data.success) {
        toast.success(`${numPasajeros === 1 ? 'Reserva creada' : `${numPasajeros} reservas creadas`} exitosamente`);
        
        // ✅ Extraer IDs de reservas (múltiples o única)
        let reservaIds: string[] = [];
        
        if (numPasajeros === 1) {
          // Reserva simple: puede venir como data.reserva o data._id
          const reservaId = data.data?.reserva?._id || data.data?._id;
          if (reservaId) {
            reservaIds = [reservaId];
          }
        } else {
          // Reservas múltiples: vienen como array en data.reservas
          if (data.data?.reservas && Array.isArray(data.data.reservas)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            reservaIds = data.data.reservas.map((r: any) => r._id);
          }
        }
        
        const amount = data.data?.precioTotal || data.data?.reserva?.precioTotal || precioTotal;
        
        if (reservaIds.length === 0) {
          console.error('❌ No se recibieron IDs de reserva:', data);
          toast.error('Error: No se recibió el ID de reserva');
          return;
        }
        
        console.log(`✅ ${reservaIds.length} reserva(s) creada(s):`, reservaIds);
        
        // ✅ Navegar con todos los IDs
        navigate(`/reservas/${reservaIds[0]}/pago`, { 
          state: { 
            reservaIds: reservaIds,  // ← Array de todos los IDs
            amount: amount 
          }
        });
        toast.error(data.message || 'Error al crear la reserva');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ ESTILOS DE ASIENTOS ACTUALIZADOS PARA DARK MODE
  const getSeatColor = (seat: Seat) => {
    const isSelected = isSelectedSeat(seat);
    
    // Seleccionado: Azul Brillante
    if (isSelected) return 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.6)] scale-110 z-10';
    
    // Ocupado: Oscuro y apagado
    if (seat.estado === 'ocupado') return 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed opacity-50';
    if (seat.estado === 'bloqueado') return 'bg-yellow-900/50 text-yellow-700 border-yellow-800 cursor-not-allowed';
    
    // Ejecutiva (Disponible): Indigo Neón
    if (seat.tipo === 'ejecutiva') return 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/40 hover:border-indigo-400 hover:scale-105 hover:shadow-[0_0_10px_rgba(99,102,241,0.4)] cursor-pointer';
    
    // Económica (Disponible): Gris Cristal
    return 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/30 hover:scale-105 cursor-pointer';
  };

  function isSelectedSeat(seat: Seat) {
    return selectedSeats.find(s => s._id === seat._id);
  }

  const calcularPrecioAsiento = (seat: Seat): number => {
    if (!flight) return 0;
    const precioBase = flight.precio;
    return seat.tipo === 'ejecutiva' ? precioBase * 2 : precioBase;
  };

  const precioTotal = selectedSeats.reduce((total, seat) => total + calcularPrecioAsiento(seat), 0);

  const rows = Array.from(new Set(seats.map(s => s.fila))).sort((a, b) => a - b);
  const columns = ['A', 'B', 'C', 'D', 'E', 'F'];

  // Estados de carga y error (Dark Mode)
  if (loading) return (
    <div className="min-h-screen bg-slate-900"><Header /><div className="flex items-center justify-center h-[calc(100vh-64px)]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div></div>
  );

  if (!flight) return (
    <div className="min-h-screen bg-slate-900"><Header /><div className="flex items-center justify-center h-[calc(100vh-64px)]"><p className="text-white">Error al cargar vuelo</p></div></div>
  );


  return (
    // ✅ FONDO DARK GRADIENT
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden">
      
      {/* Decoración de Fondo */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-600/10 blur-[100px] pointer-events-none rounded-full transform -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] pointer-events-none rounded-full transform translate-y-1/3"></div>

      <Header />
      
      <div className="container mx-auto px-4 pt-32 pb-20 max-w-7xl relative z-10">
        
        {/* Breadcrumb */}
        <div className="mb-10">
          <button onClick={() => navigate(-1)} className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-6 transition-colors font-medium">
            <ChevronLeft className="w-5 h-5" /> Volver a vuelos
          </button>
          
          {/* Stepper Visual */}
          <div className="flex items-center gap-4 text-sm">
            <div className={`flex items-center gap-2 ${step === 1 ? 'text-white font-bold' : 'text-slate-500'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${step === 1 ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'border-slate-600 bg-transparent'}`}>1</span>
              <span>Asientos</span>
            </div>
            <div className="h-px bg-slate-700 w-12"></div>
            <div className={`flex items-center gap-2 ${step === 2 ? 'text-white font-bold' : 'text-slate-500'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${step === 2 ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'border-slate-600 bg-transparent'}`}>2</span>
              <span>Pasajeros</span>
            </div>
            <div className="h-px bg-slate-700 w-12"></div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-slate-700 bg-transparent">3</span>
              <span>Pago</span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* PASO 1: SELECCIÓN DE ASIENTOS */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* COLUMNA IZQUIERDA: MAPA */}
              <div className="lg:col-span-2">
                <Card className="p-6 md:p-8 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
                  <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Selecciona tu lugar</h2>
                    <p className="text-slate-400">Elige {numPasajeros} {numPasajeros === 1 ? 'asiento' : 'asientos'} en el mapa</p>
                  </div>

                  {/* LEYENDA DARK */}
                  <div className="flex flex-wrap gap-4 mb-8 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-white/5 border border-white/10 rounded"></div>
                      <span className="text-xs text-slate-400">Estándar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-indigo-500/20 border border-indigo-500/50 rounded flex items-center justify-center">
                        <Sparkles size={12} className="text-indigo-400" />
                      </div>
                      <span className="text-xs text-slate-400">Ejecutiva (2x)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-800 border border-slate-700 rounded opacity-60"></div>
                      <span className="text-xs text-slate-500">Ocupado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-600 border border-blue-400 rounded flex items-center justify-center shadow-glow">
                        <Check size={12} className="text-white" />
                      </div>
                      <span className="text-xs text-white font-bold">Seleccionado</span>
                    </div>
                  </div>

                  {/* MAPA DE ASIENTOS (FUSELAJE) */}
                  <div className="bg-slate-800/50 rounded-[3rem] rounded-b-[2rem] border-4 border-slate-800 shadow-2xl p-6 pb-12 max-w-md mx-auto relative overflow-hidden">
                    
                    {/* Cabina Decorativa */}
                    <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-slate-700 to-transparent border-b border-white/5 rounded-t-[2.5rem] flex justify-center pt-6 opacity-50">
                      <div className="w-16 h-1 bg-slate-600 rounded-full"></div>
                    </div>

                    <div className="mt-20">
                      {/* Letras de Columna */}
                      <div className="grid grid-cols-7 gap-2 mb-4 px-4 text-xs font-bold text-slate-500 text-center">
                        <div></div>
                        {columns.map(col => <div key={col}>{col}</div>)}
                      </div>

                      {/* Grid de Asientos */}
                      <div className="space-y-2 px-4">
                        {rows.map(row => (
                          <div key={row} className="grid grid-cols-7 gap-2 items-center">
                            <span className="text-xs font-bold text-slate-600 text-center">{row}</span>
                            {columns.map(col => {
                              const seat = seats.find(s => s.fila === row && s.columna === col);
                              if (!seat) return <div key={`${row}-${col}`} className="w-10 h-10" />;

                              const isSelected = isSelectedSeat(seat);
                              
                              // Renderizado del asiento (Pasillo 'D' o normal)
                              if (col === 'D') {
                                return (
                                  <div key={`${row}-${col}`} className="flex gap-2 items-center">
                                    <div className="w-1 h-10 bg-white/5 rounded-full"></div> {/* Pasillo */}
                                    <button 
                                      onClick={() => handleSeatClick(seat)} 
                                      disabled={seat.estado !== 'disponible'} 
                                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all duration-200 ${getSeatColor(seat)}`}
                                      title={`${seat.numero} - ${seat.tipo}`}
                                    >
                                      {seat.estado === 'ocupado' && <Users size={16} />}
                                      {seat.estado === 'bloqueado' && <LockIcon size={16} />}
                                      {seat.estado === 'disponible' && !isSelected && (
                                        seat.tipo === 'ejecutiva' ? <Sparkles size={16} /> : <Armchair size={16} />
                                      )}
                                      {isSelected && <Check size={16} />}
                                    </button>
                                  </div>
                                );
                              }

                              return (
                                <button 
                                  key={`${row}-${col}`} 
                                  onClick={() => handleSeatClick(seat)} 
                                  disabled={seat.estado !== 'disponible'} 
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all duration-200 ${getSeatColor(seat)}`}
                                  title={`${seat.numero} - ${seat.tipo}`}
                                >
                                  {seat.estado === 'ocupado' && <Users size={16} />}
                                  {seat.estado === 'bloqueado' && <LockIcon size={16} />}
                                  {seat.estado === 'disponible' && !isSelected && (
                                    seat.tipo === 'ejecutiva' ? <Sparkles size={16} /> : <Armchair size={16} />
                                  )}
                                  {isSelected && <Check size={16} />}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 text-center mt-8">Distribución: 3 - Pasillo - 3</p>
                </Card>
              </div>

              {/* COLUMNA DERECHA: RESUMEN */}
              <div className="lg:col-span-1">
                <Card className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl sticky top-24">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Armchair className="w-5 h-5 text-blue-400" /> Tu Selección
                  </h3>

                  {/* Detalles del Vuelo */}
                  <div className="space-y-4 mb-6 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Vuelo</span>
                      <span className="font-bold text-white">{flight.numeroVuelo}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Ruta</span>
                      <span className="font-medium text-white">{flight.origen.codigo} → {flight.destino.codigo}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Pasajeros</span>
                      <span className="font-medium text-white">{numPasajeros}</span>
                    </div>
                  </div>

                  {/* Asientos Seleccionados Lista */}
                  <div className="border-t border-white/10 pt-4 mb-6">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">Asientos ({selectedSeats.length}/{numPasajeros})</h4>
                    {selectedSeats.length === 0 ? (
                      <div className="text-sm text-slate-500 text-center py-4 italic bg-white/5 rounded-lg border border-dashed border-white/10">
                        Selecciona en el mapa
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedSeats.map((seat, idx) => (
                          <div key={seat._id} className="flex items-center justify-between bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-md">{idx + 1}</div>
                              <div>
                                <p className="font-bold text-white flex items-center gap-1">
                                  {seat.numero}
                                  {seat.tipo === 'ejecutiva' && <Sparkles size={12} className="text-yellow-400" />}
                                </p>
                                <p className="text-xs text-blue-200 capitalize">
                                  {seat.tipo} (+${calcularPrecioAsiento(seat).toLocaleString()})
                                </p>
                              </div>
                            </div>
                            <button onClick={() => removeSeat(seat._id)} className="text-slate-400 hover:text-red-400 transition-colors p-1">
                              <LockIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Total Estimado */}
                  <div className="bg-slate-900/50 p-4 rounded-xl mb-6 border border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-300">Total estimado:</span>
                      <span className="text-2xl font-bold text-white">${precioTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-14 text-lg shadow-lg shadow-blue-600/20 bg-blue-600 hover:bg-blue-500 text-white border-0 font-bold" 
                    disabled={selectedSeats.length !== numPasajeros} 
                    onClick={handleContinueToPassengers}
                  >
                    {/* 🔧 FIX: centramos texto + ícono */}
                    <span className="flex items-center justify-center gap-2 w-full">
                      <span>Continuar</span>
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </Button>
                </Card>
              </div>
            </motion.div>
          )}

          {/* PASO 2: FORMULARIOS DE PASAJEROS (DARK MODE) */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white">Datos de los pasajeros</h2>
                <p className="text-slate-400">Ingresa la información oficial para el abordaje</p>
              </div>

              <div className="space-y-6 mb-8">
                {passengersData.map((passenger, index) => (
                  <Card key={index} className="p-6 sm:p-8 shadow-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                      <h3 className="text-lg font-bold text-white flex items-center gap-3">
                        <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-600/30">{index + 1}</span>
                        Pasajero {index + 1}
                      </h3>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Asiento</p>
                        <p className="text-xl font-bold text-blue-400 flex items-center gap-1 justify-end">
                          {selectedSeats[index]?.numero}
                          {selectedSeats[index]?.tipo === 'ejecutiva' && <Sparkles size={16} className="text-yellow-400" />}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor={`nombre-${index}`} className="text-slate-300">Nombre(s) *</Label>
                        <Input id={`nombre-${index}`} value={passenger.nombre} onChange={(e) => updatePassengerData(index, 'nombre', e.target.value)} placeholder="Ej. Juan Carlos" className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`apellido-${index}`} className="text-slate-300">Apellidos *</Label>
                        <Input id={`apellido-${index}`} value={passenger.apellido} onChange={(e) => updatePassengerData(index, 'apellido', e.target.value)} placeholder="Ej. Pérez" className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20" />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor={`email-${index}`} className="text-slate-300">Correo electrónico *</Label>
                        <Input id={`email-${index}`} type="email" value={passenger.email} onChange={(e) => updatePassengerData(index, 'email', e.target.value)} placeholder="juan@ejemplo.com" className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`tipoDocumento-${index}`} className="text-slate-300">Tipo de documento</Label>
                        <select id={`tipoDocumento-${index}`} value={passenger.tipoDocumento} onChange={(e) => updatePassengerData(index, 'tipoDocumento', e.target.value)} className="w-full h-10 px-3 py-2 rounded-xl border border-white/10 bg-slate-900/50 text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors">
                          <option value="INE" className="bg-slate-900 text-white">INE / IFE</option>
                          <option value="Pasaporte" className="bg-slate-900 text-white">Pasaporte</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`numeroDocumento-${index}`} className="text-slate-300">Número de documento *</Label>
                        <Input id={`numeroDocumento-${index}`} value={passenger.numeroDocumento} onChange={(e) => updatePassengerData(index, 'numeroDocumento', e.target.value)} placeholder="ABCD123456" className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Resumen final */}
              <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/10 sticky bottom-4 z-20">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="text-center sm:text-left">
                    <p className="text-slate-400 text-sm mb-1">Total a pagar</p>
                    <p className="text-4xl font-bold text-white">${precioTotal.toLocaleString()} <span className="text-sm font-normal text-slate-500">MXN</span></p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 sm:flex-none h-14 border-white/10 text-white hover:bg-white/10" disabled={submitting}>Volver</Button>
                    <Button onClick={handleContinue} disabled={submitting} className="flex-1 sm:flex-none h-14 px-8 text-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 border-0">
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