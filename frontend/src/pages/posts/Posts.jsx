import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import api from '../../services/api';
import { toast } from '../../services/notifications';
import usePageTitle from '../../hooks/usePageTitle';
import './css/Posts.css';

const Posts = () => {
  usePageTitle('Gerenciar Posts');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  const fetchPosts = async (page = 1) => {
    try {
      const response = await api.get(`/posts?page=${page}&limit=10`);
      setPosts(response.data.data);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total
      });
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      toast.error('Erro ao carregar posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(pagination.page);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(pagination.total / pagination.limit)) {
      setPagination(prev => ({ ...prev, page: newPage }));
      fetchPosts(newPage);
      window.scrollTo(0, 0);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const handleDelete = async (postId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta postagem?')) {
      return;
    }

    try {
      await api.delete(`/posts/${postId}`);
      toast.success('Postagem excluída com sucesso!');
      fetchPosts(); // Recarrega a lista
    } catch (error) {
      console.error('Erro ao excluir postagem:', error);
      toast.error('Erro ao excluir postagem');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Carregando posts...</div>;
  }

  return (
    <div className="posts-container">
      <div className="posts-header">
        <h1>Postagens</h1>
        <Link to="/create-post" className="btn btn-primary">
          ➕ Nova Postagem
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="no-posts">
          <p>Nenhuma postagem encontrada.</p>
          <Link to="/create-post" className="btn btn-primary">
            Criar primeira postagem
          </Link>
        </div>
      ) : (
        <div className="posts-list">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <h3 className="post-title">{post.title}</h3>
                <div className="post-actions">
                  <div className="post-meta">
                    <span className="post-author">👤 {post.author.name}</span>
                    <span className="post-date">📅 {formatDate(post.createdAt)}</span>
                  </div>
                  {user && user.id === post.author.id && (
                    <div className="post-buttons">
                      <Link 
                        to={`/posts/${post.id}/edit`} 
                        className="btn btn-edit"
                        title="Editar postagem"
                      >
                        ✏️
                      </Link>
                      <button 
                        onClick={() => handleDelete(post.id)} 
                        className="btn btn-delete"
                        title="Excluir postagem"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="post-body">
                {post.body.length > 200 ? (
                  <>
                    <MDEditor.Markdown 
                      source={post.body.substring(0, 200) + '...'} 
                      style={{ backgroundColor: 'transparent' }}
                    />
                    <button className="read-more">Ler mais</button>
                  </>
                ) : (
                  <MDEditor.Markdown 
                    source={post.body} 
                    style={{ backgroundColor: 'transparent' }}
                  />
                )}
              </div>

              {(post.imageAttachments?.length > 0 || post.pdfAttachments?.length > 0) && (
                <div className="post-attachment">
                  <h4>📎 Anexos:</h4>
                  {post.imageAttachments?.map((image, index) => (
                    <div key={index} className="attachment">
                      <span>🖼️ Imagem {index + 1}</span>
                      <a href={image} target="_blank" rel="noopener noreferrer">
                        Visualizar
                      </a>
                    </div>
                  ))}
                  {post.pdfAttachments?.map((pdf, index) => (
                    <div key={index} className="attachment">
                      <span>📄 PDF {index + 1}</span>
                      <a href={pdf} target="_blank" rel="noopener noreferrer">
                        Baixar
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="pagination-section">
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="pagination-button"
            >
              ← Anterior
            </button>
            
            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  return page === 1 || 
                         page === totalPages || 
                         Math.abs(page - pagination.page) <= 1;
                })
                .map((page, index, array) => (
                  <div key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="pagination-ellipsis">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`pagination-number ${
                        pagination.page === page ? 'active' : ''
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}
            </div>
            
            <button 
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === totalPages}
              className="pagination-button"
            >
              Próximo →
            </button>
          </div>
          
          <div className="pagination-info">
            Página {pagination.page} de {totalPages} | 
            Total: {pagination.total} postagens
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;