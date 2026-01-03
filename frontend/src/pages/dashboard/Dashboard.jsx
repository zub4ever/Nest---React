import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usersService } from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await usersService.getAllUsers();
        setUsers(usersData);
      } catch (error) {
        setError('Erro ao carregar usuários: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <div className="user-info">
            <span>Olá, {user?.name}!</span>
            <button onClick={handleLogout} className="logout-button">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="welcome-card">
            <h2>Bem-vindo ao Sistema!</h2>
            <p>Você está logado como: <strong>{user?.email}</strong></p>
            <p>Conta criada em: <strong>{new Date(user?.createdAt).toLocaleDateString('pt-BR')}</strong></p>
          </div>

          <div className="users-section">
            <h3>Usuários Cadastrados</h3>
            
            {loading && (
              <div className="loading">Carregando usuários...</div>
            )}
            
            {error && (
              <div className="error-message">{error}</div>
            )}
            
            {!loading && !error && (
              <div className="users-grid">
                {users.length > 0 ? (
                  users.map((user) => (
                    <div key={user.id} className="user-card">
                      <h4>{user.name}</h4>
                      <p>{user.email}</p>
                      <small>
                        Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </small>
                    </div>
                  ))
                ) : (
                  <p>Nenhum usuário encontrado.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;