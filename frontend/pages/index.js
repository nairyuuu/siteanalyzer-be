import { useState, useEffect } from 'react';
import { Box, Typography, Container, Button, Link, AppBar, Toolbar, IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import axios from 'axios';
import { getToken, removeToken } from '../utils/auth'; // Utility functions for token management

export default function Home({ toggleTheme, mode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status

  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsLoggedIn(true); // User is logged in if a token exists
    }
  }, []);

  const handleLogout = () => {
    removeToken(); // Remove the token from storage
    setIsLoggedIn(false); // Update login status
  };

  const downloadFile = async () => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/download`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'extension.zip');
    document.body.appendChild(link);
    link.click();
  };

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box />
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <IconButton onClick={toggleTheme} color="inherit">
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            {isLoggedIn ? (
              <>
                <Typography variant="body1">Hi</Typography>
                <Button onClick={handleLogout} variant="outlined" color="secondary">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button href="/login" variant="outlined" color="primary">
                  Login
                </Button>
                <Button href="/register" variant="contained" color="primary">
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Site Analyzer
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          - by Nairyuuu and dmk1en
        </Typography>

        <Typography variant="body1" sx={{ my: 4, lineHeight: 1.7 }}>
          <strong>Site Analyzer</strong> is a powerful browser extension that helps you analyze any website's technologies in real time. Whether you're a developer, a cybersecurity enthusiast, or just curious, this tool can identify front-end frameworks, libraries, backend stacks, CMS platforms, and more.
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>
          View the code on GitHub:{' '}
          <Link href="https://github.com/nairyuuu/site-analyzer" target="_blank" rel="noopener">
            https://github.com/nairyuuu/site-analyzer
          </Link>
        </Typography>

        <Box mt={4}>
          <Button onClick={downloadFile} variant="contained" size="large">
            Download Extension (Login Required)
          </Button>
        </Box>
      </Container>
    </>
  );
}
