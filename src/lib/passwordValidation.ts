// src/lib/passwordValidation.ts

export interface PasswordValidationResult {
  isValid: boolean;
  message?: string;
}

export function validatePassword(password: string): PasswordValidationResult {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 3) {
    return { isValid: false, message: 'Password must be at least 3 characters long' };
  }
  // if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
  //   return { isValid: false, message: 'Password must contain both letters and numbers' };
  // }
  return { isValid: true };
}