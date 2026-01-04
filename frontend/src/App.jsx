import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Users from './pages/users/Users';
import CreateUser from './pages/users/CreateUser';
import Posts from './pages/posts/Posts';
import CreatePost from './pages/posts/CreatePost';
import EditPost from './pages/posts/EditPost';
import PublicFeed from './pages/PublicFeed';
import PostView from './pages/PostView';
import Layout from './components/Layout';
import './App.css';

function App() {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Carregando aplicação...</div>
      </div>
    );
  }

  // Componente para redirecionar na raiz baseado na autenticação
  const RootRedirect = () => {
    return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
  };

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/feed" element={<PublicFeed />} />
        <Route path="/feed/:id" element={<PostView />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
        </Route>
        <Route 
          path="/posts" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Posts />} />
        </Route>
        <Route 
          path="/create-post" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CreatePost />} />
        </Route>
        <Route 
          path="/posts/:id/edit" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<EditPost />} />
        </Route>
        <Route 
          path="/users" 
          element={
            <ProtectedRoute requireAdmin>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Users />} />
        </Route>
        <Route 
          path="/create-user" 
          element={
            <ProtectedRoute requireAdmin>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CreateUser />} />
        </Route>
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </div>
  );
}

export default App;
