import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();
    
    // Simple validation
    if (!username || !email || !password || !confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    try {
      await register(username, email, password);
      navigate('/');
    } catch (err: any) {
      setFormError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Container>
      <FormCard>
        <Logo>Vimo</Logo>
        <Subtitle>Create Account</Subtitle>
        
        {(formError || error) && (
          <ErrorMessage>{formError || error}</ErrorMessage>
        )}
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
            />
          </FormGroup>
          
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
              placeholder="Create a password"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </FormGroup>
          
          <SubmitButton type="submit">Sign Up</SubmitButton>
        </Form>
        
        <LinkContainer>
          Already have an account? <Link to="/login">Log In</Link>
        </LinkContainer>
      </FormCard>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, ${colors.background}, ${colors.backgroundDark});
`;

const FormCard = styled.div`
  background-color: ${colors.cardBackground};
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 24px;
  width: 100%;
  max-width: 400px;
`;

const Logo = styled.h1`
  color: ${colors.primary};
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 6px;
  text-align: center;
`;

const Subtitle = styled.p`
  color: ${colors.textSecondary};
  font-size: 0.9rem;
  margin: 0 0 16px;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  color: ${colors.textSecondary};
  font-size: 0.85rem;
  font-weight: 500;
`;

const Input = styled.input`
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

const ErrorMessage = styled.div`
  background-color: ${colors.errorLight};
  border-radius: 6px;
  color: ${colors.error};
  font-size: 0.85rem;
  margin-bottom: 8px;
  padding: 8px 12px;
`;

const SubmitButton = styled.button`
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
  
  &:disabled {
    background-color: ${colors.textMuted};
    cursor: not-allowed;
  }
`;

const LinkContainer = styled.div`
  color: ${colors.textSecondary};
  font-size: 0.85rem;
  margin-top: 16px;
  text-align: center;
  
  a {
    color: ${colors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

export default Signup;
