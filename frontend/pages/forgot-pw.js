import { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, MenuItem, Alert } from '@mui/material';
import axios from 'axios';

export default function ForgotPassword() {
  const [username, setUsername] = useState('');
  const [securityQuestions, setSecurityQuestions] = useState([
    { questionId: '', answer: '' },
  ]);
  const [predefinedQuestions, setPredefinedQuestions] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch predefined security questions from the backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/auth/security-questions');
        setPredefinedQuestions(res.data);
      } catch (err) {
        console.error('Failed to fetch security questions:', err);
      }
    };
    fetchQuestions();
  }, []);

  const handleInputChange = (index, field, value) => {
    const updatedQuestions = [...securityQuestions];
    updatedQuestions[index][field] = value;
    setSecurityQuestions(updatedQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post('http://localhost:4000/api/auth/forgot-password', {
        username,
        securityAnswers: securityQuestions,
      });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Forgot Password
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {securityQuestions.map((q, index) => (
          <Box key={index} sx={{ mt: 2 }}>
            <TextField
              select
              label={`Security Question ${index + 1}`}
              fullWidth
              margin="normal"
              value={q.questionId}
              onChange={(e) =>
                handleInputChange(index, 'questionId', e.target.value)
              }
            >
              <MenuItem value="" disabled>
                Select a question
              </MenuItem>
              {predefinedQuestions.map((question) => (
                <MenuItem key={question.id} value={question.id}>
                  {question.question}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Answer"
              fullWidth
              margin="normal"
              value={q.answer}
              onChange={(e) =>
                handleInputChange(index, 'answer', e.target.value)
              }
            />
          </Box>
        ))}
        <Button
          variant="text"
          size="small"
          onClick={() =>
            setSecurityQuestions([...securityQuestions, { questionId: '', answer: '' }])
          }
        >
          Add Another Security Question
        </Button>
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
          Submit
        </Button>
      </form>
      {message && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}