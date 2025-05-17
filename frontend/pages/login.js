import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { setToken } from '../utils/auth';
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

function isAlphanumeric(str) {
  return /^[a-zA-Z0-9]+$/.test(str);
}

export default function Login({ toggleTheme, mode }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const router = useRouter();

  const validateField = (field, value) => {
    let errors = { ...formErrors };
    if (field === 'username') {
      if (!value.trim()) {
        errors.username = 'Username is required';
      } else if (!isAlphanumeric(value)) {
        errors.username = 'Username must be alphanumeric';
      } else {
        delete errors.username;
      }
    }
    if (field === 'password') {
      if (!value.trim()) {
        errors.password = 'Password is required';
      } else if (value.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      } else {
        delete errors.password;
      }
    }
    setFormErrors(errors);
  };

  const handleFieldChange = (field, value) => {
    setForm({ ...form, [field]: value });
    validateField(field, value);
  };

  const isFormValid = () => {
    return (
      form.username.trim() &&
      form.password.trim() &&
      Object.keys(formErrors).length === 0
    );
  };

  const handleLogin = async () => {
    if (!isFormValid()) {
      setErrorMessage('Please fix the errors before submitting.');
      return;
    }
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.post(
        `${apiUrl}/api/auth/login`,
        { username: form.username, password: form.password },
        { withCredentials: true }
      );

      // Save the accessToken to Local Storage
      setToken(response.data.accessToken);

      // Redirect to the dashboard after successful login
      router.push('/');
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage(error.response?.data?.error || 'An error occurred. Please try again.');
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
              onChange={(e) => handleFieldChange('username', e.target.value)}
              error={!!formErrors.username}
              helperText={formErrors.username}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              error={!!formErrors.password}
              helperText={formErrors.password}
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
              disabled={!isFormValid()}
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