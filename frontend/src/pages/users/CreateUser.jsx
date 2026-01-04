import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { toast } from '../../services/notifications';
import Breadcrumbs from '../../components/Breadcrumbs';
import './css/CreateUser.css';

const CreateUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'colaborador'
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validações
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/users', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      toast.success('Usuário criado com sucesso!');
      navigate('/users');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error('Erro inesperado ao criar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <div className="create-user-container">
      <Breadcrumbs />
      <div className="create-user-header">
        <h1>Criar Novo Usuário</h1>
        <p>Preencha os dados para criar um novo usuário no sistema</p>
      </div>

      <div className="create-user-form-container">
        <form onSubmit={handleSubmit} className="create-user-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Nome completo *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Digite o nome completo"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="usuario@email.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Mínimo 6 caracteres"
                className="form-input"
              />
              <small className="form-hint">A senha deve ter pelo menos 6 caracteres</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar senha *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Digite a senha novamente"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Perfil *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="colaborador">👤 Colaborador</option>
                <option value="admin">👑 Administrador</option>
              </select>
              <small className="form-hint">
                Colaboradores só podem ver e editar seus próprios conteúdos. 
                Administradores têm acesso total ao sistema.
              </small>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleCancel}
              className="btn-cancel"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={isLoading}
            >
              {isLoading ? 'Criando usuário...' : '✅ Criar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;