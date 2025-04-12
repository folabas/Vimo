import React from 'react';
import { Link } from 'react-router-dom';
import { useSignup } from '../hooks/useSignup';
import MovieBackground from '../components/MovieBackground';
import {
  FormCard,
  Logo,
  Subtitle,
  Form,
  FormGroup,
  Label,
  Input,
  ErrorMessage,
  SubmitButton,
  LinkContainer
} from '../styles/components/SignupStyles';

const Signup: React.FC = () => {
  const {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    formError,
    error,
    handleSubmit
  } = useSignup();

  return (
    <MovieBackground>
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
    </MovieBackground>
  );
};

export default Signup;
