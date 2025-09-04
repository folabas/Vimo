'use client';

import { Box, Button, Container, Typography, useTheme } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const NotFoundPage = () => {
  const theme = useTheme();
  const router = useRouter();

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
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '6rem', sm: '8rem', md: '10rem' },
            fontWeight: 700,
            lineHeight: 1,
            mb: 2,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </Typography>
        
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 600,
            mb: 2,
          }}
        >
          Oops! Page not found
        </Typography>
        
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            maxWidth: '600px',
            mb: 4,
          }}
        >
          The page you're looking for doesn't exist or has been moved. Please check the URL or return to the homepage.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="contained"
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
        </Box>
        
        <Box
          sx={{
            mt: 6,
            position: 'relative',
            width: '100%',
            maxWidth: '500px',
            height: '200px',
            overflow: 'hidden',
            borderRadius: '12px',
            boxShadow: theme.shadows[3],
            '&:before': {
              content: '"404"',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '20rem',
              fontWeight: 900,
              color: theme.palette.mode === 'light' 
                ? 'rgba(0, 0, 0, 0.03)' 
                : 'rgba(255, 255, 255, 0.05)',
              lineHeight: 1,
              zIndex: -1,
            },
          }}
        >
          <Box
            component="img"
            src="/images/404-illustration.svg"
            alt="404 illustration"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.9,
            }}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
