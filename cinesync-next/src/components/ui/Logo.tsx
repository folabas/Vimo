import { Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ReactNode } from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'text' | 'icon' | 'full';
  className?: string;
}

const sizeMap = {
  small: { fontSize: '1.5rem', iconSize: 24 },
  medium: { fontSize: '2rem', iconSize: 32 },
  large: { fontSize: '3rem', iconSize: 48 },
};

const LogoContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  textDecoration: 'none',
  '&:hover': {
    opacity: 0.9,
  },
});

const LogoText = styled(Typography)({
  fontWeight: 700,
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textFillColor: 'transparent',
});

const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  variant = 'full',
  className = '',
}) => {
  const { fontSize, iconSize } = sizeMap[size];
  
  const renderIcon = () => (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: iconSize,
        height: iconSize,
        borderRadius: '4px',
        backgroundColor: 'primary.main',
        color: 'white',
        fontSize: fontSize,
        fontWeight: 'bold',
      }}
    >
      CS
    </Box>
  );

  const renderText = () => (
    <LogoText
      variant="h1"
      sx={{
        fontSize,
        lineHeight: 1,
      }}
    >
      CineSync
    </LogoText>
  );

  return (
    <LogoContainer className={className} component="a" href="/">
      {variant !== 'text' && renderIcon()}
      {(variant === 'full' || variant === 'text') && renderText()}
    </LogoContainer>
  );
};

export default Logo;
