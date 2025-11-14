import { supabase } from '../lib/supabase';

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface PasswordStrength {
  strength: 'weak' | 'medium' | 'strong';
  score: number; // 0-100
  feedback: string[];
}

// Email validation with proper regex
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }

  // RFC 5322 compliant email regex (simplified but robust)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  if (email.length > 254) {
    return { isValid: false, message: 'Email address is too long' };
  }

  return { isValid: true };
};

// Password validation - SIMPLIFIED (just length requirement)
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }

  return { isValid: true };
};

// Get password strength - SIMPLIFIED (just based on length)
export const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { strength: 'weak', score: 0, feedback: ['Password is required'] };
  }

  let score = 0;
  let strength: 'weak' | 'medium' | 'strong';

  // Simple length-based scoring
  if (password.length >= 6) score += 40;
  if (password.length >= 8) score += 30;
  if (password.length >= 12) score += 30;

  // Determine strength
  if (score < 50) strength = 'weak';
  else if (score < 80) strength = 'medium';
  else strength = 'strong';

  return { strength, score: Math.min(100, score), feedback: [] };
};

// Username validation
export const validateUsername = (username: string): ValidationResult => {
  if (!username) {
    return { isValid: false, message: 'Username is required' };
  }

  if (username.length < 3) {
    return { isValid: false, message: 'Username must be at least 3 characters long' };
  }

  if (username.length > 20) {
    return { isValid: false, message: 'Username must be no more than 20 characters long' };
  }

  // Only alphanumeric characters and underscores
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' };
  }

  // Must start with a letter
  if (!/^[a-zA-Z]/.test(username)) {
    return { isValid: false, message: 'Username must start with a letter' };
  }

  return { isValid: true };
};

// Check username uniqueness in database
export const checkUsernameUniqueness = async (username: string): Promise<ValidationResult> => {
  if (!username) {
    return { isValid: false, message: 'Username is required' };
  }

  try {
    const { data, error } = await supabase
      .from('players')
      .select('username')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" which means username is available
      return { isValid: false, message: 'Unable to check username availability' };
    }

    if (data) {
      return { isValid: false, message: 'Username is already taken' };
    }

    return { isValid: true, message: 'Username is available' };
  } catch (err) {
    return { isValid: false, message: 'Unable to check username availability' };
  }
};

// Translate Supabase error codes to user-friendly messages
export const translateSupabaseError = (error: any): string => {
  if (!error) return 'An unexpected error occurred';

  const message = error.message?.toLowerCase() || '';

  // Authentication errors
  if (message.includes('invalid login credentials') || message.includes('invalid email or password')) {
    return 'Invalid email or password';
  }

  if (message.includes('email not confirmed')) {
    return 'Please check your email and confirm your account';
  }

  if (message.includes('user already registered')) {
    return 'An account with this email already exists';
  }

  if (message.includes('signup is disabled')) {
    return 'Account registration is temporarily disabled';
  }

  if (message.includes('email rate limit')) {
    return 'Too many attempts. Please wait before trying again';
  }

  if (message.includes('password')) {
    return 'Password does not meet security requirements';
  }

  if (message.includes('network') || message.includes('fetch')) {
    return 'Network error. Please check your connection';
  }

  // Database errors
  if (message.includes('duplicate') || message.includes('unique')) {
    return 'This email is already registered';
  }

  // Default fallback
  return error.message || 'Something went wrong. Please try again';
};

// Validate confirm password matches
export const validatePasswordMatch = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, message: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }

  return { isValid: true };
};