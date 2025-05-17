import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getToken } from '../utils/auth';
import apiClient from '../utils/apiClient';
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
  Button,
} from '@mui/material';

export default function Dashboard() {
  const [trafficData, setTrafficData] = useState([]);
  const [users, setUsers] = useState([]); // State for user data
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [method, setMethod] = useState('');
  const [statusCode, setStatusCode] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [pagination, setPagination] = useState({});
  const [csrfToken, setCsrfToken] = useState('');
  const router = useRouter();

  const fetchLogs = async () => {

    try {
      const query = new URLSearchParams({
        page,
        limit,
        method,
        statusCode,
        endpoint,
      }).toString();

      const res = await apiClient.get(`/api/dashboard?${query}`);

      setTrafficData(res.data.logs);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching logs:', err.message);
      setError('Failed to fetch logs');
    }
  };

  const fetchUsers = async () => {
  try {
    const res = await apiClient.get('/api/dashboard/users');

    if (res.status === 200) {
      setUsers(res.data);
    } else {
      setError('Failed to fetch users');
    }
  } catch (err) {
    console.error('Error fetching users:', err.message);
    setError('Failed to fetch users');
  }
};

  const fetchCsrfToken = async () => {
      try {
        const res = await apiClient.get('/api/csrf-token');
        setCsrfToken(res.data.csrfToken);
      } catch (err) {
        console.error('Failed to fetch CSRF token:', err);
      }
    };

  const handleGrantAdmin = async (userId) => {
  try {
    const res = await apiClient.put(
      `/api/dashboard/users/${userId}/role`,
      { role: 'admin' },
      {
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      }
    );

    if (res.status !== 200) {
      throw new Error('Failed to update user role');
    }

      await fetchUsers();
    } catch (err) {
      console.error('Error updating user role:', err.message);
      setError('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const res = await apiClient.delete(
      `/api/dashboard/users/${userId}`,
      {
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      }
    );

      if (res.status !== 200) {
        throw new Error('Failed to delete user');
      }

      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err.message);
      setError('Failed to delete user');
    }
  };

  useEffect(() => {
    const initialize = async () => {

      await fetchLogs();
      await fetchUsers();
      await fetchCsrfToken();

      const accessToken = getToken();
      if (!accessToken) {
        setError('No access token available');
        return;
      }

      let ws = new WebSocket('ws://localhost:4000', accessToken);

      if (!ws) {
        setError('Failed to connect to WebSocket server');
        return;
      }

      ws.onopen = () => {
        console.log('WebSocket connection established');
        setLoading(false);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'update') {
          setTrafficData((prevLogs) => [data.log, ...prevLogs]);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Failed to connect to WebSocket server');
      };

      ws.onclose = (event) => {
        console.log('WebSocket connection closed', event.code, event.reason);
        if (event.code === 1008) {
          router.push('/403'); 
        }
        if (event.code === 4001) {
          router.reload();
        }
      };

      return () => {
        ws.close();
      };
    };

    initialize();
  }, [page, limit, method, statusCode, endpoint]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) {
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

      <Typography variant="h5" align="center" gutterBottom sx={{ mt: 5 }}>
        User Management
      </Typography>

      {users.length === 0 ? (
        <Typography align="center">No users available</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleGrantAdmin(user._id)}
                      disabled={user.role === 'admin'}
                      sx={{ mr: 1 }}
                    >
                      Grant Admin
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}