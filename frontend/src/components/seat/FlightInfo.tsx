interface FlightInfoProps {
  from: string;
  to: string;
  date: string;
  time: string;
  duration: string;
  price: string;
  flightNumber: string;
}

export default function FlightInfo({ from, to, date, time, duration, price, flightNumber }: FlightInfoProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Route */}
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 font-medium">Ruta</span>
            <span className="text-lg font-semibold text-gray-900">
              {from} → {to}
            </span>
          </div>

          {/* Date and Time */}
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 font-medium">Fecha y Hora</span>
            <span className="text-lg font-semibold text-gray-900">{date}</span>
            <span className="text-sm text-gray-600">{time}</span>
          </div>

          {/* Duration */}
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 font-medium">Duración</span>
            <span className="text-lg font-semibold text-gray-900">{duration}</span>
          </div>

          {/* Flight Number and Price */}
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 font-medium">Vuelo</span>
            <span className="text-lg font-semibold text-gray-900">{flightNumber}</span>
            <span className="text-sm text-blue-600 font-semibold">{price}</span>
          </div>
        </div>
      </div>
    </header>
  );
}