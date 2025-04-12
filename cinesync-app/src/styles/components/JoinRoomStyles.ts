import styled from '@emotion/styled';
import { theme } from '../theme';
import { colors } from '../colors';

export const PageContainer = styled.div`
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  background-color: ${colors.background};
  position: relative;
`;

export const HeaderContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-bottom: 1px solid ${colors.border};
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  color: ${colors.textSecondary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  cursor: pointer;
  font-size: ${theme.typography.sizes.md};
  transition: color ${theme.transitions.fast};
  
  &:hover {
    color: ${colors.text};
  }
  
  svg {
    width: 1.2em;
    height: 1.2em;
  }
`;

export const JoinRoomCard = styled.div`
  background-color: ${colors.cardBackground};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  width: 100%;
  max-width: 400px;
  margin-top: ${theme.spacing.lg};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
`;

export const CardTitle = styled.h2`
  font-size: ${theme.typography.sizes['2xl']};
  margin-bottom: ${theme.spacing.md};
  text-align: center;
`;

export const CardDescription = styled.p`
  font-size: ${theme.typography.sizes.sm};
  margin-bottom: ${theme.spacing.md};
  text-align: center;
  color: ${colors.textSecondary};
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

export const Label = styled.label`
  font-size: ${theme.typography.sizes.sm};
  margin-bottom: ${theme.spacing.xs};
  color: ${colors.textSecondary};
`;

export const ErrorMessage = styled.div`
  color: ${colors.error};
  font-size: ${theme.typography.sizes.sm};
  margin-top: ${theme.spacing.sm};
  text-align: center;
`;
