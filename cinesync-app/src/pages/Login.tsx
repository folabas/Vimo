import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();
    
    // Simple validation
    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setFormError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <Container>
      <FormCard>
        <Logo>Vimo</Logo>
        <Title>Log In</Title>
        
        {(formError || error) && (
          <ErrorMessage>{formError || error}</ErrorMessage>
        )}
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </FormGroup>
          
          <Button type="submit">Log In</Button>
        </Form>
        
        <SignupText>
          Don't have an account? <StyledLink to="/signup">Sign Up</StyledLink>
        </SignupText>
      </FormCard>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, ${colors.background}, ${colors.backgroundDark});
`;

const FormCard = styled.div`
  background-color: ${colors.cardBackground};
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 40px;
  width: 100%;
  max-width: 420px;
`;

const Logo = styled.h1`
  color: ${colors.primary};
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 20px;
  text-align: center;
`;

const Title = styled.h2`
  color: ${colors.text};
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 0 24px;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: ${colors.textSecondary};
  font-size: 0.9rem;
  font-weight: 500;
`;

const Input = styled.input`
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

const Button = styled.button`
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

const ErrorMessage = styled.div`
  background-color: ${colors.errorLight};
  border-radius: 6px;
  color: ${colors.error};
  font-size: 0.9rem;
  margin-bottom: 20px;
  padding: 12px 16px;
`;

const SignupText = styled.p`
  color: ${colors.textSecondary};
  font-size: 0.9rem;
  margin: 24px 0 0;
  text-align: center;
`;

const StyledLink = styled(Link)`
  color: ${colors.primary};
  font-weight: 600;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default Login;
