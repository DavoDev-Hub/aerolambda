import { useState } from 'react';
import { Users, Check, X } from 'lucide-react';

const ROWS = 19;
const COLS = ['A', 'B', 'C', 'D', 'E', 'F'];
const EMERGENCY_EXIT_ROWS = [13, 14]; // No seats in columns A, B, C

interface SeatMapProps {
  selectedSeat: string | null;
  onSeatSelect: (seat: string) => void;
  occupiedSeats: string[];
}

export default function SeatMap({ selectedSeat, onSeatSelect, occupiedSeats }: SeatMapProps) {
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  const getSeatStatus = (seat: string) => {
    if (selectedSeat === seat) return 'selected';
    if (occupiedSeats.includes(seat)) return 'occupied';
    return 'available';
  };

  // ✅ NUEVOS ESTILOS DARK / NEÓN
  const getSeatColor = (status: string, isHovered: boolean) => {
    switch (status) {
      case 'selected':
        return 'bg-blue-600 text-white border-2 border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.6)] z-10 scale-110';
      case 'occupied':
        return 'bg-slate-800/50 text-slate-700 border border-slate-700/50 cursor-not-allowed';
      default:
        // Disponible
        return isHovered 
          ? 'bg-blue-500/20 border-blue-400 text-blue-200 scale-105 shadow-lg shadow-blue-500/10' 
          : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30';
    }
  };

  const shouldShowSeat = (row: number, col: string) => {
    if (EMERGENCY_EXIT_ROWS.includes(row) && ['A', 'B', 'C'].includes(col)) {
      return false;
    }
    return true;
  };

  return (
    <div className="w-full">
      {/* No ponemos bg-white aquí para que sea transparente 
          y se vea el fondo de la tarjeta padre.
      */}
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Mapa del Avión</h2>
        <p className="text-sm text-slate-400">Frente de la aeronave ▲</p>
      </div>

      {/* Grid del Avión (Fuselaje Simulado) */}
      <div className="bg-slate-900/50 border-x-2 border-t-2 border-slate-800 rounded-t-[10rem] pt-24 pb-8 px-4 max-w-sm mx-auto relative overflow-hidden">
        
        {/* Efecto de luz de cabina */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none"></div>

        <div className="inline-block relative z-10">
          {/* Cabecera de Columnas */}
          <div className="flex justify-center gap-2 mb-4 text-xs font-bold text-slate-500">
            {COLS.slice(0, 3).map(col => <div key={col} className="w-10 text-center">{col}</div>)}
            <div className="w-8"></div> {/* Pasillo */}
            {COLS.slice(3, 6).map(col => <div key={col} className="w-10 text-center">{col}</div>)}
          </div>

          {/* Filas */}
          {Array.from({ length: ROWS }, (_, i) => i + 1).map((row) => (
            <div key={row} className="flex items-center justify-center gap-2 mb-2 relative group">
              
              {/* Número de fila (Izquierda - Flotante) */}
              <div className="absolute -left-8 text-[10px] font-mono text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">{row}</div>

              {/* Asientos Izquierda (A, B, C) */}
              {COLS.slice(0, 3).map((col) => {
                const seat = `${row}${col}`;
                const show = shouldShowSeat(row, col);

                if (!show) return <div key={seat} className="w-10 h-10"></div>;

                const status = getSeatStatus(seat);
                const isOccupied = occupiedSeats.includes(seat);
                const isHovered = hoveredSeat === seat;

                return (
                  <button
                    key={seat}
                    onClick={() => !isOccupied && onSeatSelect(seat)}
                    onMouseEnter={() => !isOccupied && setHoveredSeat(seat)}
                    onMouseLeave={() => setHoveredSeat(null)}
                    disabled={isOccupied}
                    className={`w-10 h-10 rounded-lg font-bold text-xs flex items-center justify-center transition-all duration-200 border ${getSeatColor(status, isHovered)}`}
                    title={`Asiento ${seat}`}
                  >
                    {status === 'occupied' ? <X size={14} /> : null}
                    {selectedSeat === seat && <Check size={16} strokeWidth={3} />}
                    {status === 'available' && !isHovered && <span className="text-[10px] opacity-30">{col}</span>}
                    {status === 'available' && isHovered && <Users size={16} />}
                  </button>
                );
              })}

              {/* Pasillo */}
              <div className="w-8 flex justify-center items-center">
                <span className="text-[10px] font-mono text-slate-700">{row}</span>
              </div>

              {/* Asientos Derecha (D, E, F) */}
              {COLS.slice(3, 6).map((col) => {
                const seat = `${row}${col}`;
                const show = shouldShowSeat(row, col);

                if (!show) return <div key={seat} className="w-10 h-10"></div>;

                const status = getSeatStatus(seat);
                const isOccupied = occupiedSeats.includes(seat);
                const isHovered = hoveredSeat === seat;

                return (
                  <button
                    key={seat}
                    onClick={() => !isOccupied && onSeatSelect(seat)}
                    onMouseEnter={() => !isOccupied && setHoveredSeat(seat)}
                    onMouseLeave={() => setHoveredSeat(null)}
                    disabled={isOccupied}
                    className={`w-10 h-10 rounded-lg font-bold text-xs flex items-center justify-center transition-all duration-200 border ${getSeatColor(status, isHovered)}`}
                    title={`Asiento ${seat}`}
                  >
                    {status === 'occupied' ? <X size={14} /> : null}
                    {selectedSeat === seat && <Check size={16} strokeWidth={3} />}
                    {status === 'available' && !isHovered && <span className="text-[10px] opacity-30">{col}</span>}
                    {status === 'available' && isHovered && <Users size={16} />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}