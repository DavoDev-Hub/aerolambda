import { useEffect, useState } from 'react';
import { X, Armchair, Users, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Seat {
  _id: string;
  numero: string;
  fila: number;
  columna: string;
  tipo: 'economica' | 'ejecutiva';
  estado: 'disponible' | 'ocupado' | 'bloqueado';
  reserva?: string;
}

interface SeatMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  vueloId: string;
  numeroVuelo: string;
  origen: string;
  destino: string;
}

export default function SeatMapModal({ isOpen, onClose, vueloId, numeroVuelo, origen, destino }: SeatMapModalProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && vueloId) {
      fetchSeats();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, vueloId]);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/asientos/vuelo/${vueloId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSeats(data.data.asientos || []);
      }
    } catch (error) {
      console.error('Error fetching seats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.estado === 'ocupado') {
      return 'bg-red-500 text-white border-red-600';
    }
    if (seat.estado === 'bloqueado') {
      return 'bg-yellow-400 text-white border-yellow-500';
    }
    // Disponible
    if (seat.tipo === 'ejecutiva') {
      return 'bg-blue-100 border-blue-300 text-blue-700';
    }
    return 'bg-white border-gray-300 text-gray-600';
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

  if (!isOpen) return null;

  const stats = getStats();
  
  // Obtener filas y columnas dinámicamente desde los asientos
  const rows = Array.from(new Set(seats.map(s => s.fila))).sort((a, b) => a - b);
  const columns = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Armchair className="w-6 h-6 text-primary" />
              Mapa de Asientos
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Vuelo {numeroVuelo} • {origen} → {destino}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Stats */}
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

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded-lg"></div>
                  <span className="text-sm text-gray-600">Disponible (Económica)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 border-2 border-blue-300 rounded-lg"></div>
                  <span className="text-sm text-gray-600">Disponible (Ejecutiva)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-500 border-2 border-red-600 rounded-lg flex items-center justify-center">
                    <Users size={14} className="text-white" />
                  </div>
                  <span className="text-sm text-gray-600">Ocupado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-400 border-2 border-yellow-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">⏱</span>
                  </div>
                  <span className="text-sm text-gray-600">Bloqueado</span>
                </div>
              </div>

              {/* Seat Map - Mismo diseño que SeatSelection */}
              <div className="bg-white rounded-[3rem] rounded-b-[2rem] shadow-xl border-2 border-gray-200 p-6 pb-12 max-w-md mx-auto relative overflow-hidden">
                
                {/* Cabina decorativa */}
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100 rounded-t-[3rem] flex justify-center pt-6">
                  <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
                </div>

                <div className="mt-16">
                  {/* Guía de Columnas */}
                  <div className="grid grid-cols-7 gap-2 mb-3 px-4 text-xs font-bold text-gray-400 text-center">
                    <div></div>
                    {columns.map(col => <div key={col}>{col}</div>)}
                  </div>

                  {/* Grid de Asientos */}
                  <div className="space-y-2 px-4">
                    {rows.map(row => (
                      <div key={row} className="grid grid-cols-7 gap-2 items-center">
                        {/* Número de fila */}
                        <span className="text-xs font-bold text-gray-400 text-center">{row}</span>
                        
                        {columns.map(col => {
                          const seat = seats.find(s => s.fila === row && s.columna === col);
                          
                          if (!seat) {
                            return <div key={`${row}-${col}`} className="w-8 h-8" />;
                          }

                          // Pasillo visual entre C y D
                          if (col === 'D') {
                            return (
                              <div key={`${row}-${col}`} className="flex gap-2 items-center">
                                <div className="w-1 h-8 bg-gray-200/50 rounded-full"></div>
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border-2 transition-all ${getSeatColor(seat)}`}
                                  title={`${seat.numero} - ${seat.tipo} - ${seat.estado}`}
                                >
                                  {seat.estado === 'ocupado' && <Users size={14} />}
                                  {seat.estado === 'bloqueado' && <span>⏱</span>}
                                  {seat.estado === 'disponible' && <Check size={14} className="text-gray-300" />}
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={`${row}-${col}`}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border-2 transition-all ${getSeatColor(seat)}`}
                              title={`${seat.numero} - ${seat.tipo} - ${seat.estado}`}
                            >
                              {seat.estado === 'ocupado' && <Users size={14} />}
                              {seat.estado === 'bloqueado' && <span>⏱</span>}
                              {seat.estado === 'disponible' && <Check size={14} className="text-gray-300" />}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alas decorativas */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-24 bg-gradient-to-r from-gray-100 to-transparent rounded-r-full -translate-x-6 opacity-50"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-24 bg-gradient-to-l from-gray-100 to-transparent rounded-l-full translate-x-6 opacity-50"></div>
              </div>

              <p className="text-xs text-gray-500 text-center mt-6">
                Distribución: 3 asientos - pasillo - 3 asientos (A, B, C | pasillo | D, E, F)
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 sticky bottom-0">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{stats.disponibles}</span> asientos disponibles de <span className="font-semibold">{stats.total}</span>
            </div>
            <div className="text-sm text-gray-600">
              Ocupación: <span className="font-bold text-primary">{Math.round(((stats.total - stats.disponibles) / stats.total) * 100)}%</span>
            </div>
          </div>
          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}