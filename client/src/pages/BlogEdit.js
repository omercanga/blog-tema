import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Breadcrumbs,
  Chip,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import remarkGfm from 'remark-gfm';

// Quill modülleri ve formatları
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false
  }
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link', 'image'
];

const BlogEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [preview, setPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    featuredImage: 'https://picsum.photos/800/400',
    tags: []
  });

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          setError('Bu sayfaya erişim için giriş yapmanız gerekiyor.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:5001/api/blog/id/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setBlog(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Blog yazısı yüklenirken hata oluştu:', error);
        if (error.response?.status === 401) {
          setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        } else {
          setError('Blog yazısı yüklenirken bir hata oluştu.');
        }
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    } else {
      // Yeni blog yazısı oluşturma
      setBlog({
        title: '',
        content: '',
        excerpt: '',
        slug: '',
        featuredImage: 'https://picsum.photos/800/400',
        tags: [],
        status: 'draft'
      });
      setLoading(false);
    }
  }, [id]);

  const handleChange = (value) => {
    // React-Quill'in HTML çıktısını doğrudan kullan, dönüştürme yapma
    setBlog({ ...blog, content: value });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !blog.tags.includes(newTag.trim())) {
      setBlog({ ...blog, tags: [...blog.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setBlog({ ...blog, tags: blog.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        setSaving(false);
        return;
      }

      // Eğer excerpt boşsa, içerikten oluştur
      if (!blog.excerpt) {
        blog.excerpt = blog.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
      }

      // Eğer slug boşsa, başlıktan oluştur
      if (!blog.slug) {
        blog.slug = blog.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
      }

      if (id) {
        // Güncelleme
        await axios.put(`http://localhost:5001/api/blog/${id}`, blog, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSuccess('Blog yazısı başarıyla güncellendi.');
        navigate('/admin');
      } else {
        // Yeni oluşturma
        await axios.post('http://localhost:5001/api/blog', blog, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSuccess('Blog yazısı başarıyla oluşturuldu.');
        navigate('/admin');
      }
    } catch (error) {
      console.error('Blog yazısı kaydedilirken hata oluştu:', error);
      if (error.response?.status === 401) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      } else {
        setError(`Blog yazısı kaydedilirken bir hata oluştu: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !blog) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button component={Link} to="/admin" variant="contained" color="primary">
            Admin Paneline Dön
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          Ana Sayfa
        </Link>
        <Link to="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
          Admin Paneli
        </Link>
        <Typography color="text.primary">
          {id ? 'Blog Yazısını Düzenle' : 'Yeni Blog Yazısı'}
        </Typography>
      </Breadcrumbs>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {id ? 'Blog Yazısını Düzenle' : 'Yeni Blog Yazısı'}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Button 
            variant={preview ? "outlined" : "contained"} 
            onClick={() => setPreview(!preview)}
            sx={{ mr: 2 }}
          >
            {preview ? 'Düzenle' : 'Önizle'}
          </Button>
          <Button 
            component={Link} 
            to="/admin" 
            variant="outlined" 
            color="secondary"
          >
            İptal
          </Button>
        </Box>

        {preview ? (
          <Box>
            <Typography variant="h3" gutterBottom>
              {blog.title}
            </Typography>
            
            {blog.featuredImage && (
              <Box
                component="img"
                src={blog.featuredImage}
                alt={blog.title}
                sx={{ 
                  width: '100%', 
                  maxHeight: 400, 
                  objectFit: 'cover', 
                  mb: 4,
                  borderRadius: '8px'
                }}
              />
            )}
            
            {blog.tags && blog.tags.length > 0 && (
              <Box sx={{ mb: 4 }}>
                {blog.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
            
            <Divider sx={{ my: 4 }} />
            
            <Box sx={{ 
              '& img': { 
                maxWidth: '100%', 
                height: 'auto', 
                borderRadius: '8px', 
                my: 3,
                display: 'block',
                margin: '0 auto'
              },
              '& h1, & h2, & h3, & h4, & h5, & h6': { 
                mt: 4, 
                mb: 2,
                fontWeight: 700,
                color: '#242424',
                lineHeight: 1.25
              },
              '& h1': { fontSize: '2.5rem' },
              '& h2': { fontSize: '2rem' },
              '& h3': { fontSize: '1.75rem' },
              '& p': { 
                mb: 2.5, 
                lineHeight: 1.8,
                fontSize: '1.25rem',
                color: '#242424',
                letterSpacing: '-0.003em'
              },
              '& ul, & ol': { 
                mb: 2.5, 
                pl: 3,
                '& li': {
                  mb: 1.5,
                  lineHeight: 1.8,
                  fontSize: '1.25rem',
                  color: '#242424'
                }
              },
              '& code': { 
                backgroundColor: '#f6f6f6', 
                padding: '2px 4px', 
                borderRadius: '4px',
                fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                fontSize: '0.9em',
                color: '#242424'
              },
              '& pre': { 
                backgroundColor: '#f6f6f6', 
                padding: '20px', 
                borderRadius: '8px',
                overflow: 'auto',
                mb: 2.5,
                '& code': {
                  backgroundColor: 'transparent',
                  padding: 0,
                  fontSize: '0.9em',
                  fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace'
                }
              },
              '& blockquote': {
                borderLeft: '4px solid #242424',
                pl: 3,
                py: 2,
                my: 3,
                backgroundColor: '#f6f6f6',
                borderRadius: '0 4px 4px 0',
                fontStyle: 'italic',
                fontSize: '1.25rem',
                color: '#242424',
                '& p': {
                  margin: 0
                }
              },
              '& table': {
                width: '100%',
                borderCollapse: 'collapse',
                mb: 3,
                '& th, & td': {
                  border: '1px solid #e0e0e0',
                  p: 2,
                  textAlign: 'left',
                  verticalAlign: 'top',
                  fontSize: '1.25rem',
                  lineHeight: 1.8
                },
                '& th': {
                  backgroundColor: '#f6f6f6',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  color: '#242424'
                },
                '& tr:nth-of-type(even)': {
                  backgroundColor: '#fafafa'
                },
                '& tr:hover': {
                  backgroundColor: '#f0f0f0'
                }
              },
              '& strong': {
                fontWeight: 700,
                color: '#242424'
              },
              '& a': {
                color: '#1976d2',
                textDecoration: 'none',
                borderBottom: '1px solid #1976d2',
                '&:hover': {
                  backgroundColor: '#f0f7ff'
                }
              },
              '& hr': {
                border: 'none',
                borderTop: '1px solid #e0e0e0',
                my: 4
              }
            }}
            dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              label="Başlık"
              name="title"
              value={blog.title}
              onChange={(e) => setBlog({ ...blog, title: e.target.value })}
              fullWidth
              required
              margin="normal"
            />
            
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                İçerik
              </Typography>
              <ReactQuill
                value={blog.content}
                onChange={handleChange}
                modules={modules}
                formats={formats}
                theme="snow"
                style={{ height: '400px', marginBottom: '50px' }}
              />
            </Box>
            
            <TextField
              label="Özet"
              name="excerpt"
              value={blog.excerpt}
              onChange={(e) => setBlog({ ...blog, excerpt: e.target.value })}
              fullWidth
              multiline
              rows={3}
              margin="normal"
              helperText="Boş bırakırsanız, içerikten otomatik oluşturulacaktır."
            />
            
            <TextField
              label="Slug (URL)"
              name="slug"
              value={blog.slug}
              onChange={(e) => setBlog({ ...blog, slug: e.target.value })}
              fullWidth
              margin="normal"
              helperText="Boş bırakırsanız, başlıktan otomatik oluşturulacaktır."
            />
            
            <TextField
              label="Öne Çıkan Görsel URL"
              name="featuredImage"
              value={blog.featuredImage}
              onChange={(e) => setBlog({ ...blog, featuredImage: e.target.value })}
              fullWidth
              margin="normal"
            />
            
            <Box sx={{ mt: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Etiketler
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {blog.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
              <TextField
                label="Yeni Etiket"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleAddTag} edge="end">
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
            </Box>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving}
              >
                {saving ? <CircularProgress size={24} /> : 'Kaydet'}
              </Button>
            </Box>
          </form>
        )}
      </Paper>
    </Container>
  );
};

export default BlogEdit; 