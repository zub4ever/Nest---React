import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import api from '../../services/api';
import { toast } from '../../services/notifications';
import './css/EditPost.css';

const EditPost = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    imageFiles: [], // Novos arquivos selecionados para upload
    pdfFiles: [], // Novos arquivos selecionados para upload
    imageAttachments: [], // URLs existentes + novas
    pdfAttachments: [] // URLs existentes + novas
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      setInitialLoading(true);
      const response = await api.get(`/posts/${id}`);
      const post = response.data;
      
      setFormData({
        title: post.title,
        body: post.body,
        imageFiles: [],
        pdfFiles: [],
        imageAttachments: post.imageAttachments || [],
        pdfAttachments: post.pdfAttachments || []
      });
    } catch (error) {
      console.error('Erro ao carregar postagem:', error);
      toast.error('Erro ao carregar postagem');
      navigate('/posts');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValid = file.type === 'image/png' || file.type === 'image/jpeg';
      if (!isValid) {
        toast.error(`Arquivo ${file.name} não é PNG ou JPEG`);
      }
      return isValid;
    });

    if (validFiles.length === 0) return;

    setFormData(prev => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...validFiles]
    }));
    
    toast.success(`${validFiles.length} imagem(ns) selecionada(s)`);
  };

  const handlePdfUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValid = file.type === 'application/pdf';
      if (!isValid) {
        toast.error(`Arquivo ${file.name} não é PDF`);
      }
      return isValid;
    });

    if (validFiles.length === 0) return;

    setFormData(prev => ({
      ...prev,
      pdfFiles: [...prev.pdfFiles, ...validFiles]
    }));
    
    toast.success(`${validFiles.length} PDF(s) selecionado(s)`);
  };

  const removeImageAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      imageAttachments: prev.imageAttachments.filter((_, i) => i !== index)
    }));
  };

  const removePdfAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      pdfAttachments: prev.pdfAttachments.filter((_, i) => i !== index)
    }));
  };

  const getImageUrl = (imageUrl) => {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `http://localhost:3000${imageUrl}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.body?.trim()) {
      toast.error('Título e conteúdo são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      let imageUrls = [...formData.imageAttachments];
      let pdfUrls = [...formData.pdfAttachments];

      // Upload de novas imagens se existirem
      if (formData.imageFiles.length > 0) {
        const imageFormData = new FormData();
        formData.imageFiles.forEach(file => {
          imageFormData.append('images', file);
        });

        const imageResponse = await api.post('/upload/images', imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (imageResponse.data.success) {
          imageUrls = [...imageUrls, ...imageResponse.data.urls];
        }
      }

      // Upload de novos PDFs se existirem
      if (formData.pdfFiles.length > 0) {
        const pdfFormData = new FormData();
        formData.pdfFiles.forEach(file => {
          pdfFormData.append('pdfs', file);
        });

        const pdfResponse = await api.post('/upload/pdfs', pdfFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (pdfResponse.data.success) {
          pdfUrls = [...pdfUrls, ...pdfResponse.data.urls];
        }
      }

      // Atualizar post com URLs dos arquivos
      const postData = {
        title: formData.title,
        body: formData.body,
        imageAttachments: imageUrls,
        pdfAttachments: pdfUrls,
      };

      await api.put(`/posts/${id}`, postData);
      toast.success('Postagem atualizada com sucesso!');
      navigate('/posts');
    } catch (error) {
      console.error('Erro ao atualizar postagem:', error);
      
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          toast.error('Postagem não encontrada');
        } else if (status === 403) {
          toast.error('Você não tem permissão para editar esta postagem');
        } else {
          toast.error(error.response.data?.message || 'Erro ao atualizar postagem');
        }
      } else {
        toast.error('Erro ao conectar com o servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="edit-post-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="edit-post-container">
      <div className="edit-post-header">
        <h1>Editar Postagem</h1>
        <button type="button" onClick={() => navigate('/posts')} className="btn-cancel">
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="edit-post-form">
        <div className="form-group">
          <label htmlFor="title">Título *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Digite o título da postagem"
            maxLength="255"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="body">Corpo da Mensagem *</label>
          <MDEditor
            value={formData.body}
            onChange={(value) => setFormData(prev => ({ ...prev, body: value || '' }))}
            preview="edit"
            height={500}
            visibleDragBar={false}
            data-color-mode="light"
            textareaProps={{
              placeholder: 'Digite o conteúdo da postagem usando Markdown...',
              style: { fontSize: '14px', lineHeight: '1.5' }
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="imageUpload">Anexos de Imagem (PNG/JPEG)</label>
          <input
            type="file"
            id="imageUpload"
            multiple
            accept=".png,.jpeg,.jpg"
            onChange={handleImageUpload}
          />
          {formData.imageAttachments.length > 0 && (
            <div className="attachments-preview">
              <h4>Imagens anexadas:</h4>
              {formData.imageAttachments.map((image, index) => (
                <div key={index} className="attachment-item">
                  <img 
                    src={getImageUrl(image)} 
                    alt={`Anexo ${index + 1}`} 
                    className="image-preview"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'inline';
                    }}
                  />
                  <span style={{display: 'none', color: '#666'}}>Imagem não disponível</span>
                  <button 
                    type="button" 
                    onClick={() => removeImageAttachment(index)} 
                    className="remove-attachment"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="pdfUpload">Anexos PDF</label>
          <input
            type="file"
            id="pdfUpload"
            multiple
            accept=".pdf"
            onChange={handlePdfUpload}
          />
          {formData.pdfAttachments.length > 0 && (
            <div className="attachments-preview">
              <h4>PDFs anexados:</h4>
              {formData.pdfAttachments.map((pdf, index) => (
                <div key={index} className="attachment-item pdf-item">
                  <span className="pdf-name">📄 PDF {index + 1}</span>
                  <button 
                    type="button" 
                    onClick={() => removePdfAttachment(index)} 
                    className="remove-attachment"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-buttons">
          <button type="button" onClick={() => navigate('/posts')} className="btn-cancel">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Salvando...' : 'Atualizar Postagem'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;