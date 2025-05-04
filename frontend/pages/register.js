import { useState, useEffect } from 'react';
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
    securityAnswers: [{ questionId: '', answer: '' }],
  });
  const [questions, setQuestions] = useState([]);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/auth/security-questions');
        if (res.data && res.data.length > 0) {
          setQuestions(res.data);
        } else {
          console.warn('No security questions found. Using default questions.');
          setQuestions([
            { id: 1, question: "What is your mother's maiden name?" },
            { id: 2, question: "What was the name of your first pet?" },
            { id: 3, question: "What is your favorite book?" },
            { id: 4, question: "What city were you born in?" },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch security questions:', error);
        setQuestions([
          { id: 1, question: "What is your mother's maiden name?" },
          { id: 2, question: "What was the name of your first pet?" },
          { id: 3, question: "What is your favorite book?" },
          { id: 4, question: "What city were you born in?" },
        ]);
      }
    };
    fetchQuestions();
  }, []);

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

  const validateSecurityQuestion = (index, field, value) => {
    const newErrors = { ...errors };

    if (field === 'questionId') {
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
  // Check if at least one valid security question is selected
  const validQuestions = form.securityAnswers.filter(
    (q) => q.questionId && q.answer.trim()
  );
  if (validQuestions.length === 0) {
    alert('You must select at least one security question and provide an answer.');
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
    const updatedQuestions = [...form.securityAnswers];
    updatedQuestions[index][field] = value;
    setForm({ ...form, securityAnswers: updatedQuestions });
    validateSecurityQuestion(index, field, value);
  };

  const addSecurityQuestion = () => {
    if (form.securityAnswers.length >= 2) {
      alert('You can only select up to 2 security questions.');
      return;
    }
    setForm({
      ...form,
      securityAnswers: [...form.securityAnswers, { questionId: '', answer: '' }],
    });
  };

  const removeSecurityQuestion = (index) => {
    const updatedQuestions = form.securityAnswers.filter((_, i) => i !== index);
    setForm({ ...form, securityAnswers: updatedQuestions });
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
            {form.securityAnswers.map((q, index) => (
              <Box key={index} sx={{ mt: 2 }}>
                <TextField
                  select
                  margin="normal"
                  required
                  fullWidth
                  label={`Security Question ${index + 1}`}
                  value={q.questionId}
                  onChange={(e) =>
                    handleSecurityQuestionChange(index, 'questionId', e.target.value)
                  }
                  SelectProps={{
                    native: true,
                  }}
                  InputLabelProps={{
                    shrink: true, // Ensures the label does not overlap
                  }}
                >
                  <option value="" disabled>
                    Select a question
                  </option>
                  {questions.map((question) => (
                    <option key={question.id} value={question.id}>
                      {question.question}
                    </option>
                  ))}
                </TextField>
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
                <Button
                  variant="text"
                  size="small"
                  color="error"
                  onClick={() => removeSecurityQuestion(index)}
                  sx={{ mt: 1 }}
                >
                  Remove
                </Button>
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
              disabled={form.securityAnswers.length === 0 || form.securityAnswers.some((q) => !q.questionId || !q.answer.trim())}
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
