import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import FlightSearchResults from '@/pages/FlightSearchResults';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/vuelos/buscar" element={<FlightSearchResults />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;