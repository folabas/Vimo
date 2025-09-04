import { Skeleton, Box } from '@mui/material';

const MovieDetailsSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Backdrop Skeleton */}
      <Box sx={{ position: 'relative', height: '500px', width: '100%', bgcolor: 'grey.300' }}>
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            p: 4,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))'
          }}
        >
          <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 3fr' }, gap: 4 }}>
              <Box>
                <Skeleton 
                  variant="rectangular" 
                  width="100%" 
                  sx={{ 
                    height: 0, 
                    paddingBottom: '150%',
                    borderRadius: 2,
                    bgcolor: 'grey.400'
                  }} 
                />
              </Box>
              <Box>
                <Box sx={{ color: 'white' }}>
                  <Skeleton width="60%" height={60} sx={{ bgcolor: 'grey.400' }} />
                  <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
                    <Skeleton width="80px" height={24} sx={{ bgcolor: 'grey.400' }} />
                    <Skeleton width="60px" height={24} sx={{ bgcolor: 'grey.400' }} />
                    <Skeleton width="70px" height={24} sx={{ bgcolor: 'grey.400' }} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, my: 2, flexWrap: 'wrap' }}>
                    {[1, 2, 3].map((item) => (
                      <Skeleton 
                        key={item} 
                        width="80px" 
                        height={32} 
                        sx={{ 
                          borderRadius: '16px',
                          bgcolor: 'grey.400'
                        }} 
                      />
                    ))}
                  </Box>
                  <Skeleton width="40%" height={24} sx={{ bgcolor: 'grey.400', my: 2 }} />
                  <Skeleton width="100%" height={24} sx={{ bgcolor: 'grey.400', my: 1 }} />
                  <Skeleton width="90%" height={24} sx={{ bgcolor: 'grey.400', my: 1 }} />
                  <Skeleton width="80%" height={24} sx={{ bgcolor: 'grey.400', my: 1 }} />
                  
                  <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                    <Skeleton 
                      variant="rectangular" 
                      width={180} 
                      height={40} 
                      sx={{ 
                        borderRadius: '20px',
                        bgcolor: 'grey.400'
                      }} 
                    />
                    <Skeleton 
                      variant="rectangular" 
                      width={180} 
                      height={40} 
                      sx={{ 
                        borderRadius: '20px',
                        bgcolor: 'grey.400'
                      }} 
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content Skeleton */}
      <Box sx={{ maxWidth: '1200px', margin: '40px auto', px: 2 }}>
        {/* Cast Section Skeleton */}
        <Box sx={{ mb: 6 }}>
          <Skeleton width="200px" height={32} sx={{ mb: 3, bgcolor: 'grey.300' }} />
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: 'repeat(2, 1fr)', 
              sm: 'repeat(3, 1fr)',
              md: 'repeat(5, 1fr)' 
            },
            gap: 2
          }}>
            {[1, 2, 3, 4, 5].map((item) => (
              <Box key={item}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                  <Skeleton 
                    variant="circular" 
                    width={96} 
                    height={96} 
                    sx={{ bgcolor: 'grey.300' }} 
                  />
                  <Skeleton width={80} height={24} sx={{ mt: 1, bgcolor: 'grey.300' }} />
                  <Skeleton width={60} height={20} sx={{ bgcolor: 'grey.300' }} />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Reviews Section Skeleton */}
        <Box sx={{ mb: 6 }}>
          <Skeleton width="200px" height={32} sx={{ mb: 3, bgcolor: 'grey.300' }} />
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Skeleton variant="circular" width={48} height={48} sx={{ bgcolor: 'grey.300' }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton width="40%" height={24} sx={{ bgcolor: 'grey.300', mb: 1 }} />
                <Skeleton width="30%" height={20} sx={{ bgcolor: 'grey.300' }} />
              </Box>
            </Box>
            <Skeleton width="100%" height={20} sx={{ bgcolor: 'grey.300', mb: 1 }} />
            <Skeleton width="90%" height={20} sx={{ bgcolor: 'grey.300', mb: 1 }} />
            <Skeleton width="80%" height={20} sx={{ bgcolor: 'grey.300' }} />
          </Box>
        </Box>

        {/* More Like This Section Skeleton */}
        <Box>
          <Skeleton width="200px" height={32} sx={{ mb: 3, bgcolor: 'grey.300' }} />
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: 'repeat(2, 1fr)', 
              sm: 'repeat(3, 1fr)',
              md: 'repeat(5, 1fr)' 
            },
            gap: 2
          }}>
            {[1, 2, 3, 4, 5].map((item) => (
              <Box key={item}>
                <Skeleton 
                  variant="rectangular" 
                  width="100%" 
                  sx={{
                    height: 0,
                    paddingBottom: '150%',
                    borderRadius: 2,
                    bgcolor: 'grey.300'
                  }} 
                />
                <Skeleton width="100%" height={24} sx={{ mt: 1, bgcolor: 'grey.300' }} />
                <Skeleton width="60%" height={20} sx={{ bgcolor: 'grey.300' }} />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default MovieDetailsSkeleton;
