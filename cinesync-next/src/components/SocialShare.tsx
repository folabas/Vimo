import { Box, Button, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Link as LinkIcon,
  Share as ShareIcon,
  MoreHoriz as MoreIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import { useState } from 'react';

interface SocialShareProps {
  title: string;
  url: string;
  description?: string;
}

const SocialShare = ({ title, url, description = '' }: SocialShareProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`,
      'facebook-share-dialog',
      'width=626,height=436'
    );
    handleClose();
  };

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
        `${title} ${description ? `- ${description.substring(0, 100)}...` : ''}`
      )}`,
      'twitter-share-dialog',
      'width=626,height=436'
    );
    handleClose();
  };

  const shareOnWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`,
      '_blank'
    );
    handleClose();
  };

  const shareViaEmail = () => {
    window.open(
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
        `${title}\n\n${description || ''}\n\n${url}`
      )}`
    );
    handleClose();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    // You might want to add a snackbar or toast notification here
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
        Share:
      </Typography>
      
      <IconButton
        aria-label="Share on Facebook"
        onClick={shareOnFacebook}
        size="small"
        sx={{ color: '#1877F2' }}
      >
        <FacebookIcon />
      </IconButton>
      
      <IconButton
        aria-label="Share on Twitter"
        onClick={shareOnTwitter}
        size="small"
        sx={{ color: '#1DA1F2' }}
      >
        <TwitterIcon />
      </IconButton>
      
      <IconButton
        aria-label="Share on WhatsApp"
        onClick={shareOnWhatsApp}
        size="small"
        sx={{ color: '#25D366' }}
      >
        <WhatsAppIcon />
      </IconButton>
      
      <IconButton
        aria-label="Copy link"
        onClick={copyToClipboard}
        size="small"
        sx={{ color: 'text.secondary' }}
      >
        <LinkIcon />
      </IconButton>
      
      <IconButton
        aria-label="More sharing options"
        onClick={handleClick}
        size="small"
        sx={{ color: 'text.secondary' }}
      >
        <MoreIcon />
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={shareViaEmail}>
          <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography>Email</Typography>
        </MenuItem>
        <MenuItem onClick={copyToClipboard}>
          <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography>Copy link</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default SocialShare;
