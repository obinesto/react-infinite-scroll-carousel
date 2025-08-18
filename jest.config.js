// export default {
//   testEnvironment: 'jsdom',
//   setupFilesAfterEnv: ['<rootDir>/jest.setup.mjs'],
//   moduleNameMapper: {
//     '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
//     '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/test/__mocks__/fileMock.js'
//   },
//   transform: {
//     '^.+\\.(ts|tsx)$': 'ts-jest'
//   },
//   extensionsToTreatAsEsm: ['.ts', '.tsx'],
//   globals: {
//     'ts-jest': { useESM: true }
//   }
// };

export default{
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest'
  },
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};