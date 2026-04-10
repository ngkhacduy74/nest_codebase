import { InvalidEmailError } from '@/common/domain/errors/domain.error';
import { Email } from './email.value-object';

describe('EmailValueObject', () => {
  it('should create a valid email', () => {
    // Arrange
    const emailStr = 'test@example.com';

    // Act
    const email = Email.create(emailStr);

    // Assert
    expect(email.value).toBe(emailStr);
  });

  it('should normalize email to lowercase and trim whitespace', () => {
    // Arrange
    const emailStr = '  TEST@example.com  ';

    // Act
    const email = Email.create(emailStr);

    // Assert
    expect(email.value).toBe('test@example.com');
  });

  it('should throw InvalidEmailError for invalid email format', () => {
    // Arrange
    const invalidEmail = 'invalid-email';

    // Act & Assert
    expect(() => Email.create(invalidEmail)).toThrow(InvalidEmailError);
  });

  it('should throw InvalidEmailError for empty string', () => {
    // Act & Assert
    expect(() => Email.create('')).toThrow(InvalidEmailError);
  });

  it('should throw InvalidEmailError if email length > 255', () => {
    // Arrange
    const longEmail = `${'a'.repeat(250)}@example.com`;

    // Act & Assert
    expect(() => Email.create(longEmail)).toThrow(InvalidEmailError);
  });

  it('should return true for equals() if values match', () => {
    // Arrange
    const email1 = Email.create('test@example.com');
    const email2 = Email.create('TEST@example.com');

    // Act & Assert
    expect(email1.equals(email2)).toBe(true);
  });
});
