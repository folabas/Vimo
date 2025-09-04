import { Avatar, Box, Divider, Rating, Stack, Typography } from '@mui/material';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import Image from 'next/image';
import { MovieReview } from '@/services/tmdb';

interface MovieReviewsProps {
  reviews: MovieReview[];
}

const MovieReviews = ({ reviews }: MovieReviewsProps) => {
  if (reviews.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No reviews available for this movie yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3} divider={<Divider />}>
      {reviews.map((review) => (
        <Box key={review.id}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Avatar 
              sx={{ width: 48, height: 48 }}
              src={
                review.author_details.avatar_path
                  ? `https://image.tmdb.org/t/p/w200${review.author_details.avatar_path}`
                  : '/images/default-avatar.png'
              }
              alt={review.author}
            />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="subtitle1" fontWeight="medium" sx={{ color: 'white' }}>
                  {review.author}
                </Typography>
                {review.author_details.rating && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Rating 
                      value={review.author_details.rating / 2} 
                      precision={0.5} 
                      size="small" 
                      readOnly 
                    />
                    <Typography variant="body2" color="text.secondary">
                      {review.author_details.rating.toFixed(1)}/10
                    </Typography>
                  </Box>
                )}
              </Box>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
              </Typography>
            </Box>
          </Box>
          <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-line', color: 'rgba(255, 255, 255, 0.9)' }}>
            {review.content}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};

export default MovieReviews;
