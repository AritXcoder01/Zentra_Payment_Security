const keychainStore = {};

module.exports = {
  ACCESSIBLE: { WHEN_UNLOCKED: 'WHEN_UNLOCKED' },
  setGenericPassword: jest.fn(async (username, password, options) => {
    const service = options?.service || 'default';
    keychainStore[service] = { username, password };
  }),
  getGenericPassword: jest.fn(async (options) => {
    const service = options?.service || 'default';
    return keychainStore[service] || false;
  }),
  resetGenericPassword: jest.fn(async (options) => {
    const service = options?.service || 'default';
    delete keychainStore[service];
  }),
};
