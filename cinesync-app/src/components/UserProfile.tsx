import React from 'react';
import styled from '@emotion/styled';
import { colors } from '../styles/colors';
import { useAuth } from '../hooks/useAuth';

interface UserProfileProps {
  size?: 'small' | 'medium' | 'large';
  showUsername?: boolean;
  className?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  size = 'medium', 
  showUsername = true,
  className
}) => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  // Generate initials from username
  const initials = user.username
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
  
  return (
    <Container className={className}>
      <Avatar size={size} hasImage={!!user.profilePicture}>
        {user.profilePicture ? (
          <AvatarImage src={user.profilePicture} alt={user.username} />
        ) : (
          <Initials>{initials}</Initials>
        )}
      </Avatar>
      {showUsername && <Username size={size}>{user.username}</Username>}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Avatar = styled.div<{ size: string; hasImage: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: ${props => props.hasImage ? 'transparent' : colors.primary};
  overflow: hidden;
  
  ${props => {
    switch(props.size) {
      case 'small':
        return `
          width: 32px;
          height: 32px;
        `;
      case 'large':
        return `
          width: 64px;
          height: 64px;
        `;
      case 'medium':
      default:
        return `
          width: 40px;
          height: 40px;
        `;
    }
  }}
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Initials = styled.span`
  color: white;
  font-weight: 600;
`;

const Username = styled.span<{ size: string }>`
  color: ${colors.text};
  font-weight: 500;
  
  ${props => {
    switch(props.size) {
      case 'small':
        return `font-size: 0.85rem;`;
      case 'large':
        return `font-size: 1.1rem;`;
      case 'medium':
      default:
        return `font-size: 0.95rem;`;
    }
  }}
`;

export default UserProfile;
