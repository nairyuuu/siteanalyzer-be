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
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

export default function Register({ toggleTheme, mode }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const router = useRouter();

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:4000/api/auth/register', form);
      alert('Registered! Now log in.');
      router.push('/login');
    } catch (error) {
      console.error('Registration failed:', error);
      // Add error handling here (e.g., show a snackbar or error message)
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRegister();
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
          Analyze websites with ease. Register to get started.
        </Typography>

        {/* Registration Form */}
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
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleRegister}
            >
              Register
            </Button>
          </Box>
        </Paper>

        {/* Footer */}
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
