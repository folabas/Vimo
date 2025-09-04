import styled from '@emotion/styled';
import Link from 'next/link';

const colors = {
  primary: '#3f51b5',
  text: '#333',
  error: '#d32f2f',
  cardBackground: '#fff',
  // Add other colors as needed
};

export const FormCard = styled.div`
  background-color: ${colors.cardBackground};
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 40px;
  width: 100%;
  max-width: 420px;
  @media (max-width: 600px) {
    padding: 16px 8px;
    max-width: 100vw;
  }
`;

export const Logo = styled.div`
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
  color: ${colors.text};
  font-size: 0.875rem;
  font-weight: 500;
`;

export const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.2);
  }
`;

export const PasswordInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const PasswordToggle = styled.button`
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 4px 8px;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

export const Button = styled.button`
  background-color: ${colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #303f9f;
  }
  
  &:disabled {
    background-color: #9fa8da;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.div`
  color: ${colors.error};
  font-size: 0.875rem;
  margin-bottom: 16px;
  padding: 8px 12px;
  background-color: rgba(211, 47, 47, 0.1);
  border-radius: 4px;
`;

export const SignupText = styled.p`
  color: #666;
  font-size: 0.875rem;
  text-align: center;
  margin-top: 24px;
`;

export const StyledLink = styled(Link)`
  color: ${colors.primary};
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;
