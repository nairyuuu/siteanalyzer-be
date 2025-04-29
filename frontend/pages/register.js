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
    securityQuestions: [{ question: '', answer: '' }],
  });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const validateField = (field, value) => {
    const newErrors = { ...errors };

    // Username validation
    if (field === 'username') {
      if (!value.trim()) {
        newErrors.username = 'Username is required';
      } else {
        delete newErrors.username;
      }
    }

    // Password validation
    if (field === 'password') {
      if (!value.trim()) {
        newErrors.password = 'Password is required';
      } else if (value.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else {
        delete newErrors.password;
      }
    }

    // Email validation
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

    // Phone validation
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

    // Address validation
    if (field === 'address') {
      if (!value.trim()) {
        newErrors.address = 'Address is required';
      } else {
        delete newErrors.address;
      }
    }

    setErrors(newErrors);
  };

  const validateSecurityQuestion = (index, field, value) => {
    const newErrors = { ...errors };

    if (field === 'question') {
      if (!value.trim()) {
        newErrors[`securityQuestion${index}`] = `Security Question ${index + 1} is required`;
      } else {
        delete newErrors[`securityQuestion${index}`];
      }
    }

    if (field === 'answer') {
      if (!value.trim()) {
        newErrors[`securityAnswer${index}`] = `Answer for Security Question ${index + 1} is required`;
      } else {
        delete newErrors[`securityAnswer${index}`];
      }
    }

    setErrors(newErrors);
  };

  const handleRegister = async () => {
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await axios.post('http://localhost:4000/api/auth/register', form);
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

  const handleSecurityQuestionChange = (index, field, value) => {
    const updatedQuestions = [...form.securityQuestions];
    updatedQuestions[index][field] = value;
    setForm({ ...form, securityQuestions: updatedQuestions });
    validateSecurityQuestion(index, field, value);
  };

  const addSecurityQuestion = () => {
    setForm({
      ...form,
      securityQuestions: [...form.securityQuestions, { question: '', answer: '' }],
    });
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

        {/* Error Message */}
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

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
            {form.securityQuestions.map((q, index) => (
              <Box key={index} sx={{ mt: 2 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label={`Security Question ${index + 1}`}
                  value={q.question}
                  onChange={(e) =>
                    handleSecurityQuestionChange(index, 'question', e.target.value)
                  }
                  error={!!errors[`securityQuestion${index}`]}
                  helperText={errors[`securityQuestion${index}`]}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Answer"
                  value={q.answer}
                  onChange={(e) =>
                    handleSecurityQuestionChange(index, 'answer', e.target.value)
                  }
                  error={!!errors[`securityAnswer${index}`]}
                  helperText={errors[`securityAnswer${index}`]}
                />
              </Box>
            ))}
            <Button
              variant="text"
              size="small"
              onClick={addSecurityQuestion}
              sx={{ mt: 2 }}
            >
              Add Another Security Question
            </Button>
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
