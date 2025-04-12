import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export const useLogin = () => {
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
      // Navigate to dashboard on successful login
      navigate('/dashboard');
    } catch (err: any) {
      setFormError(err.message || 'Login failed. Please try again.');
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    formError,
    error,
    handleSubmit
  };
};
