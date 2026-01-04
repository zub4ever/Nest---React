import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import api from '../services/api';
import usePageTitle from '../hooks/usePageTitle';
import './css/PublicFeed.css';

const PublicFeed = () => {
  usePageTitle('Feed Público');
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  useEffect(() => {
    fetchPublicPosts(pagination.page);
  }, []);

  const fetchPublicPosts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/public/feed?page=${page}&limit=10`);
      setPosts(response.data.data);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total
      });
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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(pagination.total / pagination.limit)) {
      setPagination(prev => ({ ...prev, page: newPage }));
      fetchPublicPosts(newPage);
      window.scrollTo(0, 0);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

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
          <div className="site-title-container">
            <img 
              src="/imagens/pirarucu.png" 
              alt="Pirarucu" 
              className="site-logo"
            />
            <h1 className="site-title">De olho no pirarucu</h1>
          </div>
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
                  <Link to={`/feed/${posts[0].id}`} className="featured-title-link">
                    <h2 className="featured-title">{posts[0].title}</h2>
                  </Link>
                  <div className="featured-meta">
                    <span className="author">Por {posts[0].author.name}</span>
                    <span className="date">{formatDate(posts[0].createdAt)}</span>
                  </div>
                  <div className="featured-body">
                    <MDEditor.Markdown 
                      source={truncateText(posts[0].body, 500)} 
                      style={{ backgroundColor: 'transparent' }}
                    />
                  </div>
                  {renderAttachments(posts[0], true)}
                  <Link to={`/feed/${posts[0].id}`} className="read-more-button">
                    Ler postagem completa →
                  </Link>
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
                        <Link to={`/feed/${post.id}`} className="card-title-link">
                          <h4 className="card-title">{post.title}</h4>
                        </Link>
                        <div className="card-meta">
                          <span className="card-author">👤 {post.author.name}</span>
                          <span className="card-date">📅 {formatDate(post.createdAt)}</span>
                        </div>
                        <div className="card-body">
                          <MDEditor.Markdown 
                            source={truncateText(post.body, 150)} 
                            style={{ backgroundColor: 'transparent' }}
                          />
                        </div>
                        {renderAttachments(post, false)}
                        <Link to={`/feed/${post.id}`} className="read-more-card">
                          Ler mais →
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Paginação */}
            {totalPages > 1 && (
              <section className="pagination-section">
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