import { Avatar, Box, Typography, IconButton, Menu, MenuItem, Divider, useTheme } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  AccountCircle as ProfileIcon,
} from '@mui/icons-material';

interface UserProfileProps {
  size?: number;
  showName?: boolean;
  showMenu?: boolean;
}

const UserProfile = ({ size = 40, showName = true, showMenu = true }: UserProfileProps) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    router.push('/dashboard/profile');
  };

  const handleSettingsClick = () => {
    handleMenuClose();
    router.push('/dashboard/settings');
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    router.push('/auth/login');
  };

  const userInitial = user?.username?.charAt(0).toUpperCase() || 'U';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          cursor: showMenu ? 'pointer' : 'default',
          '&:hover': {
            opacity: showMenu ? 0.8 : 1,
          },
        }}
        onClick={showMenu ? handleMenuOpen : undefined}
      >
        <Avatar
          sx={{
            width: size,
            height: size,
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            fontSize: size * 0.5,
            fontWeight: 'bold',
            ...(showMenu && {
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }),
          }}
          src={user?.profilePicture}
        >
          {!user?.profilePicture && userInitial}
        </Avatar>
        
        {showName && user?.username && (
          <Typography 
            variant="subtitle1" 
            sx={{ 
              ml: 2, 
              fontWeight: 500,
              color: 'text.primary',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {user.username}
          </Typography>
        )}
      </Box>

      {showMenu && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
              mt: 1.5,
              minWidth: 200,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {user?.username || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user?.email || ''}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <MenuItem onClick={handleProfileClick}>
            <ProfileIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
            <Typography variant="body2">Profile</Typography>
          </MenuItem>
          
          <MenuItem onClick={handleSettingsClick}>
            <SettingsIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
            <Typography variant="body2">Settings</Typography>
          </MenuItem>
          
          <Divider sx={{ my: 1 }} />
          
          <MenuItem onClick={handleLogout}>
            <LogoutIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
            <Typography variant="body2">Logout</Typography>
          </MenuItem>
        </Menu>
      )}
    </Box>
  );
};

export default UserProfile;
