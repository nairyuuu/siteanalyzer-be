import { useState } from 'react';
import axios from 'axios';
import { setToken } from '../utils/auth';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Container,
  CssBaseline,
  IconButton,
  TextField,
  Typography,
  Paper,
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

export default function Login({ toggleTheme, mode }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await axios.post(`${apiUrl}/api/auth/login`, form);
      setToken(res.data.token);
      router.push('/');
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage(error.response?.data?.error || 'An error occurred. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 8,
        }}
      >
        {/* Theme Toggle Button */}
        <Box sx={{ alignSelf: 'flex-end' }}>
          <IconButton onClick={toggleTheme} color="inherit">
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>

        {/* Application Title */}
        <Typography component="h1" variant="h4" align="center" sx={{ mt: 2 }}>
          SiteAnalyzer
        </Typography>
        <Typography
          component="p"
          variant="body2"
          align="center"
          color="text.secondary"
          sx={{ mt: 1, mb: 3 }}
        >
          Analyze websites with ease. Login to access your dashboard.
        </Typography>

        {/* Login Form */}
        <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center">
            Login
          </Typography>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              autoFocus
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              onKeyPress={handleKeyPress}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyPress={handleKeyPress}
            />
            {errorMessage && (
              <Typography color="error" variant="body2" align="center" sx={{ mb: 2 }}>
                {errorMessage}
              </Typography>
            )}
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleLogin}
            >
              Login
            </Button>
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 2 }}
          >
            <Button href="/forgot-pw" variant="text" size="small">
              Forgot Password?
            </Button>
          </Typography>
        </Paper>

        {/* Footer */}
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 3 }}
        >
          Don't have an account?{' '}
          <Button href="/register" variant="text" size="small">
            Register
          </Button>
        </Typography>
      </Box>
    </Container>
  );
}