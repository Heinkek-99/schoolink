import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import FamillesPage from '@/pages/familles/FamillesPage';
import FamilleDetail from '@/pages/familles/FamilleDetail';
import ElevesPage from '@/pages/eleves/ElevesPage';
import EleveDetail from '@/pages/eleves/EleveDetail';
import EleveCreate from '@/pages/eleves/EleveCreate';
import FinancesPage from '@/pages/finances/FinancesPage';
import PaiementCreate from '@/pages/finances/PaiementCreate';
import AcademiquePage from '@/pages/academique/AcademiquePage';
import SettingsPage from '@/pages/settings/SettingsPage';
import NotFound from '@/pages/NotFound';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
      <Route path="/familles" element={<ProtectedRoute><AppLayout><FamillesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/familles/:id" element={<ProtectedRoute><AppLayout><FamilleDetail /></AppLayout></ProtectedRoute>} />
      <Route path="/eleves" element={<ProtectedRoute><AppLayout><ElevesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/eleves/nouveau" element={<ProtectedRoute><AppLayout><EleveCreate /></AppLayout></ProtectedRoute>} />
      <Route path="/eleves/:id" element={<ProtectedRoute><AppLayout><EleveDetail /></AppLayout></ProtectedRoute>} />
      <Route path="/finances" element={<ProtectedRoute><AppLayout><FinancesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/finances/paiement" element={<ProtectedRoute><AppLayout><PaiementCreate /></AppLayout></ProtectedRoute>} />
      <Route path="/academique" element={<ProtectedRoute><AppLayout><AcademiquePage /></AppLayout></ProtectedRoute>} />
      <Route path="/parametres" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
