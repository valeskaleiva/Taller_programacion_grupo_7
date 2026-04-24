// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Inventario } from './pages/Inventario';
import { Ventas } from './pages/Ventas';
import { Reportes } from './pages/Reportes';
import { Perfil } from './pages/Perfil';
import { NotFound } from './pages/NotFound';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <Layout>
                  <Home />
                </Layout>
              }
            />
            <Route
              path="/inventario"
              element={
                <Layout>
                  <Inventario />
                </Layout>
              }
            />
            <Route
              path="/ventas"
              element={
                <Layout>
                  <Ventas />
                </Layout>
              }
            />
            <Route
              path="/reportes"
              element={
                <Layout>
                  <Reportes />
                </Layout>
              }
            />
            <Route
              path="/perfil"
              element={
                <Layout>
                  <Perfil />
                </Layout>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
