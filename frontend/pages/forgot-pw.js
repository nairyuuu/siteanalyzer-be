import { useState } from 'react';
import { TextField, Button, Typography, Box, Alert } from '@mui/material';
import axios from 'axios';

export default function ForgotPassword() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post('http://localhost:4000/api/auth/forgot-password', {
        username,
      });
      setMessage(response.data.message); // Backend should return a success message
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