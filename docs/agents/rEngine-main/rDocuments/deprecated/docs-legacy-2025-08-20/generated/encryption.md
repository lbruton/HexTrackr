# StackTrackr Encryption System

## Purpose & Overview

The `encryption.js` file implements a comprehensive encryption system for the `StackTrackr` application, which is part of the rEngine Core ecosystem. This system provides end-to-end encryption for all sensitive data stored in the application, including API keys, inventory data, settings, and more. The encryption is backed by a single master password that the user can set up and manage.

The key features of this encryption system are:

1. **Master Password Management**: Users can set up a master password to encrypt and decrypt all sensitive data. The system supports password changes and provides a secure verification mechanism.
2. **Backward Compatibility**: The system gracefully handles existing unencrypted data, allowing users to migrate to the encrypted storage without losing any information.
3. **Flexible Data Storage**: The system automatically encrypts or decrypts data based on the user's unlock status, providing a seamless experience.
4. **Debugging and Emergency Functionality**: The system includes debug logging options and an emergency decryption/disable feature for troubleshooting and recovery scenarios.

## Key Functions/Classes

The main components of the encryption system are:

1. **`StackrTrackrEncryption` Class**:
   - Responsible for managing the encryption and decryption of data.
   - Handles the setup, unlocking, and changing of the master password.
   - Provides methods for securely storing and retrieving data.
   - Includes functionality for migrating existing unencrypted data to encrypted storage.
   - Offers emergency decryption and disabling features for troubleshooting.

1. **`MasterPasswordUI` Class**:
   - Manages the user interface for the encryption system.
   - Handles events and user interactions related to setting up, unlocking, and changing the master password.
   - Updates the UI to reflect the current encryption status (locked, unlocked, unencrypted).
   - Provides a way to migrate existing unencrypted data to encrypted storage.
   - Includes the emergency disable functionality.

## Dependencies

The `encryption.js` file relies on the built-in Web Crypto API (`window.crypto`) for the cryptographic operations. It does not have any external dependencies.

## Usage Examples

### Initializing the Encryption System

```javascript
const encryptionManager = new StackrTrackrEncryption();
```

### Setting up the Master Password

```javascript
const masterPasswordUI = new MasterPasswordUI();
// User will be prompted to enter and confirm the master password
```

### Storing Encrypted Data

```javascript
await encryptionManager.secureStore('sensitive_data', { key: 'value' });
```

### Retrieving Decrypted Data

```javascript
const decryptedData = await encryptionManager.secureRetrieve('sensitive_data');
```

### Migrating Existing Unencrypted Data

```javascript
await encryptionManager.migrateToEncrypted();
```

### Changing the Master Password

```javascript
await encryptionManager.changeMasterPassword('oldPassword', 'newPassword');
```

### Locking and Unlocking the Encryption

```javascript
// Lock the encryption
encryptionManager.lock();

// Unlock the encryption
const unlocked = await encryptionManager.unlockWithPassword('masterPassword');
```

## Configuration

The `StackrTrackrEncryption` class has the following configuration options:

| Option                    | Description                                                             |
| ------------------------- | ----------------------------------------------------------------------- |
| `encryptedStoragePrefix`  | The prefix used for encrypted data stored in `localStorage`.        |
| `saltKey`                 | The key used to store the cryptographic salt in `localStorage`.     |
| `debugDecryption`         | A flag to enable/disable debug logging for encryption/decryption.   |
| `protectedKeys`           | An array of keys that should be encrypted when encryption is enabled. |

These options can be set directly on the `StackrTrackrEncryption` instance.

## Integration Points

The `encryption.js` file is a standalone component within the rEngine Core ecosystem. It can be integrated with other rEngine Core components that require secure data storage, such as the `StackTrackr` application.

The `encryptionManager` and `StackrTrackrEncryption` classes are exported, allowing them to be used in other parts of the rEngine Core application.

## Troubleshooting

### Master Password Setup or Unlock Fails

If the user is unable to set up or unlock the encryption with the provided master password, check the following:

1. Ensure the password meets the minimum length requirement of 8 characters.
2. Verify that the user is entering the correct current password when changing the master password.
3. Check the browser's JavaScript console for any error messages that might provide more information about the failure.

### Decryption Fails for Specific Data

If decryption fails for a specific data item, check the following:

1. Ensure that the encryption system is unlocked before attempting to retrieve the data.
2. Verify that the data was encrypted using the correct master key. If the master password has been changed, the data may need to be re-encrypted.
3. In the case of an emergency, use the `emergencyDecryptAll()` method to decrypt all data, which can help identify the source of the issue.

### Encryption/Decryption Performance Issues

If you notice performance degradation due to the encryption/decryption operations, consider the following:

1. Minimize the number of encryption/decryption operations by caching or batching data retrieval and storage.
2. Optimize the data structure to reduce the amount of data that needs to be encrypted or decrypted.
3. Investigate whether the underlying Web Crypto API is causing performance bottlenecks and explore alternative encryption libraries if necessary.

### Compatibility Issues with Existing Data

If you encounter issues with the migration of existing unencrypted data, check the following:

1. Ensure that the data structure and format of the existing data is compatible with the encryption system.
2. Verify that the `protectedKeys` array includes all the necessary keys for the data that needs to be encrypted.
3. Review the error messages in the console and adjust the migration logic accordingly.
