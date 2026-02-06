jest.mock('jose', () => ({
  createRemoteJWKSet: jest.fn(() => ({})),
  jwtVerify: jest.fn(() => Promise.resolve({ payload: { sub: 'test-user' } })),
}));
