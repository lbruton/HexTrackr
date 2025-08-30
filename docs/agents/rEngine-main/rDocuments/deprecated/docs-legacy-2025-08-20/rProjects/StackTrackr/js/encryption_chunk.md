# Encryption Manager Documentation

## Purpose & Overview

The `StackrTrackrEncryption` class is a comprehensive encryption management system for a web application. It provides secure storage and retrieval of data in the user's browser, ensuring that sensitive information is protected even if the user's device is compromised.

The main features of this encryption manager include:

1. **Encryption and Decryption**: The ability to encrypt and decrypt data using a master password, providing a secure storage mechanism for sensitive information.
2. **Backward Compatibility**: Support for both encrypted and unencrypted data storage, allowing for seamless migration of existing data.
3. **Emergency Decryption**: A debug mode that allows for the emergency decryption of all encrypted data, which can be useful for debugging and troubleshooting purposes.
4. **Encryption Status Tracking**: The ability to track the encryption status of individual keys, including whether the data is encrypted, unencrypted, or missing.
5. **Encryption Migration**: A migration process that can automatically convert unencrypted data to encrypted storage.
6. **Emergency Disabling**: An emergency procedure to disable encryption and decrypt all data back to plain storage, in case of a critical issue or security breach.

## Technical Architecture

The `StackrTrackrEncryption` class is the core of the encryption manager. It provides the following key components and functionality:

1. **Encryption and Decryption**: The `storeEncrypted()` and `retrieveDecrypted()` methods handle the encryption and decryption of data using the user's master password.
2. **Secure Storage**: The `secureStore()` and `secureRetrieve()` methods provide a backward-compatible interface for storing and retrieving data, automatically handling encryption and decryption as needed.
3. **Encryption Migration**: The `migrateToEncrypted()` method migrates existing unencrypted data to encrypted storage.
4. **Encryption Status Checking**: The `hasEncryptedData()`, `hasUnencryptedData()`, and `getDataStatus()` methods allow for the inspection of the encryption status of individual keys.
5. **Emergency Decryption and Disabling**: The `emergencyDecryptAll()` and `emergencyDisableEncryption()` methods provide emergency procedures for decrypting all data and disabling encryption, respectively.

The `MasterPasswordUI` class is a separate component that manages the user interface for interacting with the encryption manager. It sets up event listeners for the various encryption-related actions and updates the UI based on the encryption manager's state.

## Dependencies

The `StackrTrackrEncryption` class does not have any external dependencies. It uses the browser's built-in `localStorage` API for storing and retrieving data.

## Key Functions/Classes

### `StackrTrackrEncryption` Class

## `constructor()`

- **Description**: Initializes the encryption manager with default configuration values.
- **Parameters**: None
- **Return Value**: None

## `setupEncryption(password, salt)`

- **Description**: Sets up the encryption system with the provided master password and salt.
- **Parameters**:
  - `password` (string): The user's master password.
  - `salt` (string): A unique salt value used for encryption.
- **Return Value**: Promise that resolves to `true` if the setup is successful, `false` otherwise.

## `unlockWithPassword(password)`

- **Description**: Unlocks the encryption system with the provided password.
- **Parameters**:
  - `password` (string): The user's master password.
- **Return Value**: Promise that resolves to `true` if the unlock is successful, `false` otherwise.

## `isUnlocked()`

- **Description**: Checks if the encryption system is currently unlocked.
- **Parameters**: None
- **Return Value**: `true` if the system is unlocked, `false` otherwise.

## `hasMasterPassword()`

- **Description**: Checks if a master password has been set up for the encryption system.
- **Parameters**: None
- **Return Value**: `true` if a master password is set, `false` otherwise.

## `storeEncrypted(key, data)`

- **Description**: Encrypts the provided data and stores it in the browser's storage.
- **Parameters**:
  - `key` (string): The storage key for the encrypted data.
  - `data` (any): The data to be encrypted and stored.
- **Return Value**: Promise that resolves to `true` if the storage is successful, `false` otherwise.

## `retrieveDecrypted(key)`

- **Description**: Retrieves the encrypted data from the browser's storage and decrypts it.
- **Parameters**:
  - `key` (string): The storage key for the encrypted data.
- **Return Value**: Promise that resolves to the decrypted data.

## `secureStore(key, data)`

- **Description**: Securely stores the provided data, either encrypted or unencrypted, depending on the encryption state.
- **Parameters**:
  - `key` (string): The storage key for the data.
  - `data` (any): The data to be stored.
- **Return Value**: Promise that resolves to `true` if the storage is successful, `false` otherwise.

## `secureRetrieve(key, defaultValue = null)`

- **Description**: Securely retrieves the data for the provided key, decrypting it if necessary.
- **Parameters**:
  - `key` (string): The storage key for the data.
  - `defaultValue` (any, optional): The default value to return if the data is not found.
- **Return Value**: The retrieved data, or the provided default value if the data is not found.

## `migrateToEncrypted()`

- **Description**: Migrates existing unencrypted data to encrypted storage.
- **Parameters**: None
- **Return Value**: Promise that resolves to the number of items migrated.

## `hasEncryptedData(key)`

- **Description**: Checks if the specified key has encrypted data stored.
- **Parameters**:
  - `key` (string): The storage key to check.
- **Return Value**: `true` if the key has encrypted data, `false` otherwise.

## `hasUnencryptedData(key)`

- **Description**: Checks if the specified key has unencrypted data stored.
- **Parameters**:
  - `key` (string): The storage key to check.
- **Return Value**: `true` if the key has unencrypted data, `false` otherwise.

## `getDataStatus()`

- **Description**: Retrieves the encryption status for all protected keys.
- **Parameters**: None
- **Return Value**: An object with the following properties:
  - `encrypted`: Array of keys with encrypted data.
  - `unencrypted`: Array of keys with unencrypted data.
  - `missing`: Array of keys with no data.

## `emergencyDecryptAll()`

- **Description**: Decrypts all encrypted data and returns it in plain format, for debugging purposes.
- **Parameters**: None
- **Return Value**: An object with all decrypted data.

## `emergencyDisableEncryption(password)`

- **Description**: Disables encryption and decrypts all data back to plain storage.
- **Parameters**:
  - `password` (string): The user's master password.
- **Return Value**: `true` if the emergency disable is successful, `false` otherwise.

### `MasterPasswordUI` Class

## `constructor()` (2)

- **Description**: Initializes the Master Password UI, sets up event listeners, and updates the UI based on the encryption manager's state.
- **Parameters**: None
- **Return Value**: None

## `initializeEventListeners()`

- **Description**: Sets up event listeners for the various encryption-related actions.
- **Parameters**: None
- **Return Value**: None

## `updateUI()`

- **Description**: Updates the UI to reflect the current state of the encryption manager.
- **Parameters**: None
- **Return Value**: None

## `updateDataStatus()`

- **Description**: Updates the data status display in the UI based on the encryption manager's data status.
- **Parameters**: None
- **Return Value**: None

## `setupEncryption()`

- **Description**: Initiates the setup of the encryption system with the user-provided master password.
- **Parameters**: None
- **Return Value**: None

## `unlockEncryption()`

- **Description**: Unlocks the encryption system with the user-provided password.
- **Parameters**: None
- **Return Value**: None

## `lockEncryption()`

- **Description**: Locks the encryption system, effectively encrypting all data.
- **Parameters**: None
- **Return Value**: None

## `showChangePassword()`

- **Description**: Displays the UI for changing the master password.
- **Parameters**: None
- **Return Value**: None

## `changePassword()`

- **Description**: Changes the master password for the encryption system.
- **Parameters**: None
- **Return Value**: None

## `hideChangePassword()`

- **Description**: Hides the UI for changing the master password.
- **Parameters**: None
- **Return Value**: None

## `migrateData()`

- **Description**: Initiates the migration of unencrypted data to encrypted storage.
- **Parameters**: None
- **Return Value**: None

## `emergencyDisable()`

- **Description**: Initiates the emergency disabling of the encryption system.
- **Parameters**: None
- **Return Value**: None

## Usage Examples

### Storing and Retrieving Encrypted Data

```javascript
// Store data securely
await encryptionManager.secureStore('sensitive_data', { secret: 'my_secret' });

// Retrieve encrypted data
const data = await encryptionManager.secureRetrieve('sensitive_data');
console.log(data); // Output: { secret: 'my_secret' }
```

### Migrating Unencrypted Data to Encrypted Storage

```javascript
// Migrate existing unencrypted data to encrypted storage
await encryptionManager.migrateToEncrypted();
```

### Checking Encryption Status

```javascript
// Get the encryption status for all protected keys
const status = encryptionManager.getDataStatus();
console.log(status);
/*
{
  encrypted: ['sensitive_data'],
  unencrypted: ['legacy_data'],
  missing: ['new_data']
}
*/
```

### Emergency Decryption and Disabling

```javascript
// Emergency decrypt all data (for debugging)
const allData = await encryptionManager.emergencyDecryptAll();
console.log(allData);

// Emergency disable encryption (WARNING: This will leave all data unencrypted)
const disabled = await encryptionManager.emergencyDisableEncryption('my_master_password');
console.log(disabled); // Output: true
```

## Configuration

The `StackrTrackrEncryption` class has the following configuration options:

- `encryptedStoragePrefix`: The prefix used for encrypted data keys in `localStorage` (default: `'encrypted_'`).
- `protectedKeys`: An array of keys that should be protected by encryption (default: `[]`).
- `saltKey`: The key used to store the encryption salt in `localStorage` (default: `'encryption_salt'`).
- `debugDecryption`: A flag to enable debug mode, which allows for emergency decryption (default: `false`).

These configuration options can be set during the initialization of the `StackrTrackrEncryption` class.

## Error Handling

The `StackrTrackrEncryption` class handles errors by logging them to the console and returning appropriate error messages or default values. For example, if a key cannot be decrypted, the `secureRetrieve()` method will return the provided default value instead of throwing an error.

In the case of critical errors, such as the inability to unlock the encryption system, the class will throw an `Error` object with a descriptive message.

## Integration

The `StackrTrackrEncryption` class is designed to be a self-contained encryption management system that can be easily integrated into a larger web application. The `MasterPasswordUI` class provides a user interface for interacting with the encryption manager, but the `StackrTrackrEncryption` class can be used independently if desired.

To integrate the encryption manager into your application, you can create an instance of the `StackrTrackrEncryption` class and use its methods to securely store and retrieve data. The `MasterPasswordUI` class can be used to provide a user-friendly interface for managing the encryption system.

## Development Notes

1. **Backward Compatibility**: The `secureStore()` and `secureRetrieve()` methods are designed to provide backward compatibility with existing unencrypted data. This allows for a gradual migration of data to the encrypted storage system without breaking existing functionality.

1. **Encryption Algorithm**: The encryption and decryption processes use the browser's built-in `crypto.subtle` API, which provides a secure implementation of the AES-GCM algorithm. This ensures that the encryption is strong and up-to-date with modern security standards.

1. **Emergency Decryption and Disabling**: The `emergencyDecryptAll()` and `emergencyDisableEncryption()` methods are provided for debugging and troubleshooting purposes. However, these methods should be used with caution, as they can leave sensitive data in an unencrypted state.

1. **Encryption Status Tracking**: The `getDataStatus()` method provides a comprehensive overview of the encryption status for all protected keys. This can be useful for monitoring the overall state of the encryption system and identifying any potential issues or migration requirements.

1. **User Interface**: The `MasterPasswordUI` class provides a user-friendly interface for interacting with the encryption manager. This includes features such as setting up the encryption, unlocking the system, changing the master password, and migrating data. The UI is designed to be easily customizable and integrated into the larger application.

1. **Event-driven Design**: The `MasterPasswordUI` class uses an event-driven design, with the `initializeEventListeners()` method setting up the necessary event handlers. This allows for the UI to be easily updated and extended without modifying the core encryption manager logic.

1. **Error Handling and Logging**: The encryption manager provides comprehensive error handling, logging any issues to the console. This can be useful for debugging and troubleshooting, as well as providing feedback to the user in case of any problems.

1. **Future Extensibility**: The modular design of the encryption manager, with the separate `StackrTrackrEncryption` and `MasterPasswordUI` classes, allows for future extensibility. Additional features or customizations can be easily added without affecting the core functionality of the encryption system.
