import React from 'react';
import styled from '@emotion/styled';
import { theme } from '../styles/theme';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const InputContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  margin-bottom: ${theme.spacing.md};
`;

const InputLabel = styled.label`
  font-size: ${theme.typography.sizes.sm};
  margin-bottom: ${theme.spacing.xs};
  color: ${theme.colors.textSecondary};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input<{ hasError?: boolean; hasIcon?: boolean }>`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  padding-left: ${props => props.hasIcon ? '2.5rem' : theme.spacing.md};
  font-size: ${theme.typography.sizes.md};
  background-color: ${theme.colors.backgroundLight};
  color: ${theme.colors.text};
  border: 1px solid ${props => props.hasError ? theme.colors.error : 'transparent'};
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.hasError 
      ? `rgba(231, 76, 60, 0.2)` 
      : `rgba(231, 76, 60, 0.2)`};
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  left: ${theme.spacing.sm};
  color: ${theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 1.2em;
    height: 1.2em;
  }
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  font-size: ${theme.typography.sizes.sm};
  margin-top: ${theme.spacing.xs};
`;

export const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = false,
  icon,
  ...props
}) => {
  return (
    <InputContainer fullWidth={fullWidth}>
      {label && <InputLabel>{label}</InputLabel>}
      <InputWrapper>
        {icon && <IconWrapper>{icon}</IconWrapper>}
        <StyledInput 
          hasError={!!error} 
          hasIcon={!!icon}
          {...props} 
        />
      </InputWrapper>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  );
};

export default Input;
