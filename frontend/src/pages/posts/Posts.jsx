import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from '../../services/notifications';
import './css/Posts.css';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      toast.error('Erro ao carregar posts');
    } finally {
      setLoading(false);
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
                <div className="post-meta">
                  <span className="post-author">👤 {post.author.name}</span>
                  <span className="post-date">📅 {formatDate(post.createdAt)}</span>
                </div>
              </div>
              
              <div className="post-body">
                {post.body.length > 200 ? (
                  <>
                    {post.body.substring(0, 200)}...
                    <button className="read-more">Ler mais</button>
                  </>
                ) : (
                  post.body
                )}
              </div>

              {(post.imageAttachments?.length > 0 || post.pdfAttachments?.length > 0) && (
                <div className="post-attachments">
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
    </div>
  );
};

export default Posts;