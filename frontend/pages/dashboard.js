import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from '@mui/material';

export default function Dashboard() {
  const [trafficData, setTrafficData] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login'); // Redirect to login if no token is found
      return;
    }

    const ws = new WebSocket('ws://localhost:4000'); // Connect to WebSocket server

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'initial') {
        setTrafficData(data.logs); // Set initial logs
      } else if (data.type === 'update') {
        setTrafficData((prevLogs) => [data.log, ...prevLogs]); // Add new log to the top
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setError('Failed to connect to WebSocket server');
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close(); // Clean up WebSocket connection on component unmount
    };
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    router.push('/login'); // Redirect to login page
  };

  if (!trafficData.length && !error) {
    return (
      <Container component="main" maxWidth="md" sx={{ mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {trafficData.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mt: 4 }}>
            Detailed Traffic Logs:
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Endpoint</TableCell>
                  <TableCell>Status Code</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trafficData.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{log.ip}</TableCell>
                    <TableCell>{log.method}</TableCell>
                    <TableCell>{log.endpoint}</TableCell>
                    <TableCell>{log.statusCode}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Button
        variant="contained"
        color="secondary"
        fullWidth
        sx={{ mt: 4 }}
        onClick={handleLogout}
      >
        Logout
      </Button>
    </Container>
  );
}