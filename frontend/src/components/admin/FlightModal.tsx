import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

interface FlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (flightData: FlightFormData) => Promise<void>;
  flight?: Flight | null;
  mode: 'create' | 'edit';
}

export interface Flight {
  _id: string;
  numeroVuelo: string;
  aerolinea: string;
  origen: {
    ciudad: string;
    codigo: string;
    aeropuerto: string;
  };
  destino: {
    ciudad: string;
    codigo: string;
    aeropuerto: string;
  };
  fechaSalida: string;
  horaSalida: string;
  fechaLlegada: string;
  horaLlegada: string;
  duracion: string;
  precio: number;
  capacidadTotal: number;
  asientosDisponibles: number;
  estado: string;
  tipoVuelo: string;
}

export interface FlightFormData {
  numeroVuelo: string;
  aerolinea: string;
  origen: {
    ciudad: string;
    codigo: string;
    aeropuerto: string;
  };
  destino: {
    ciudad: string;
    codigo: string;
    aeropuerto: string;
  };
  fechaSalida: string;
  horaSalida: string;
  fechaLlegada: string;
  horaLlegada: string;
  duracion: string;
  precio: number;
  capacidadTotal: number;
  estado: string;
  tipoVuelo: string;
}

const ciudadesMexicanas = [
  { nombre: 'Ciudad de México', codigo: 'MEX', aeropuerto: 'Aeropuerto Internacional Benito Juárez' },
  { nombre: 'Cancún', codigo: 'CUN', aeropuerto: 'Aeropuerto Internacional de Cancún' },
  { nombre: 'Guadalajara', codigo: 'GDL', aeropuerto: 'Aeropuerto Internacional Miguel Hidalgo' },
  { nombre: 'Monterrey', codigo: 'MTY', aeropuerto: 'Aeropuerto Internacional Mariano Escobedo' },
  { nombre: 'Tijuana', codigo: 'TIJ', aeropuerto: 'Aeropuerto Internacional General Abelardo L. Rodríguez' },
  { nombre: 'Los Cabos', codigo: 'SJD', aeropuerto: 'Aeropuerto Internacional de Los Cabos' },
  { nombre: 'Puerto Vallarta', codigo: 'PVR', aeropuerto: 'Aeropuerto Internacional Lic. Gustavo Díaz Ordaz' },
  { nombre: 'Mazatlán', codigo: 'MZT', aeropuerto: 'Aeropuerto Internacional General Rafael Buelna' },
];

export default function FlightModal({ isOpen, onClose, onSave, flight, mode }: FlightModalProps) {
  const [formData, setFormData] = useState<FlightFormData>({
    numeroVuelo: '',
    aerolinea: 'AeroLambda',
    origen: { ciudad: '', codigo: '', aeropuerto: '' },
    destino: { ciudad: '', codigo: '', aeropuerto: '' },
    fechaSalida: '',
    horaSalida: '',
    fechaLlegada: '',
    horaLlegada: '',
    duracion: '',
    precio: 0,
    capacidadTotal: 180,
    estado: 'programado',
    tipoVuelo: 'directo',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (flight && mode === 'edit') {
      setFormData({
        numeroVuelo: flight.numeroVuelo,
        aerolinea: flight.aerolinea,
        origen: flight.origen,
        destino: flight.destino,
        fechaSalida: flight.fechaSalida.split('T')[0],
        horaSalida: flight.horaSalida,
        fechaLlegada: flight.fechaLlegada.split('T')[0],
        horaLlegada: flight.horaLlegada,
        duracion: flight.duracion,
        precio: flight.precio,
        capacidadTotal: flight.capacidadTotal,
        estado: flight.estado,
        tipoVuelo: flight.tipoVuelo,
      });
    } else {
      // Reset form for create mode
      setFormData({
        numeroVuelo: '',
        aerolinea: 'AeroLambda',
        origen: { ciudad: '', codigo: '', aeropuerto: '' },
        destino: { ciudad: '', codigo: '', aeropuerto: '' },
        fechaSalida: '',
        horaSalida: '',
        fechaLlegada: '',
        horaLlegada: '',
        duracion: '',
        precio: 0,
        capacidadTotal: 180,
        estado: 'programado',
        tipoVuelo: 'directo',
      });
    }
  }, [flight, mode, isOpen]);

  const handleOrigenChange = (codigo: string) => {
    const ciudad = ciudadesMexicanas.find(c => c.codigo === codigo);
    if (ciudad) {
      setFormData({
        ...formData,
        origen: {
          ciudad: ciudad.nombre,
          codigo: ciudad.codigo,
          aeropuerto: ciudad.aeropuerto,
        },
      });
    }
  };

  const handleDestinoChange = (codigo: string) => {
    const ciudad = ciudadesMexicanas.find(c => c.codigo === codigo);
    if (ciudad) {
      setFormData({
        ...formData,
        destino: {
          ciudad: ciudad.nombre,
          codigo: ciudad.codigo,
          aeropuerto: ciudad.aeropuerto,
        },
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.origen.codigo || !formData.destino.codigo) {
      alert('Por favor selecciona origen y destino');
      return;
    }

    setSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving flight:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Crear Nuevo Vuelo' : 'Editar Vuelo'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numeroVuelo">Número de Vuelo *</Label>
              <Input
                id="numeroVuelo"
                value={formData.numeroVuelo}
                onChange={(e) => setFormData({ ...formData, numeroVuelo: e.target.value })}
                placeholder="AL-2102"
                required
              />
            </div>

            <div>
              <Label htmlFor="aerolinea">Aerolínea *</Label>
              <Input
                id="aerolinea"
                value={formData.aerolinea}
                onChange={(e) => setFormData({ ...formData, aerolinea: e.target.value })}
                placeholder="AeroLambda"
                required
              />
            </div>
          </div>

          {/* Origen y Destino */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="origen">Origen *</Label>
              <select
                id="origen"
                value={formData.origen.codigo}
                onChange={(e) => handleOrigenChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Seleccionar origen</option>
                {ciudadesMexicanas.map(ciudad => (
                  <option key={ciudad.codigo} value={ciudad.codigo}>
                    {ciudad.nombre} ({ciudad.codigo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="destino">Destino *</Label>
              <select
                id="destino"
                value={formData.destino.codigo}
                onChange={(e) => handleDestinoChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Seleccionar destino</option>
                {ciudadesMexicanas.map(ciudad => (
                  <option key={ciudad.codigo} value={ciudad.codigo}>
                    {ciudad.nombre} ({ciudad.codigo})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fechas y Horas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fechaSalida">Fecha de Salida *</Label>
              <Input
                id="fechaSalida"
                type="date"
                value={formData.fechaSalida}
                onChange={(e) => setFormData({ ...formData, fechaSalida: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <Label htmlFor="horaSalida">Hora de Salida *</Label>
              <Input
                id="horaSalida"
                type="time"
                value={formData.horaSalida}
                onChange={(e) => setFormData({ ...formData, horaSalida: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="fechaLlegada">Fecha de Llegada *</Label>
              <Input
                id="fechaLlegada"
                type="date"
                value={formData.fechaLlegada}
                onChange={(e) => setFormData({ ...formData, fechaLlegada: e.target.value })}
                min={formData.fechaSalida || new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <Label htmlFor="horaLlegada">Hora de Llegada *</Label>
              <Input
                id="horaLlegada"
                type="time"
                value={formData.horaLlegada}
                onChange={(e) => setFormData({ ...formData, horaLlegada: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Duración, Precio y Capacidad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="duracion">Duración *</Label>
              <Input
                id="duracion"
                value={formData.duracion}
                onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                placeholder="5h 30m"
                required
              />
            </div>

            <div>
              <Label htmlFor="precio">Precio (MXN) *</Label>
              <Input
                id="precio"
                type="number"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <Label htmlFor="capacidadTotal">Capacidad Total *</Label>
              <Input
                id="capacidadTotal"
                type="number"
                value={formData.capacidadTotal}
                onChange={(e) => setFormData({ ...formData, capacidadTotal: parseInt(e.target.value) })}
                min="1"
                max="200"
                required
              />
            </div>
          </div>

          {/* Estado y Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estado">Estado *</Label>
              <select
                id="estado"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                required
              >
                <option value="programado">Programado</option>
                <option value="en_vuelo">En Vuelo</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
                <option value="retrasado">Retrasado</option>
              </select>
            </div>

            <div>
              <Label htmlFor="tipoVuelo">Tipo de Vuelo *</Label>
              <select
                id="tipoVuelo"
                value={formData.tipoVuelo}
                onChange={(e) => setFormData({ ...formData, tipoVuelo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                required
              >
                <option value="directo">Directo</option>
                <option value="1_escala">1 Escala</option>
                <option value="2_escalas">2 Escalas</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : mode === 'create' ? 'Crear Vuelo' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}