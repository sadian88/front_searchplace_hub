import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import ScrapingForm from './pages/ScrapingForm';
import Executions from './pages/Executions';
import ExecutionDetails from './pages/ExecutionDetails';
import PlaceDetail from './pages/PlaceDetail';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/leads" element={<PrivateRoute><Leads /></PrivateRoute>} />
          <Route path="/places/:id" element={<PrivateRoute><PlaceDetail /></PrivateRoute>} />
          <Route path="/scraping" element={<PrivateRoute><ScrapingForm /></PrivateRoute>} />
          <Route path="/executions" element={<PrivateRoute><Executions /></PrivateRoute>} />
          <Route path="/executions/:id" element={<PrivateRoute><ExecutionDetails /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
