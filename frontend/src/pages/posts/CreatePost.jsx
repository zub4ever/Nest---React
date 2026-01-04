import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from '../../services/notifications';
import './css/CreatePost.css';

const CreatePost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    imageFiles: [], // Arquivos selecionados para upload
    pdfFiles: [], // Arquivos selecionados para upload
    imageAttachments: [], // URLs após upload
    pdfAttachments: [] // URLs após upload
  });
  const [loading, setLoading] = useState(false);

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

    // Armazenar arquivos para upload posterior
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

    // Armazenar arquivos para upload posterior
    setFormData(prev => ({
      ...prev,
      pdfFiles: [...prev.pdfFiles, ...validFiles]
    }));
    
    toast.success(`${validFiles.length} PDF(s) selecionado(s)`);
  };

  const removeImageAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index)
    }));
  };

  const removePdfAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      pdfFiles: prev.pdfFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.body.trim()) {
      toast.error('Título e corpo da mensagem são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      let imageUrls = [];
      let pdfUrls = [];

      // Upload de imagens se existirem
      if (formData.imageFiles.length > 0) {
        const imageFormData = new FormData();
        formData.imageFiles.forEach(file => {
          imageFormData.append('images', file);
        });

        const imageResponse = await api.post('/upload/images', imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (imageResponse.data.success) {
          imageUrls = imageResponse.data.urls;
        }
      }

      // Upload de PDFs se existirem
      if (formData.pdfFiles.length > 0) {
        const pdfFormData = new FormData();
        formData.pdfFiles.forEach(file => {
          pdfFormData.append('pdfs', file);
        });

        const pdfResponse = await api.post('/upload/pdfs', pdfFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (pdfResponse.data.success) {
          pdfUrls = pdfResponse.data.urls;
        }
      }

      // Criar post com URLs dos arquivos
      const postData = {
        title: formData.title,
        body: formData.body,
        imageAttachments: imageUrls,
        pdfAttachments: pdfUrls,
      };

      await api.post('/posts', postData);
      toast.success('Postagem criada com sucesso!');
      navigate('/posts');
    } catch (error) {
      console.error('Erro ao criar postagem:', error);
      toast.error('Erro ao criar postagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-container">
      <div className="create-post-header">
        <h1>📝 Nova Postagem</h1>
        <button 
          type="button" 
          onClick={() => navigate('/posts')} 
          className="btn btn-secondary"
        >
          ← Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="create-post-form">
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
          <textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleInputChange}
            placeholder="Digite o conteúdo da postagem"
            rows="8"
            required
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
                <div key={index} className="attachment-item image-preview">
                  <img 
                    src={`http://localhost:3000${image}`} 
                    alt={`Imagem ${index + 1}`}
                    className="preview-image"
                  />
                  <div className="attachment-info">
                    <span>🖼️ Imagem {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeImageAttachment(index)}
                      className="remove-attachment"
                    >
                      ❌
                    </button>
                  </div>
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
          {formData.pdfFiles.length > 0 && (
            <div className="attachments-preview">
              <h4>PDFs selecionados:</h4>
              {formData.pdfFiles.map((file, index) => (
                <div key={index} className="attachment-item">
                  <span>📄 {file.name}</span>
                  <button
                    type="button"
                    onClick={() => removePdfAttachment(index)}
                    className="remove-attachment"
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Criando...' : '✓ Criar Postagem'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/posts')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;