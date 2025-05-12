import { useState } from 'react';
import axios from 'axios';
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
  Alert,
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

export default function Register({ toggleTheme, mode }) {
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const validateField = (field, value) => {
    const newErrors = { ...errors };

    if (field === 'username') {
      if (!value.trim()) {
        newErrors.username = 'Username is required';
      } else {
        delete newErrors.username;
      }
    }

    if (field === 'password') {
      if (!value.trim()) {
        newErrors.password = 'Password is required';
      } else if (value.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else {
        delete newErrors.password;
      }
    }

    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) {
        newErrors.email = 'Email is required';
      } else if (!emailRegex.test(value)) {
        newErrors.email = 'Invalid email format';
      } else {
        delete newErrors.email;
      }
    }

    if (field === 'phone') {
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!value.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!phoneRegex.test(value)) {
        newErrors.phone = 'Invalid phone number';
      } else {
        delete newErrors.phone;
      }
    }

    if (field === 'address') {
      if (!value.trim()) {
        newErrors.address = 'Address is required';
      } else {
        delete newErrors.address;
      }
    }

    setErrors(newErrors);
  };

  const handleRegister = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, form);
      alert('Registered! Now log in.');
      router.push('/login');
    } catch (error) {
      console.error('Registration failed:', error);
      setErrorMessage('Registration failed. Please try again.');
    }
  };

  const handleFieldChange = (field, value) => {
    setForm({ ...form, [field]: value });
    validateField(field, value);
  };

  const isFormValid = () => {
    return (
      form.username.trim() &&
      form.password.trim() &&
      form.email.trim() &&
      form.phone.trim() &&
      form.address.trim() &&
      Object.keys(errors).length === 0
    );
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
        <Box sx={{ alignSelf: 'flex-end' }}>
          <IconButton onClick={toggleTheme} color="inherit">
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>

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
          Analyze websites with ease. Register to get started.
        </Typography>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center">
            Register
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
              error={!!errors.username}
              helperText={errors.username}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              value={form.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Phone"
              value={form.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              error={!!errors.phone}
              helperText={errors.phone}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Address"
              value={form.address}
              onChange={(e) => handleFieldChange('address', e.target.value)}
              error={!!errors.address}
              helperText={errors.address}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleRegister}
              disabled={!isFormValid()}
            >
              Register
            </Button>
          </Box>
        </Paper>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 3 }}
        >
          Already have an account?{' '}
          <Button href="/login" variant="text" size="small">
            Login
          </Button>
        </Typography>
      </Box>
    </Container>
  );
}
