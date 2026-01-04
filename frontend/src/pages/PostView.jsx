import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import api from '../services/api';
import usePageTitle from '../hooks/usePageTitle';
import './css/PostView.css';

const PostView = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Atualiza o título da página baseado no post
  usePageTitle(post ? post.title : 'Carregando postagem...');

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/public/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error('Erro ao carregar post:', error);
      setError('Post não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getImageUrl = (imageUrl) => {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `http://localhost:3000${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="post-view-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Carregando postagem...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="post-view-container">
        <div className="error-message">
          <h2>😔 Post não encontrado</h2>
          <p>A postagem que você procura pode ter sido removida ou não existe.</p>
          <Link to="/feed" className="back-button">
            ← Voltar ao Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="post-view-container">
      <header className="post-view-header">
        <Link to="/feed" className="back-link">
          ← Voltar ao Feed
        </Link>
        <div className="site-info">
          <h1>De olho no pirarucu 📰</h1>
        </div>
      </header>

      <article className="post-view-content">
        <div className="post-category">📰 Postagem</div>
        
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            <div className="author-info">
              <span className="author-name">Por {post.author.name}</span>
            </div>
            <time className="post-date">{formatDate(post.createdAt)}</time>
          </div>
        </header>

        <div className="post-body">
          <MDEditor.Markdown 
            source={post.body} 
            style={{ backgroundColor: 'transparent' }}
          />
        </div>

        {(post.imageAttachments?.length > 0 || post.pdfAttachments?.length > 0) && (
          <section className="post-attachments">
            <h3>📎 Anexos</h3>
            
            {post.imageAttachments?.length > 0 && (
              <div className="image-attachments">
                <h4>🖼️ Imagens</h4>
                <div className="images-grid">
                  {post.imageAttachments.map((image, index) => (
                    <div key={index} className="image-card">
                      <img 
                        src={getImageUrl(image)} 
                        alt={`Anexo ${index + 1}`} 
                        className="attachment-image"
                        onClick={() => window.open(getImageUrl(image), '_blank')}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="image-placeholder" style={{ display: 'none' }}>
                        <span className="placeholder-icon">🖼️</span>
                        <span>Imagem {index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {post.pdfAttachments?.length > 0 && (
              <div className="pdf-attachments">
                <h4>📄 Documentos PDF</h4>
                <div className="pdf-list">
                  {post.pdfAttachments.map((pdf, index) => (
                    <div key={index} className="pdf-card">
                      <div className="pdf-icon">📄</div>
                      <div className="pdf-info">
                        <span className="pdf-name">Documento {index + 1}</span>
                        <a 
                          href={getImageUrl(pdf)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="pdf-download"
                        >
                          Baixar PDF
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </article>

      <footer className="post-view-footer">
        <Link to="/feed" className="back-button">
          ← Voltar ao Feed
        </Link>
      </footer>
    </div>
  );
};

export default PostView;