import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usersService, postsService } from '../../services/api';
import usePageTitle from '../../hooks/usePageTitle';
import './Dashboard.css';

const Dashboard = () => {
  usePageTitle('Dashboard');
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    myPosts: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        if (isAdmin()) {
          // Admin vê estatísticas gerais
          const [usersData, postsData] = await Promise.all([
            usersService.getAllUsers(),
            postsService.getPosts({ page: 1, limit: 5 })
          ]);
          
          setStats({
            totalUsers: Array.isArray(usersData) ? usersData.length : 0,
            totalPosts: postsData?.total || 0,
            myPosts: Array.isArray(postsData?.data) ? postsData.data.filter(p => p.author?.id === user?.id).length : 0
          });
          setRecentPosts(Array.isArray(postsData?.data) ? postsData.data : []);
        } else {
          // Colaborador vê apenas suas estatísticas
          const myPostsData = await postsService.getPosts({ page: 1, limit: 5 });
          
          setStats({
            totalUsers: 0, // Colaborador não vê total de usuários
            totalPosts: 0,  // Colaborador não vê total geral de posts
            myPosts: myPostsData?.total || 0
          });
          setRecentPosts(Array.isArray(myPostsData?.data) ? myPostsData.data : []);
        }
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        setError('Erro ao carregar dados: ' + (error.response?.data?.message || error.message));
        // Reset para valores seguros em caso de erro
        setRecentPosts([]);
        setStats({
          totalUsers: 0,
          totalPosts: 0,
          myPosts: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, isAdmin]);

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
            <span className="user-role">
              {user?.role === 'admin' ? '👑 Administrador' : '👤 Colaborador'}
            </span>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="stats-grid">
            {isAdmin() && (
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>{stats.totalUsers}</h3>
                  <p>Usuários Cadastrados</p>
                </div>
              </div>
            )}
            
            {isAdmin() && (
              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-content">
                  <h3>{stats.totalPosts}</h3>
                  <p>Total de Postagens</p>
                </div>
              </div>
            )}
            
            <div className="stat-card">
              <div className="stat-icon">📄</div>
              <div className="stat-content">
                <h3>{stats.myPosts}</h3>
                <p>Minhas Postagens</p>
              </div>
            </div>
          </div>

          <div className="recent-section">
            <h3>{isAdmin() ? 'Postagens Recentes' : 'Minhas Postagens Recentes'}</h3>
            
            {loading && (
              <div className="loading">Carregando...</div>
            )}
            
            {error && (
              <div className="error-message">{error}</div>
            )}
            
            {!loading && !error && Array.isArray(recentPosts) && recentPosts.length === 0 && (
              <div className="no-data">
                {isAdmin() ? 'Nenhuma postagem encontrada' : 'Você ainda não criou nenhuma postagem'}
              </div>
            )}
            
            {!loading && !error && Array.isArray(recentPosts) && recentPosts.length > 0 && (
              <div className="posts-list">
                {recentPosts.map((post) => (
                  <div key={post.id} className="post-item">
                    <h4>{post.title || 'Sem título'}</h4>
                    <p className="post-meta">
                      Por: {post.author?.name || 'Usuário desconhecido'} • {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="post-excerpt">
                      {post.body && post.body.length > 100 
                        ? post.body.substring(0, 100) + '...' 
                        : post.body || 'Sem conteúdo'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;