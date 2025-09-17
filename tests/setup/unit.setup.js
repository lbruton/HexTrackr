/**
 * Unit Test Setup
 * Runs before each unit test suite
 */

// Mock SQLite3 for unit tests
jest.mock("sqlite3", () => {
  const mockSqlite = {
    Database: jest.fn().mockImplementation(() => ({
      run: jest.fn((sql, params, callback) => callback && callback(null)),
      get: jest.fn((sql, params, callback) => callback && callback(null, {})),
      all: jest.fn((sql, params, callback) => callback && callback(null, [])),
      each: jest.fn((sql, params, callback) => callback && callback(null, {})),
      close: jest.fn((callback) => callback && callback(null)),
      serialize: jest.fn((callback) => callback && callback()),
      parallelize: jest.fn((callback) => callback && callback()),
      prepare: jest.fn(() => ({
        run: jest.fn(),
        finalize: jest.fn((callback) => callback && callback())
      }))
    })),
    OPEN_READWRITE: 2,
    OPEN_CREATE: 4
  };

  mockSqlite.verbose = jest.fn(() => mockSqlite);
  return mockSqlite;
});

// Mock Socket.IO for unit tests
jest.mock("socket.io", () => ({
  Server: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    to: jest.fn(() => ({
      emit: jest.fn()
    })),
    sockets: {
      emit: jest.fn()
    },
    close: jest.fn()
  }))
}));

// Mock Socket.IO Client for unit tests
jest.mock("socket.io-client", () => ({
  io: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connected: true
  }))
}));

// Mock file system operations that might interfere with tests
jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(() => "{}"),
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn()
}));

// Set test environment
process.env.NODE_ENV = "test";

console.log("Unit test setup completed");