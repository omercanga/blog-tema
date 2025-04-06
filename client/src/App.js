import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import CV from './pages/CV';
import Admin from './pages/Admin';
import BlogEdit from './pages/BlogEdit';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<CV />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/blog/new" element={<BlogEdit />} />
          <Route path="/admin/blog/edit/:id" element={<BlogEdit />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 