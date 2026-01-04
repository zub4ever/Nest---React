import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './css/PublicFeed.css';

const PublicFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicPosts();
  }, []);

  const fetchPublicPosts = async () => {
    try {
      const response = await api.get('/posts/public/feed');
      setPosts(response.data);
    } catch (error) {
      console.error('Erro ao carregar feed público:', error);
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

  const truncateText = (text, maxLength = 300) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderAttachments = (post, isFeatured = false) => {
    const hasAttachments = post.imageAttachments?.length > 0 || post.pdfAttachments?.length > 0;
    if (!hasAttachments) return null;

    return (
      <div className={`attachments-section ${isFeatured ? 'featured-attachments' : 'card-attachments'}`}>
        {/* Imagens em cards */}
        {post.imageAttachments?.length > 0 && (
          <div className="image-attachments">
            <h4 className="attachment-title">🖼️ Imagens</h4>
            <div className="images-grid">
              {post.imageAttachments.map((image, index) => {
                // Verificar se é uma URL blob (temporária) que não funciona mais
                const isBlobUrl = image.startsWith('blob:');
                const imageUrl = isBlobUrl ? '' : `http://localhost:3000${image}`;
                return (
                  <div key={index} className="image-card">
                    {isBlobUrl ? (
                      <div className="image-placeholder">
                        <div className="placeholder-content">
                          <span className="placeholder-icon">🖼️</span>
                          <span className="placeholder-text">Imagem {index + 1}</span>
                          <small className="placeholder-note">
                            Imagem não disponível<br />
                            (URL temporário expirado)
                          </small>
                        </div>
                      </div>
                    ) : (
                      <>
                        <img 
                          src={imageUrl} 
                          alt={`Anexo ${index + 1}`} 
                          className="attachment-image"
                          onClick={() => window.open(imageUrl, '_blank')}
                          onError={(e) => {
                            // Se a imagem falhar ao carregar, mostrar placeholder
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="image-error-placeholder" style={{ display: 'none' }}>
                          <div className="placeholder-content">
                            <span className="placeholder-icon">❌</span>
                            <span className="placeholder-text">Erro ao carregar</span>
                            <small className="placeholder-note">Imagem não encontrada</small>
                          </div>
                        </div>
                      </>
                    )}
                    {!isBlobUrl && (
                      <div className="image-overlay">
                        <button 
                          className="view-button"
                          onClick={() => window.open(imageUrl, '_blank')}
                        >
                          👁️ Ver
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PDFs com botão de download */}
        {post.pdfAttachments?.length > 0 && (
          <div className="pdf-attachments">
            <h4 className="attachment-title">📄 Documentos PDF</h4>
            <div className="pdf-list">
              {post.pdfAttachments.map((pdf, index) => {
                const isBlobUrl = pdf.startsWith('blob:');
                const pdfUrl = isBlobUrl ? '' : `http://localhost:3000${pdf}`;
                return (
                  <div key={index} className="pdf-item">
                    <div className="pdf-info">
                      <span className="pdf-icon">📄</span>
                      <span className="pdf-name">Documento {index + 1}</span>
                      {isBlobUrl && (
                        <small className="pdf-note">(URL temporário - não disponível para download)</small>
                      )}
                    </div>
                    {!isBlobUrl ? (
                      <button 
                        className="download-button"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = pdfUrl;
                          link.download = `documento_${index + 1}.pdf`;
                          link.click();
                        }}
                      >
                        ⬇️ Baixar
                      </button>
                    ) : (
                      <span className="download-disabled">❌ Indisponível</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="public-feed">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Carregando postagens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-feed">
      {/* Header do jornal */}
      <header className="feed-header">
        <div className="header-content">
          <h1 className="site-title">De olho no Pirarucu 📰</h1>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="feed-content">
        {posts.length === 0 ? (
          <div className="no-posts-public">
            <div className="no-posts-icon">📝</div>
            <h2>Nenhuma postagem ainda</h2>
            <p>Seja o primeiro a compartilhar algo interessante!</p>
            <Link to="/register" className="cta-button">
              Criar conta e postar
            </Link>
          </div>
        ) : (
          <>
            {/* Postagem principal (primeira) */}
            {posts.length > 0 && (
              <article className="featured-post">
                <div className="featured-content">
                  <div className="post-category">✨ Destaque</div>
                  <h2 className="featured-title">{posts[0].title}</h2>
                  <div className="featured-meta">
                    <span className="author">Por {posts[0].author.name}</span>
                    <span className="date">{formatDate(posts[0].createdAt)}</span>
                  </div>
                  <div className="featured-body">
                    {truncateText(posts[0].body, 500)}
                  </div>
                  {renderAttachments(posts[0], true)}
                </div>
              </article>
            )}

            {/* Lista de outras postagens */}
            {posts.length > 1 && (
              <section className="posts-grid">
                <h3 className="section-title">Outras Postagens</h3>
                <div className="grid">
                  {posts.slice(1).map((post) => (
                    <article key={post.id} className="post-card-public">
                      <div className="card-content">
                        <h4 className="card-title">{post.title}</h4>
                        <div className="card-meta">
                          <span className="card-author">👤 {post.author.name}</span>
                          <span className="card-date">📅 {formatDate(post.createdAt)}</span>
                        </div>
                        <p className="card-body">
                          {truncateText(post.body, 150)}
                        </p>
                        {renderAttachments(post, false)}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="feed-footer">
        <div className="footer-content">
          <p>&copy; 2026 Jornal Digital. Feito com ❤️ para a comunidade.</p>
          <div className="footer-links">
            <Link to="/login">Área Administrativa</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicFeed;