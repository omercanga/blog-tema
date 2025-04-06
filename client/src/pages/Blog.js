import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Paper,
  Chip
} from '@mui/material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/blog');
        setPosts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Blog yazıları yüklenirken hata oluştu:', error);
        setError('Blog yazıları yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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
          <Button component={Link} to="/" variant="contained" color="primary">
            Ana Sayfaya Dön
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
        <Typography color="text.primary">Blog Yazıları</Typography>
      </Breadcrumbs>

      <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4 }}>
        Blog Yazıları
      </Typography>

      {posts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Henüz blog yazısı bulunmamaktadır.
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Ana Sayfaya Dön
          </Button>
        </Box>
      ) : (
        <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
          {posts.map((post) => (
            <Paper
              key={post._id}
              elevation={0}
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h4" component="h2" gutterBottom>
                  {post.title}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
                  <Typography variant="body2">
                    {post.publishedAt && format(new Date(post.publishedAt), 'd MMMM yyyy', { locale: tr })}
                  </Typography>
                  {post.author && (
                    <>
                      <Typography variant="body2">•</Typography>
                      <Typography variant="body2">{post.author.name}</Typography>
                    </>
                  )}
                </Box>

                {post.featuredImage && (
                  <Box
                    component="img"
                    src={post.featuredImage}
                    alt={post.title}
                    sx={{
                      width: '100%',
                      height: '300px',
                      objectFit: 'cover',
                      borderRadius: 1
                    }}
                  />
                )}

                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {post.excerpt}
                </Typography>

                {post.tags && post.tags.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {post.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{ backgroundColor: 'rgba(25, 118, 210, 0.1)' }}
                      />
                    ))}
                  </Box>
                )}

                <Button
                  component={Link}
                  to={`/blog/${post.slug}`}
                  variant="text"
                  color="primary"
                  sx={{ alignSelf: 'flex-start', mt: 1 }}
                >
                  Devamını Oku →
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Blog; 