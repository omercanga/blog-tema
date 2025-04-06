import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Box,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  TableCell,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  Chip,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ReactMarkdown from 'react-markdown';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Article as ArticleIcon } from '@mui/icons-material';

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    featuredImage: '',
    tags: ''
  });
  const [homeContent, setHomeContent] = useState({
    title: '',
    subtitle: '',
    description: '',
    skills: [],
    experience: [],
    education: [],
    contact: {
      email: '',
      phone: '',
      address: '',
      socialMedia: {
        linkedin: '',
        github: '',
        twitter: ''
      }
    }
  });
  const [users, setUsers] = useState([]);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [blogPosts, setBlogPosts] = useState([]);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      fetchPosts();
      fetchUsers();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoginError(null);
      const response = await axios.post('http://localhost:5001/api/auth/login', loginData);
      
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        setIsAuthenticated(true);
        fetchPosts();
        fetchUsers();
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setLoginError('Geçersiz e-posta veya şifre. Lütfen bilgilerinizi kontrol edin.');
      } else {
        setLoginError('Giriş yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    navigate('/');
  };

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5001/api/blog', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPosts(response.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      if (err.response?.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem('adminToken');
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5001/api/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      if (err.response?.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem('adminToken');
      }
    }
  };

  const fetchHomeContent = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/home');
      if (response.data) {
        setHomeContent(response.data);
      }
    } catch (error) {
      console.error('Anasayfa içeriği yüklenirken hata:', error);
      setError('Anasayfa içeriği yüklenirken bir hata oluştu.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Boş etiketleri filtrele
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);

      // Slug boşsa, başlıktan oluştur
      if (!formData.slug) {
        formData.slug = formData.title
          .toLowerCase()
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ı/g, 'i')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }

      // Özet boşsa, içerikten oluştur
      if (!formData.excerpt) {
        formData.excerpt = formData.content
          .replace(/<[^>]*>/g, '') // HTML etiketlerini kaldır
          .substring(0, 200) + '...'; // İlk 200 karakteri al
      }

      const postData = {
        ...formData,
        tags: tagsArray,
        status: 'published',
        publishedAt: new Date()
      };

      // Token'ı al
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        setIsAuthenticated(false);
        return;
      }

      // API isteğini yap
      const response = await axios.post('http://localhost:5001/api/blog', postData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Başarılı ekleme işlemi
      if (response.status === 201) {
        setSuccess('Blog yazısı başarıyla eklendi.');
        setOpen(false);
        fetchPosts();
        setFormData({
          title: '',
          content: '',
          excerpt: '',
          slug: '',
          featuredImage: '',
          tags: ''
        });
      } else {
        setError('Blog yazısı eklenirken bir hata oluştu.');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      // Hata mesajını daha detaylı göster
      if (err.response?.status === 401) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        setIsAuthenticated(false);
        localStorage.removeItem('adminToken');
      } else if (err.response) {
        setError(`Blog yazısı eklenirken bir hata oluştu: ${err.response.status} - ${err.response.data.message || 'Bilinmeyen hata'}`);
      } else if (err.request) {
        setError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        setError(`Blog yazısı eklenirken bir hata oluştu: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) {
      try {
        setLoading(true);
        setError(null);

        // Token'ı al
        const token = localStorage.getItem('adminToken');
        if (!token) {
          setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          setIsAuthenticated(false);
          return;
        }

        await axios.delete(`http://localhost:5001/api/blog/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setSuccess('Blog yazısı başarıyla silindi.');
        fetchPosts();
      } catch (err) {
        console.error('Error deleting post:', err);
        if (err.response?.status === 401) {
          setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          setIsAuthenticated(false);
          localStorage.removeItem('adminToken');
        } else {
          setError('Blog yazısı silinirken bir hata oluştu.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    setFormData({
      ...formData,
      title,
      slug
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleHomeSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5001/api/home', homeContent);
      setSuccess('Anasayfa içeriği başarıyla güncellendi.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Anasayfa içeriği güncellenirken hata:', error);
      setError('Anasayfa içeriği güncellenirken bir hata oluştu.');
    }
  };

  const handleSkillAdd = () => {
    setHomeContent(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...homeContent.skills];
    newSkills[index] = value;
    setHomeContent(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  const handleSkillDelete = (index) => {
    const newSkills = homeContent.skills.filter((_, i) => i !== index);
    setHomeContent(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  const handleExperienceAdd = () => {
    setHomeContent(prev => ({
      ...prev,
      experience: [...prev.experience, { title: '', company: '', period: '', description: '' }]
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...homeContent.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setHomeContent(prev => ({
      ...prev,
      experience: newExperience
    }));
  };

  const handleExperienceDelete = (index) => {
    const newExperience = homeContent.experience.filter((_, i) => i !== index);
    setHomeContent(prev => ({
      ...prev,
      experience: newExperience
    }));
  };

  const handleEducationAdd = () => {
    setHomeContent(prev => ({
      ...prev,
      education: [...prev.education, { school: '', degree: '', period: '', description: '' }]
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...homeContent.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setHomeContent(prev => ({
      ...prev,
      education: newEducation
    }));
  };

  const handleEducationDelete = (index) => {
    const newEducation = homeContent.education.filter((_, i) => i !== index);
    setHomeContent(prev => ({
      ...prev,
      education: newEducation
    }));
  };

  const handleUserDialogOpen = () => {
    setUserDialogOpen(true);
  };

  const handleUserDialogClose = () => {
    setUserDialogOpen(false);
    setUserFormData({
      name: '',
      email: '',
      password: '',
      role: 'user'
    });
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserSubmit = async (e) => {
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

      const response = await axios.post('http://localhost:5001/api/users', userFormData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        setSuccess('Kullanıcı başarıyla eklendi.');
        handleUserDialogClose();
        fetchUsers();
      }
    } catch (err) {
      console.error('Error creating user:', err);
      if (err.response?.status === 401) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        setIsAuthenticated(false);
        localStorage.removeItem('adminToken');
      } else if (err.response) {
        setError(`Kullanıcı eklenirken bir hata oluştu: ${err.response.status} - ${err.response.data.message || 'Bilinmeyen hata'}`);
      } else {
        setError(`Kullanıcı eklenirken bir hata oluştu: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordDialogOpen = () => {
    setPasswordDialogOpen(true);
  };

  const handlePasswordDialogClose = () => {
    setPasswordDialogOpen(false);
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setError('Yeni şifreler eşleşmiyor.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        setIsAuthenticated(false);
        return;
      }

      const response = await axios.put('http://localhost:5001/api/users/password', {
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setSuccess('Şifreniz başarıyla güncellendi.');
        handlePasswordDialogClose();
      }
    } catch (err) {
      console.error('Error updating password:', err);
      if (err.response?.status === 401) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        setIsAuthenticated(false);
        localStorage.removeItem('adminToken');
      } else if (err.response) {
        setError(`Şifre güncellenirken bir hata oluştu: ${err.response.status} - ${err.response.data.message || 'Bilinmeyen hata'}`);
      } else {
        setError(`Şifre güncellenirken bir hata oluştu: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        setIsAuthenticated(false);
        return;
      }

      const response = await axios.delete(`http://localhost:5001/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccess('Kullanıcı başarıyla silindi.');
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      if (err.response?.status === 401) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        setIsAuthenticated(false);
        localStorage.removeItem('adminToken');
      } else if (err.response?.status === 400) {
        if (err.response.data.message.includes('Admin kullanıcılar')) {
          setError('Admin kullanıcılar silinemez. Bu bir güvenlik önlemidir.');
        } else if (err.response.data.message.includes('Aktif kullanıcılar')) {
          setError('Aktif kullanıcılar silinemez. Önce kullanıcıyı pasifleştirin.');
        } else {
          setError(err.response.data.message);
        }
      } else {
        setError(`Kullanıcı silinirken bir hata oluştu: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        setIsAuthenticated(false);
        return;
      }

      const response = await axios.put(`http://localhost:5001/api/users/${id}/role`, { role: newRole }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuccess('Kullanıcı rolü başarıyla değiştirildi.');
      fetchUsers();
    } catch (err) {
      console.error('Error changing user role:', err);
      if (err.response?.status === 401) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        setIsAuthenticated(false);
        localStorage.removeItem('adminToken');
      } else {
        setError(`Kullanıcı rolü değiştirilirken bir hata oluştu: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleActiveChange = async (id, active) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        setIsAuthenticated(false);
        return;
      }

      const response = await axios.put(`http://localhost:5001/api/users/${id}/active`, { active }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuccess(active ? 'Kullanıcı etkinleştirildi.' : 'Kullanıcı devre dışı bırakıldı.');
      fetchUsers();
    } catch (err) {
      console.error('Error changing user active status:', err);
      if (err.response?.status === 401) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        setIsAuthenticated(false);
        localStorage.removeItem('adminToken');
      } else {
        setError(`Kullanıcı durumu değiştirilirken bir hata oluştu: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (email, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        setIsAuthenticated(false);
        return;
      }

      const response = await axios.put(`http://localhost:5001/api/auth/update-password`, { email, newPassword }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuccess('Kullanıcı şifresi başarıyla güncellendi.');
      fetchUsers();
    } catch (err) {
      console.error('Error updating user password:', err);
      if (err.response?.status === 401) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        setIsAuthenticated(false);
        localStorage.removeItem('adminToken');
      } else {
        setError(`Kullanıcı şifresi güncellenirken bir hata oluştu: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        setIsAuthenticated(false);
        return;
      }

      const response = await axios.get('http://localhost:5001/api/blog', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBlogPosts(response.data);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      if (err.response?.status === 401) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        setIsAuthenticated(false);
        localStorage.removeItem('adminToken');
      } else {
        setError(`Blog yazıları yüklenirken bir hata oluştu: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlogPost = async (id) => {
    if (window.confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('adminToken');
        if (!token) {
          setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          setIsAuthenticated(false);
          return;
        }

        await axios.delete(`http://localhost:5001/api/blog/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setSuccess('Blog yazısı başarıyla silindi.');
        fetchBlogPosts();
      } catch (err) {
        console.error('Error deleting blog post:', err);
        if (err.response?.status === 401) {
          setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          setIsAuthenticated(false);
          localStorage.removeItem('adminToken');
        } else {
          setError(`Blog yazısı silinirken bir hata oluştu: ${err.response?.data?.message || err.message}`);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 0) {
        fetchUsers();
      } else if (activeTab === 1) {
        fetchBlogPosts();
      }
    }
  }, [activeTab, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Admin Girişi
          </Typography>
          {loginError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loginError}
            </Alert>
          )}
          <Box component="form" onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="E-posta"
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Şifre"
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              margin="normal"
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
            >
              Giriş Yap
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Paneli
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
            onClick={handleLogout}
          >
            Çıkış Yap
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            {activeTab === 0 ? 'Blog Yönetimi' : 'Kullanıcı Yönetimi'}
          </Typography>
          {activeTab === 0 ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
            >
              Yeni Blog Yazısı
            </Button>
          ) : (
            <Box>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={handleUserDialogOpen}
                sx={{ mr: 2 }}
              >
                Yeni Kullanıcı
              </Button>
              <Button
                variant="outlined"
                startIcon={<LockIcon />}
                onClick={handlePasswordDialogOpen}
              >
                Şifre Değiştir
              </Button>
            </Box>
          )}
        </Box>

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Blog Yazıları" />
          <Tab label="Kullanıcılar" />
        </Tabs>

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

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {activeTab === 0 ? (
              <Grid container spacing={3}>
                {posts.map((post) => (
                  <Grid item xs={12} sm={6} md={4} key={post._id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {post.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {post.excerpt}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small" onClick={() => navigate(`/admin/blog/edit/${post._id}`)}>
                          Düzenle
                        </Button>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(post._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper>
                <List>
                  {users.map((user) => (
                    <React.Fragment key={user._id}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {user.name}
                              {user.role === 'admin' ? (
                                <AdminPanelSettingsIcon color="primary" fontSize="small" />
                              ) : (
                                <PersonIcon color="action" fontSize="small" />
                              )}
                              {!user.active && (
                                <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                                  (Pasif)
                                </Typography>
                              )}
                            </Box>
                          }
                          secondary={user.email}
                        />
                        <TableCell>
                          <Tooltip title="Kullanıcıyı Sil">
                            <IconButton 
                              color="error" 
                              onClick={() => handleDeleteUser(user._id)}
                              disabled={loading}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.role === 'admin' ? "Yönetici Yetkisini Kaldır" : "Yönetici Yap"}>
                            <IconButton
                              color="primary"
                              onClick={() => handleRoleChange(user._id, user.role === 'admin' ? 'user' : 'admin')}
                              disabled={loading}
                            >
                              {user.role === 'admin' ? <PersonIcon /> : <AdminPanelSettingsIcon />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.active ? "Kullanıcıyı Pasifleştir" : "Kullanıcıyı Aktifleştir"}>
                            <IconButton
                              color={user.active ? "warning" : "success"}
                              onClick={() => handleActiveChange(user._id, !user.active)}
                              disabled={loading}
                            >
                              {user.active ? <BlockIcon /> : <CheckCircleIcon />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Şifreyi Güncelle">
                            <IconButton
                              color="info"
                              onClick={() => {
                                const newPassword = prompt('Yeni şifreyi girin:');
                                if (newPassword) {
                                  handlePasswordUpdate(user.email, newPassword);
                                }
                              }}
                              disabled={loading}
                            >
                              <LockIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            )}
          </>
        )}

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Yeni Blog Yazısı</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Başlık"
                value={formData.title}
                onChange={handleTitleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                margin="normal"
                required
                helperText="URL'de görünecek benzersiz tanımlayıcı (otomatik oluşturulur)"
              />
              <TextField
                fullWidth
                label="Özet"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                margin="normal"
                required
                multiline
                rows={2}
              />
              <TextField
                fullWidth
                label="Görsel URL"
                value={formData.featuredImage}
                onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Etiketler"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                margin="normal"
                helperText="Etiketleri virgülle ayırın (örnek: React, JavaScript, Web)"
              />
              
              <Box sx={{ mt: 2, mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                  <Tab label="Editör" />
                  <Tab label="Önizleme" />
                </Tabs>
                <Divider sx={{ mb: 2 }} />
                
                {activeTab === 0 ? (
                  <Box sx={{ height: 300, mb: 2 }}>
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={(content) => setFormData({ ...formData, content })}
                      style={{ height: '250px' }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ 
                    height: 300, 
                    overflow: 'auto', 
                    p: 2, 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    mb: 2
                  }}>
                    <ReactMarkdown>{formData.content}</ReactMarkdown>
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>İptal</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Kaydet'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Kullanıcı Ekleme Dialog */}
        <Dialog open={userDialogOpen} onClose={handleUserDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleUserSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Ad Soyad"
                name="name"
                value={userFormData.name}
                onChange={handleUserFormChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="E-posta"
                name="email"
                type="email"
                value={userFormData.email}
                onChange={handleUserFormChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Şifre"
                name="password"
                type="password"
                value={userFormData.password}
                onChange={handleUserFormChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Rol"
                name="role"
                select
                value={userFormData.role}
                onChange={handleUserFormChange}
                margin="normal"
                required
                SelectProps={{
                  native: true,
                }}
              >
                <option value="user">Kullanıcı</option>
                <option value="admin">Yönetici</option>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleUserDialogClose}>İptal</Button>
            <Button 
              onClick={handleUserSubmit} 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Kaydet'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Şifre Değiştirme Dialog */}
        <Dialog open={passwordDialogOpen} onClose={handlePasswordDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>Şifre Değiştir</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handlePasswordSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Mevcut Şifre"
                name="currentPassword"
                type="password"
                value={passwordFormData.currentPassword}
                onChange={handlePasswordFormChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Yeni Şifre"
                name="newPassword"
                type="password"
                value={passwordFormData.newPassword}
                onChange={handlePasswordFormChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Yeni Şifre (Tekrar)"
                name="confirmPassword"
                type="password"
                value={passwordFormData.confirmPassword}
                onChange={handlePasswordFormChange}
                margin="normal"
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePasswordDialogClose}>İptal</Button>
            <Button 
              onClick={handlePasswordSubmit} 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Kaydet'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Admin; 