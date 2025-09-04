'use client';

import { useEffect } from 'react';
import { Box, Button, Container, Typography, useTheme } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Root error boundary caught:', error);
  }, [error]);

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          px: 2,
        }}
      >
        <Box
          sx={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: theme.palette.error.light,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            '&:before': {
              content: '"!"',
              fontSize: '4rem',
              fontWeight: 'bold',
              color: theme.palette.error.contrastText,
              lineHeight: 1,
              marginTop: '-8px',
            },
          }}
        />
        
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 2,
            color: theme.palette.error.main,
          }}
        >
          Something went wrong!
        </Typography>
        
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            maxWidth: '600px',
            mb: 4,
          }}
        >
          We're sorry, but an unexpected error occurred. Our team has been notified and we're working to fix it.
          {process.env.NODE_ENV === 'development' && (
            <Box
              component="pre"
              sx={{
                mt: 3,
                p: 2,
                backgroundColor: theme.palette.background.paper,
                borderRadius: 1,
                textAlign: 'left',
                overflowX: 'auto',
                fontSize: '0.8rem',
                color: theme.palette.error.main,
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              {error.message}
              {error.stack && `\n${error.stack}`}
            </Box>
          )}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => reset()}
            sx={{
              textTransform: 'none',
              px: 4,
              py: 1.5,
              borderRadius: '8px',
              fontWeight: 600,
            }}
          >
            Try Again
          </Button>
          
          <Button
            component={Link}
            href="/"
            variant="outlined"
            color="primary"
            size="large"
            sx={{
              textTransform: 'none',
              px: 4,
              py: 1.5,
              borderRadius: '8px',
              fontWeight: 600,
            }}
          >
            Go to Homepage
          </Button>
          
          <Button
            variant="text"
            color="primary"
            size="large"
            onClick={() => router.back()}
            sx={{
              textTransform: 'none',
              px: 4,
              py: 1.5,
              borderRadius: '8px',
              fontWeight: 600,
            }}
          >
            Go Back
          </Button>
        </Box>
        
        <Box
          sx={{
            mt: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Still having trouble?
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              component="a"
              href="mailto:support@cinesync.com"
              variant="text"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Contact Support
            </Button>
            <Typography variant="body2" color="text.secondary">
              or
            </Typography>
            <Button
              component="a"
              href="https://status.cinesync.com"
              target="_blank"
              rel="noopener noreferrer"
              variant="text"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Check Status
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
