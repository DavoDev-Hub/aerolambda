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
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [flightData, setFlightData] = useState<any>(null);
  const [seatsData, setSeatsData] = useState<Seat[]>([]);

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
          setSeatsData(data.data.asientos);
          
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
    
    // Buscar el ID del asiento seleccionado
    const seatObj = seatsData.find(s => s.numero === seat);
    if (seatObj) {
      setSelectedSeatId(seatObj._id);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSeat || !selectedSeatId) {
      alert('Por favor selecciona un asiento');
      return;
    }

    // Validar formulario
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.documentNumber) {
      alert('Por favor completa todos los campos del formulario');
      return;
    }

    try {
      setSubmitting(true);

      // Obtener token (asumiendo que lo tienes en localStorage)
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Debes iniciar sesión para hacer una reserva');
        navigate('/login');
        return;
      }

      // Crear reserva en el backend
      const response = await fetch('/api/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vueloId: vueloId,
          asientoId: selectedSeatId,
          pasajero: {
            nombre: formData.firstName,
            apellido: formData.lastName,
            email: formData.email,
            telefono: formData.phone,
            tipoDocumento: formData.documentType,
            numeroDocumento: formData.documentNumber
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear la reserva');
      }

      if (data.success) {
        // Guardar ID de reserva para la siguiente página
        const reservaId = data.data._id;
        
        // Navegar a página de pago (la crearemos después)
        alert(`¡Reserva creada exitosamente! Código: ${data.data.codigoReserva}\nTienes 15 minutos para completar el pago.`);
        
        // Por ahora, redirigir a la página de búsqueda
        // TODO: Crear página de checkout/pago
        navigate(`/reservas/${reservaId}/pago`);
      } else {
        throw new Error(data.message || 'Error al crear la reserva');
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error creating booking:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
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
        date={new Date(flightData.fechaSalida).toLocaleDateString('es-MX', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        })}
        time={`${flightData.horaSalida} - ${flightData.horaLlegada}`}
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
            
            {submitting && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-blue-600">Creando reserva...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}