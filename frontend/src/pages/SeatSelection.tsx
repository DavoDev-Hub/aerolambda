import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/flight/Header';
import FlightInfo from '@/components/seat/FlightInfo';
import SeatMap from '@/components/seat/SeatMap';
import PassengerForm from '@/components/seat/PassengerForm';

interface Seat {
  _id: string;
  numero: string;
  estado: 'disponible' | 'ocupado' | 'bloqueado';
}

export default function SeatSelection() {
  const { vueloId } = useParams<{ vueloId: string }>();
  const navigate = useNavigate();

  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flightData, setFlightData] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    documentType: 'INE',
    documentNumber: '',
  });

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener mapa de asientos
        const response = await fetch(`/api/asientos/vuelo/${vueloId}`);

        if (!response.ok) {
          throw new Error('Error al cargar los asientos');
        }

        const data = await response.json();

        if (data.success) {
          setFlightData(data.data.vuelo);
          
          // Extraer asientos ocupados y bloqueados
          const ocupados = data.data.asientos
            .filter((seat: Seat) => seat.estado === 'ocupado' || seat.estado === 'bloqueado')
            .map((seat: Seat) => seat.numero);
          
          setOccupiedSeats(ocupados);
        } else {
          setError(data.message || 'Error al cargar asientos');
        }
      } catch (err) {
        const error = err as Error;
        console.error('Error fetching seats:', error);
        setError(error.message || 'Error al cargar los asientos');
      } finally {
        setLoading(false);
      }
    };

    if (vueloId) {
      fetchSeats();
    }
  }, [vueloId]);

  const handleSeatSelect = (seat: string) => {
    setSelectedSeat(seat);
  };

  const handleSubmit = async () => {
    if (!selectedSeat) {
      alert('Por favor selecciona un asiento');
      return;
    }

    // Aquí irá la lógica para crear la reserva
    console.log('Crear reserva:', {
      vueloId,
      asiento: selectedSeat,
      pasajero: formData,
    });

    // Por ahora, navegamos a una página de confirmación (la crearemos después)
    alert('¡Reserva creada! (funcionalidad pendiente de implementar)');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando asientos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !flightData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600 mb-4">❌ {error || 'No se pudo cargar la información del vuelo'}</p>
            <button
              onClick={() => navigate('/vuelos/buscar')}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90"
            >
              Volver a búsqueda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <FlightInfo
        from={flightData.origen?.codigo || 'CDMX'}
        to={flightData.destino?.codigo || 'MXL'}
        date="15 de Diciembre, 2024"
        time="14:30 - 16:45"
        duration={flightData.duracion || '2h 15m'}
        price={`$${flightData.precio?.toLocaleString() || '2,450'}`}
        flightNumber={flightData.numeroVuelo || 'AM 1234'}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seat Map */}
          <div className="lg:col-span-2">
            <SeatMap
              selectedSeat={selectedSeat}
              onSeatSelect={handleSeatSelect}
              occupiedSeats={occupiedSeats}
            />
          </div>

          {/* Passenger Form */}
          <div className="lg:col-span-1">
            <PassengerForm
              selectedSeat={selectedSeat}
              formData={formData}
              onFormChange={setFormData}
              flightPrice={`$${flightData.precio?.toLocaleString() || '2,450'}`}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}