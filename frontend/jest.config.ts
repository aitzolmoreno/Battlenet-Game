import type { Config } from 'jest';

const config: Config = {
    rootDir: './',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ["<rootDir>/test/jest.setup.ts"],
    transform: {
        "^.+\\.tsx?$": "ts-jest"
    },
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/test/mocks/styleMock.js',
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/test/mocks/fileMock.js',
    },
}

export default config