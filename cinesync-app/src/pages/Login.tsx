import React from 'react';
// import { Link } from 'react-router-dom'; // Removed unused import
import { useLogin } from '../hooks/useLogin';
import MovieBackground from '../components/MovieBackground';
import {
  FormCard,
  Logo,
  Title,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  ErrorMessage,
  SignupText,
  StyledLink
} from '../styles/components/LoginStyles';

const Login: React.FC = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    formError,
    error,
    handleSubmit
  } = useLogin();

  return (
    <MovieBackground>
      <FormCard>
        <Logo />
        <Title>Log In</Title>
        {(formError || error) && <ErrorMessage>{formError || error}</ErrorMessage>}
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              required
            />
          </FormGroup>
          <Button type="submit">
            Log In
          </Button>
        </Form>
        <SignupText>
          Don't have an account? <StyledLink to="/signup">Sign up</StyledLink>
        </SignupText>
      </FormCard>
    </MovieBackground>
  );
};

export default Login;
