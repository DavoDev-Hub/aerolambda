import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import FlightSearchResults from '@/pages/FlightSearchResults';
import SeatSelection from '@/pages/SeatSelection';
import AuthPage from '@/pages/AuthPage';
import CheckoutPage from '@/pages/CheckoutPage';
import ConfirmationPage from '@/pages/ConfirmationPage';
import MyBookingsPage from '@/pages/MyBookingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/vuelos/buscar" element={<FlightSearchResults />} />
        <Route path="/vuelos/:vueloId/asientos" element={<SeatSelection />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/reservas/:reservaId/pago" element={<CheckoutPage />} />
        <Route path="/reservas/:reservaId/confirmacion" element={<ConfirmationPage />} />
        <Route path="/mis-reservas" element={<MyBookingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;