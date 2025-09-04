'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import MovieBackground from '@/components/MovieBackground';
import ProtectedRoute from '@/components/ProtectedRoute';
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
} from '@/styles/components/LoginStyles';

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, error, clearError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError?.();
    
    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setFormError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <MovieBackground>
      <FormCard>
        <Logo>Vimo</Logo>
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
              autoComplete="username"
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
                autoComplete="current-password"
                style={{
                  paddingRight: '40px',
                }}
              />
              <PasswordToggle 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </PasswordToggle>
            </PasswordInputWrapper>
          </FormGroup>
          <Button type="submit">
            Log In
          </Button>
        </Form>
        <SignupText>
          Don't have an account? <StyledLink href="/auth/signup">Sign up</StyledLink>
        </SignupText>
      </FormCard>
    </MovieBackground>
  );
}

export default function LoginPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <LoginForm />
    </ProtectedRoute>
  );
}
