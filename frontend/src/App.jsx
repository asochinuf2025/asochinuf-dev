import React, { Suspense, lazy } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load non-critical routes for better performance
const Home = lazy(() => import('./components/Home'));
const Inicio = lazy(() => import('./pages/Inicio'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));

// Loading fallback component
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div>Cargando...</div>
  </div>
);

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Suspense fallback={<LoadingFallback />}><Home /></Suspense>} />
            <Route path="/restablecer-contrasena" element={<Suspense fallback={<LoadingFallback />}><ResetPassword /></Suspense>} />
            <Route
              path="/dashboard"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <ProtectedRoute>
                    <Inicio />
                  </ProtectedRoute>
                </Suspense>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
