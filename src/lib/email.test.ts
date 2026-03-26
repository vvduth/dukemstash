import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock resend before importing the module
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: vi.fn() };
  },
}));

describe('isEmailVerificationEnabled', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns false when env var is not set', async () => {
    delete process.env.EMAIL_VERIFICATION_ENABLED;
    const { isEmailVerificationEnabled } = await import('./email');
    expect(isEmailVerificationEnabled()).toBe(false);
  });

  it('returns false when env var is "false"', async () => {
    process.env.EMAIL_VERIFICATION_ENABLED = 'false';
    const { isEmailVerificationEnabled } = await import('./email');
    expect(isEmailVerificationEnabled()).toBe(false);
  });

  it('returns true when env var is "true"', async () => {
    process.env.EMAIL_VERIFICATION_ENABLED = 'true';
    const { isEmailVerificationEnabled } = await import('./email');
    expect(isEmailVerificationEnabled()).toBe(true);
  });
});
