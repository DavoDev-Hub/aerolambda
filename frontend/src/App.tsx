import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import FlightSearchResults from '@/pages/FlightSearchResults';
import SeatSelection from '@/pages/SeatSelection';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/vuelos/buscar" element={<FlightSearchResults />} />
        <Route path="/vuelos/:vueloId/asientos" element={<SeatSelection />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;