import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { colors } from '../colors';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, ${colors.background}, ${colors.backgroundDark});
  @media (max-width: 600px) {
    padding: 10px;
    min-height: 100vh;
  }
`;

export const FormCard = styled.div`
  background-color: ${colors.cardBackground};
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 24px;
  width: 100%;
  max-width: 400px;
  @media (max-width: 600px) {
    padding: 12px 4px;
    max-width: 100vw;
  }
`;

export const Logo = styled.h1`
  color: ${colors.primary};
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 6px;
  text-align: center;
`;

export const Subtitle = styled.p`
  color: ${colors.textSecondary};
  font-size: 0.9rem;
  margin: 0 0 16px;
  text-align: center;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Label = styled.label`
  color: ${colors.textSecondary};
  font-size: 0.85rem;
  font-weight: 500;
`;

export const Input = styled.input`
  background-color: ${colors.inputBackground};
  border: 1px solid ${colors.border};
  border-radius: 6px;
  color: ${colors.text};
  font-size: 0.95rem;
  padding: 8px 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
    outline: none;
  }
  
  &::placeholder {
    color: ${colors.textMuted};
  }
`;

export const ErrorMessage = styled.div`
  background-color: ${colors.errorLight};
  border-radius: 6px;
  color: ${colors.error};
  font-size: 0.85rem;
  margin-bottom: 8px;
  padding: 8px 12px;
`;

export const SubmitButton = styled.button`
  background-color: ${colors.primary};
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  margin-top: 8px;
  padding: 10px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${colors.primaryDark};
  }
`;

export const LinkContainer = styled.p`
  color: ${colors.textSecondary};
  font-size: 0.85rem;
  margin: 16px 0 0;
  text-align: center;
  
  a {
    color: ${colors.primary};
    font-weight: 600;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;
