import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import FlightSearchResults from './pages/FlightSearchResults';
import SeatSelection from './pages/SeatSelection';
import AuthPage from './pages/AuthPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFlights from './pages/admin/AdminFlights';
import AdminReservations from './pages/admin/AdminReservations';
import AdminReports from './pages/admin/AdminReports';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
          <Toaster position="top-right" />  {/* ← Agregar */}
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/vuelos/buscar" element={<FlightSearchResults />} />
        <Route path="/vuelos/:vueloId/asientos" element={<SeatSelection />} />
        <Route path="/login" element={<AuthPage />} />
        
        {/* Rutas de cliente (protegidas) */}
        import ProfilePage from './pages/ProfilePage';

// En las rutas:
        <Route 
          path="/perfil" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reservas/:reservaId/pago" 
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reservas/:reservaId/confirmacion" 
          element={
            <ProtectedRoute>
              <ConfirmationPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mis-reservas" 
          element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Rutas de admin (protegidas y solo para admin) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/vuelos" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminFlights />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reservas" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminReservations />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reportes" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminReports />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;