import { useRouter } from 'next/router';
import { Container, Typography, Button } from '@mui/material';

export default function Forbidden() {
  const router = useRouter();

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        403 - Forbidden
      </Typography>
      <Typography variant="body1" align="center" sx={{ mt: 2 }}>
        You do not have permission to access this page.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 4 }}
        onClick={() => router.push('/')}
      >
        Go to Home
      </Button>
    </Container>
  );
}