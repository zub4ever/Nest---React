import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast, confirmDelete } from '../../services/notifications';
import Breadcrumbs from '../../components/Breadcrumbs';
import './css/Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    const confirmed = await confirmDelete(
      'Tem certeza?',
      `Você está prestes a deletar o usuário "${name}". Esta ação não pode ser desfeita.`
    );

    if (confirmed) {
      try {
        await api.delete(`/users/${id}`);
        setUsers(users.filter(user => user.id !== id));
        toast.success('Usuário deletado com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        toast.error('Erro ao deletar usuário');
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="users-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-container">
      <Breadcrumbs />
      <div className="users-header">
        <div className="header-content">
         {/* <div className="header-title">
            <span className="title-main">Gerenciar Usuários</span> <br />
            <span className="title-subtitle">Visualize e gerencie todos os usuários do sistema</span>
          </div>
           */}
        </div>
        <button 
          className="btn-create-user"
          onClick={() => navigate('/create-user')}
        >
          <span className="btn-icon">➕</span>
          Criar Usuário
        </button>
      </div>

      <div className="users-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar usuários por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="users-count">
          <span>{filteredUsers.length} usuário(s) encontrado(s)</span>
        </div>
      </div>

      <div className="users-table-container">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>Nenhum usuário encontrado</h3>
            <p>
              {searchTerm ? 
                'Nenhum usuário corresponde aos critérios de busca.' : 
                'Ainda não há usuários cadastrados no sistema.'
              }
            </p>
            {!searchTerm && (
              <button 
                className="btn-empty-action"
                onClick={() => navigate('/create-user')}
              >
                Criar primeiro usuário
              </button>
            )}
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Data de Criação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <span className="user-id">#{user.id}</span>
                  </td>
                  <td>
                    <div className="user-info">
                      <span className="user-avatar">👤</span>
                      <span className="user-name">{user.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="user-email">{user.email}</span>
                  </td>
                  <td>
                    <span className="user-date">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  <td>
                    <div className="user-actions">
                      <button 
                        className="btn-edit"
                        onClick={() => navigate(`/edit-user/${user.id}`)}
                        title="Editar usuário"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        title="Deletar usuário"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Users;