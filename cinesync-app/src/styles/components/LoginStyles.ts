import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { colors } from '../colors';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, ${colors.background}, ${colors.backgroundDark});
`;

export const FormCard = styled.div`
  background-color: ${colors.cardBackground};
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 40px;
  width: 100%;
  max-width: 420px;
`;

export const Logo = styled.h1`
  color: ${colors.primary};
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 20px;
  text-align: center;
`;

export const Title = styled.h2`
  color: ${colors.text};
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 0 24px;
  text-align: center;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  color: ${colors.textSecondary};
  font-size: 0.9rem;
  font-weight: 500;
`;

export const Input = styled.input`
  background-color: ${colors.inputBackground};
  border: 1px solid ${colors.border};
  border-radius: 6px;
  color: ${colors.text};
  font-size: 1rem;
  padding: 12px 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
    outline: none;
  }
  
  &::placeholder {
    color: ${colors.textMuted};
  }
`;

export const Button = styled.button`
  background-color: ${colors.primary};
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 8px;
  padding: 14px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${colors.primaryDark};
  }
`;

export const ErrorMessage = styled.div`
  background-color: ${colors.errorLight};
  border-radius: 6px;
  color: ${colors.error};
  font-size: 0.9rem;
  margin-bottom: 20px;
  padding: 12px 16px;
`;

export const SignupText = styled.p`
  color: ${colors.textSecondary};
  font-size: 0.9rem;
  margin: 24px 0 0;
  text-align: center;
`;

export const StyledLink = styled(Link)`
  color: ${colors.primary};
  font-weight: 600;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;
