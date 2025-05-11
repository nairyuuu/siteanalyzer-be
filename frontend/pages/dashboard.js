import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Container,
  Alert,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TextField,
  Pagination,
} from '@mui/material';

export default function Dashboard() {
  const [trafficData, setTrafficData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Block rendering until both WebSocket and API are ready
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [method, setMethod] = useState('');
  const [statusCode, setStatusCode] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [pagination, setPagination] = useState({});
  const router = useRouter();

  const fetchLogs = async () => {
    setError('');

    try {
      const query = new URLSearchParams({
        page,
        limit,
        method,
        statusCode,
        endpoint,
      }).toString();

      const res = await fetch(`http://localhost:4000/api/dashboard?${query}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!res.ok) {
        if (res.status === 403) {
          router.push('/403');
        } else {
          throw new Error('Failed to fetch logs');
        }
      }

      const data = await res.json();
      setTrafficData(data.logs);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching logs:', err.message);
      setError('Failed to fetch logs');
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login'); // Redirect to login if no token is found
        return;
      }

      // Fetch initial logs
      await fetchLogs();

      // Establish WebSocket connection
      const ws = new WebSocket('ws://localhost:4000', token);

      ws.onopen = () => {
        console.log('WebSocket connection established');
        setLoading(false); // Stop blocking rendering once WebSocket is ready
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'update') {
          setTrafficData((prevLogs) => [data.log, ...prevLogs]); // Add new log to the top
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Failed to connect to WebSocket server');
        setLoading(false); // Stop blocking rendering even if WebSocket fails
      };

      ws.onclose = (event) => {
        console.log('WebSocket connection closed', event.code, event.reason);
        if (event.code === 1008) {
          router.push('/403'); // Redirect to 403 page if unauthorized
        }
      };

      return () => {
        ws.close(); // Clean up WebSocket connection on component unmount
      };
    };

    initialize();
  }, [router, page, limit, method, statusCode, endpoint]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) {
    // Block rendering while waiting for WebSocket and API authorization
    return null;
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

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Method"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          fullWidth
        />
        <TextField
          label="Status Code"
          value={statusCode}
          onChange={(e) => setStatusCode(e.target.value)}
          fullWidth
        />
        <TextField
          label="Endpoint"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          fullWidth
        />
      </Box>

      {trafficData.length === 0 ? (
        <Typography align="center">No logs available</Typography>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
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

          <Pagination
            count={pagination.pages || 1}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </>
      )}
    </Container>
  );
}