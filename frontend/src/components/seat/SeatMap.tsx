import { useState } from 'react';
import { Users } from 'lucide-react';

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

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'selected':
        return 'bg-blue-600 text-white border-2 border-blue-700';
      case 'occupied':
        return 'bg-gray-800 text-gray-400 cursor-not-allowed opacity-60';
      default:
        return 'bg-gray-200 text-gray-700 hover:bg-blue-100 cursor-pointer border-2 border-gray-300';
    }
  };

  const shouldShowSeat = (row: number, col: string) => {
    if (EMERGENCY_EXIT_ROWS.includes(row) && ['A', 'B', 'C'].includes(col)) {
      return false;
    }
    return true;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecciona tu asiento</h2>
      <p className="text-sm text-gray-500 mb-6">Vuelo desde Ciudad de México a Cancún</p>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 border-2 border-gray-300 rounded"></div>
          <span className="text-sm text-gray-600">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 border-2 border-blue-700 rounded flex items-center justify-center">
            <Users size={16} className="text-white" />
          </div>
          <span className="text-sm text-gray-600">Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-800 border-2 border-gray-700 rounded opacity-60"></div>
          <span className="text-sm text-gray-600">Ocupado</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="overflow-x-auto pb-4 flex justify-center">
        <div className="inline-block">
          {/* Column Headers */}
          <div className="flex justify-center gap-1 mb-4">
            {COLS.map((col) => (
              <div key={col} className="w-10 h-10 flex items-center justify-center font-bold text-gray-700 text-lg">
                {col}
              </div>
            ))}
            <div className="w-6"></div>
          </div>

          {/* Rows */}
          {Array.from({ length: ROWS }, (_, i) => i + 3).map((row) => (
            <div key={row} className="flex items-center justify-center gap-1 mb-1">
              {/* Row Number Left */}
              <div className="w-10 h-10 flex items-center justify-center font-semibold text-gray-700">{row}</div>

              {/* Left side seats (A, B, C) */}
              {COLS.slice(0, 3).map((col) => {
                const seat = `${row}${col}`;
                const show = shouldShowSeat(row, col);

                if (!show) {
                  return <div key={seat} className="w-10 h-10"></div>;
                }

                const status = getSeatStatus(seat);
                const isOccupied = occupiedSeats.includes(seat);

                return (
                  <button
                    key={seat}
                    onClick={() => !isOccupied && onSeatSelect(seat)}
                    onMouseEnter={() => !isOccupied && setHoveredSeat(seat)}
                    onMouseLeave={() => setHoveredSeat(null)}
                    disabled={isOccupied}
                    className={`w-10 h-10 rounded font-bold text-xs flex items-center justify-center transition-all ${getSeatColor(status)} ${
                      hoveredSeat === seat && !isOccupied ? 'ring-2 ring-blue-300 shadow-md' : ''
                    }`}
                    title={seat}
                  >
                    {status === 'occupied' ? '✕' : ''}
                    {selectedSeat === seat && <Users size={16} />}
                  </button>
                );
              })}

              {/* Aisle spacer */}
              <div className="w-6"></div>

              {/* Right side seats (D, E, F) */}
              {COLS.slice(3, 6).map((col) => {
                const seat = `${row}${col}`;
                const show = shouldShowSeat(row, col);

                if (!show) {
                  return <div key={seat} className="w-10 h-10"></div>;
                }

                const status = getSeatStatus(seat);
                const isOccupied = occupiedSeats.includes(seat);

                return (
                  <button
                    key={seat}
                    onClick={() => !isOccupied && onSeatSelect(seat)}
                    onMouseEnter={() => !isOccupied && setHoveredSeat(seat)}
                    onMouseLeave={() => setHoveredSeat(null)}
                    disabled={isOccupied}
                    className={`w-10 h-10 rounded font-bold text-xs flex items-center justify-center transition-all ${getSeatColor(status)} ${
                      hoveredSeat === seat && !isOccupied ? 'ring-2 ring-blue-300 shadow-md' : ''
                    }`}
                    title={seat}
                  >
                    {status === 'occupied' ? '✕' : ''}
                    {selectedSeat === seat && <Users size={16} />}
                  </button>
                );
              })}

              {/* Row Number Right */}
              <div className="w-10 h-10 flex items-center justify-center font-semibold text-gray-700 ml-1">{row}</div>

            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center mt-6">
        Distribución: 3 asientos - pasillo - 3 asientos (A, B, C | pasillo | D, E, F)
      </p>
    </div>
  );
}