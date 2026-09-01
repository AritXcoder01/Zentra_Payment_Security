import { normalizeMobileNumber, toMsg91MobileFormat } from '@zentra/shared';

describe('Mobile Normalization Utility', () => {
  it('Scenario 1: Should normalize 10-digit Indian numbers correctly', () => {
    expect(normalizeMobileNumber('9876543210')).toBe('+919876543210');
  });

  it('Scenario 1: Should normalize numbers starting with 0', () => {
    expect(normalizeMobileNumber('09876543210')).toBe('+919876543210');
  });

  it('Scenario 1: Should normalize numbers starting with 91', () => {
    expect(normalizeMobileNumber('919876543210')).toBe('+919876543210');
  });

  it('Scenario 1: Should handle formatted numbers with spaces or hyphens', () => {
    expect(normalizeMobileNumber('+91 98765-43210')).toBe('+919876543210');
  });

  it('Scenario 1: Should format number for MSG91 API without + prefix', () => {
    expect(toMsg91MobileFormat('+919876543210')).toBe('919876543210');
  });

  it('Scenario 2: Should reject invalid mobile numbers', () => {
    expect(() => normalizeMobileNumber('12345')).toThrow('Invalid mobile number format');
    expect(() => normalizeMobileNumber('5876543210')).toThrow('Invalid mobile number format');
    expect(() => normalizeMobileNumber('abcdefghij')).toThrow('Invalid mobile number format');
  });
});
