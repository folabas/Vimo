import styled from '@emotion/styled';
import Link from 'next/link';

const colors = {
  primary: '#3f51b5',
  text: '#333',
  error: '#d32f2f',
  cardBackground: '#fff',
  link: '#1976d2',
};

export const FormCard = styled.div`
  background-color: ${colors.cardBackground};
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 40px;
  width: 100%;
  max-width: 480px;
  margin: 20px;
  @media (max-width: 600px) {
    padding: 24px 16px;
    margin: 10px;
    max-width: 100%;
  }
`;

export const Logo = styled.h1`
  color: ${colors.primary};
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 10px;
  text-align: center;
`;

export const Subtitle = styled.h2`
  color: ${colors.text};
  font-size: 1.5rem;
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

export const ErrorMessage = styled.div`
  color: ${colors.error};
  font-size: 0.875rem;
  margin-bottom: 16px;
  padding: 12px;
  background-color: rgba(211, 47, 47, 0.1);
  border-radius: 4px;
  text-align: center;
`;

export const SubmitButton = styled.button`
  background-color: ${colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 10px;
  
  &:hover {
    background-color: #303f9f;
  }
  
  &:disabled {
    background-color: #9fa8da;
    cursor: not-allowed;
  }
`;

export const LinkContainer = styled.div`
  margin-top: 24px;
  text-align: center;
  color: ${colors.text};
  font-size: 0.875rem;
  
  a {
    color: ${colors.link};
    text-decoration: none;
    font-weight: 500;
    margin-left: 4px;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;
