import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Avatar,
  useTheme,
  alpha,
  Button,
  Link as MuiLink,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

const CV = () => {
  const theme = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [homeContent, setHomeContent] = useState({
    title: '',
    subtitle: '',
    about: '',
    skills: '',
    experience: '',
    education: '',
    contact: ''
  });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
    fetchHomeContent();
  }, []);

  const fetchHomeContent = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5001/api/home');
      setHomeContent(response.data);
    } catch (err) {
      console.error('Error fetching home content:', err);
      setError('Ana sayfa içeriği yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHomeContent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        setIsAuthenticated(false);
        return;
      }

      await axios.put('http://localhost:5001/api/home', homeContent, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccess('Ana sayfa içeriği başarıyla güncellendi.');
      setOpen(false);
      fetchHomeContent();
    } catch (err) {
      console.error('Error updating home content:', err);
      if (err.response?.status === 401) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        setIsAuthenticated(false);
        localStorage.removeItem('adminToken');
      } else {
        setError('Ana sayfa içeriği güncellenirken bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  const skills = [
    'Java', 'Spring Boot', 'Spring Framework', 'Full-Stack Development',
    'JavaScript', 'Angular', 'Microservices', 'Docker', 'Kubernetes',
    'PostgreSQL', 'MongoDB', 'Redis', 'RabbitMQ', 'Kafka',
    'Git', 'Jenkins', 'Jira', 'Confluence', 'Agile/Scrum'
  ];

  const experiences = [
    {
      title: 'Full Stack Developer',
      company: 'TÜBİTAK BİLGEM YTE',
      period: 'Mar 2024 - Present',
      description: 'Spring Boot, JavaScript and related technologies'
    },
    {
      title: 'Full Stack Developer',
      company: 'Türk Telekom via Gantek',
      period: 'Oct 2023 - Mar 2024',
      description: 'Spring Boot, Angular and related technologies'
    },
    {
      title: 'Software Engineer',
      company: 'TÜBİTAK',
      period: 'Jan 2022 - Oct 2023',
      description: 'Spring Framework and Full-Stack Development'
    },
    {
      title: 'IT Specialist',
      company: 'Milli Savunma',
      period: 'Jul 2021 - Dec 2021',
      description: 'Spring Framework and Full-Stack Development'
    },
    {
      title: 'Programmer',
      company: 'Social Security Institution',
      period: 'Oct 2017 - Jun 2021',
      description: 'Spring Framework and Full-Stack Development'
    }
  ];

  const education = [
    {
      degree: 'Master of Science - MS, Civil Aviation',
      school: 'Erciyes University',
      period: 'Sep 2022 - Nov 2024',
      description: 'Thesis: Detection of Fungal Diseases in Sugar Beet Leaves Using YOLO Algorithms and Roboflow'
    },
    {
      degree: 'Bilgisayar Mühendisi, Bilgisayar Mühendisliği',
      school: 'Erciyes University',
      period: '2010 - 2015'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CV Sayfası
          </Typography>
          <Button
            color="inherit"
            component={Link}
            to="/"
            startIcon={<HomeIcon />}
            sx={{ mr: 2 }}
          >
            Ana Sayfa
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/blog"
            sx={{ mr: 2 }}
          >
            Blog
          </Button>
          {isAuthenticated && (
            <Button
              color="inherit"
              component={Link}
              to="/admin"
            >
              Admin Paneli
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box 
          sx={{ 
            mb: 4,
            textAlign: 'center',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100px',
              height: '4px',
              background: theme.palette.primary.main,
              borderRadius: '2px',
            }
          }}
        >
          <Avatar
            sx={{
              width: 120,
              height: 120,
              margin: '0 auto 20px',
              border: `4px solid ${theme.palette.primary.main}`,
            }}
            alt="Ömer ÇANGA"
            src="/path-to-your-photo.jpg"
          />
          <Typography variant="h3" component="h1" gutterBottom>
            Ömer ÇANGA
          </Typography>
          <Typography 
            variant="h5" 
            color="primary" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              letterSpacing: '1px'
            }}
          >
            Full Stack Developer
          </Typography>
          <Typography 
            variant="body1" 
            paragraph
            sx={{ 
              maxWidth: '600px',
              margin: '0 auto',
              color: 'text.secondary'
            }}
          >
            Experienced full stack developer with expertise in Java, Spring Boot, and modern web technologies.
            Passionate about building scalable and efficient systems.
          </Typography>
          
          <Box sx={{ mt: 2, mb: 4 }}>
            <Button
              component={Link}
              to="/blog"
              variant="contained"
              color="primary"
              size="large"
              sx={{ 
                borderRadius: '20px',
                px: 4,
                py: 1,
                textTransform: 'none',
                fontSize: '1.1rem'
              }}
            >
              Blog Yazılarım
            </Button>
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">
                  {homeContent.title}
                </Typography>
                {isAuthenticated && (
                  <Box>
                    <IconButton onClick={handleEdit} color="primary">
                      <EditIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {homeContent.subtitle}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Hakkımda
              </Typography>
              <Typography>
                {homeContent.about}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Yetenekler
              </Typography>
              <Typography>
                {homeContent.skills}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Deneyim
              </Typography>
              <Typography>
                {homeContent.experience}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Eğitim
              </Typography>
              <Typography>
                {homeContent.education}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                İletişim
              </Typography>
              <Typography>
                {homeContent.contact}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>Ana Sayfa İçeriğini Düzenle</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Başlık"
                name="title"
                value={homeContent.title}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Alt Başlık"
                name="subtitle"
                value={homeContent.subtitle}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Hakkımda"
                name="about"
                value={homeContent.about}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={4}
                required
              />
              <TextField
                fullWidth
                label="Yetenekler"
                name="skills"
                value={homeContent.skills}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={4}
                required
              />
              <TextField
                fullWidth
                label="Deneyim"
                name="experience"
                value={homeContent.experience}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={4}
                required
              />
              <TextField
                fullWidth
                label="Eğitim"
                name="education"
                value={homeContent.education}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={4}
                required
              />
              <TextField
                fullWidth
                label="İletişim"
                name="contact"
                value={homeContent.contact}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={4}
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>İptal</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Kaydet'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default CV; 