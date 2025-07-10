import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
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
  PasswordInputWrapper,
  PasswordToggle,
  Button,
  ErrorMessage,
  SignupText,
  StyledLink
} from '../styles/components/LoginStyles';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
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
            <PasswordInputWrapper>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  paddingRight: '40px', // Make room for the toggle button
                }}
              />
              <PasswordToggle 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </PasswordToggle>
            </PasswordInputWrapper>
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
