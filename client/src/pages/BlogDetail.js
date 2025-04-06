import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Breadcrumbs,
  Button
} from '@mui/material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/blog/${slug}`);
        setBlog(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Blog yazısı yüklenirken hata oluştu:', error);
        setError('Blog yazısı bulunamadı veya yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button component={Link} to="/blog" variant="contained" color="primary">
            Blog Yazılarına Dön
          </Button>
        </Box>
      </Container>
    );
  }

  if (!blog) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary">
          Blog yazısı bulunamadı.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button component={Link} to="/blog" variant="contained" color="primary">
            Blog Yazılarına Dön
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          Ana Sayfa
        </Link>
        <Link to="/blog" style={{ textDecoration: 'none', color: 'inherit' }}>
          Blog
        </Link>
        <Typography color="text.primary">{blog.title}</Typography>
      </Breadcrumbs>

      <Paper elevation={0} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {blog.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="subtitle1" color="text.secondary">
            {blog.publishedAt && format(new Date(blog.publishedAt), 'd MMMM yyyy', { locale: tr })}
          </Typography>
          {blog.author && (
            <Typography variant="subtitle1" color="text.secondary">
              • Yazar: {blog.author.name}
            </Typography>
          )}
        </Box>
        
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
      </Paper>
      
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button component={Link} to="/blog" variant="outlined" color="primary">
          Tüm Blog Yazılarına Dön
        </Button>
      </Box>
    </Container>
  );
};

export default BlogDetail; 