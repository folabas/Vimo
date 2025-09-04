import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ButtonProps extends MuiButtonProps {
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
}

const StyledButton = styled(MuiButton)(({ theme, variant = 'contained', size = 'medium', fullWidth = false }) => ({
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 600,
  padding: size === 'large' ? '12px 24px' : size === 'small' ? '6px 12px' : '8px 16px',
  width: fullWidth ? '100%' : 'auto',
  '&.Mui-disabled': {
    opacity: 0.6,
  },
  ...(variant === 'contained' && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  }),
  ...(variant === 'outlined' && {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
      borderColor: theme.palette.primary.dark,
    },
  }),
}));

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  startIcon,
  endIcon,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : startIcon}
      endIcon={loading ? null : endIcon}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
