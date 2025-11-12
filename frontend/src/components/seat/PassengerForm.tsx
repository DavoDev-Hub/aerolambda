import { ArrowRight } from 'lucide-react';

interface PassengerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
}

interface PassengerFormProps {
  selectedSeat: string | null;
  formData: PassengerFormData;
  onFormChange: (data: PassengerFormData) => void;
  flightPrice: string;
  onSubmit: () => void;
}

export default function PassengerForm({ 
  selectedSeat, 
  formData, 
  onFormChange, 
  flightPrice,
  onSubmit 
}: PassengerFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFormChange({
      ...formData,
      [name]: value,
    });
  };

  const isFormValid =
    selectedSeat &&
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.phone &&
    formData.documentNumber;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      {/* Selected Seat */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <p className="text-sm text-gray-600 font-medium mb-2">Asiento seleccionado</p>
        <div className="text-4xl font-bold text-blue-600">{selectedSeat || '-'}</div>
      </div>

      {/* Passenger Form */}
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Juan"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="García"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="juan@ejemplo.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+52 55 1234 5678"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de documento</label>
          <select
            name="documentType"
            value={formData.documentType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="INE">INE</option>
            <option value="Pasaporte">Pasaporte</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número de documento</label>
          <input
            type="text"
            name="documentNumber"
            value={formData.documentNumber}
            onChange={handleChange}
            placeholder="1234567890"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </form>

      {/* Price Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Precio base</span>
          <span className="font-semibold text-gray-900">{flightPrice}</span>
        </div>
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
          <span className="text-gray-600">Selección de asiento</span>
          <span className="font-semibold text-gray-900">Incluido</span>
        </div>
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-blue-600">{flightPrice}</span>
        </div>
      </div>

      {/* CTA Button */}
      <button
        disabled={!isFormValid}
        onClick={onSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        Continuar con el pago
        <ArrowRight size={20} />
      </button>
    </div>
  );
}