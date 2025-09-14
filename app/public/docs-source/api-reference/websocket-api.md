# WebSocket API

This documentation outlines the WebSocket/Socket.io implementation for real-time communication in HexTrackr. The WebSocket server runs on port **8080**, on the same port as the main application.

---

## Server Configuration

- **Port**: 8988
- **Library**: Socket.io

The server provides real-time updates for long-running processes such as data imports and exports.

---

## Event Types

The server emits the following events to the client:

### `progress-update`

- **Description**: Sent periodically during a data import process to provide updates on the progress.
- **Data Structure**:

    ```json
    {
      "processed": 100,
      "total": 1000,
      "percentage": 10
    }
    ```

### `progress-complete`

- **Description**: Sent when a data import process has successfully completed.
- **Data Structure**:

    ```json
    {
      "success": true,
      "message": "Import completed successfully."
    }
    ```

### `progress-error`

- **Description**: Sent when an error occurs during a data import process.
- **Data Structure**:

    ```json
    {
      "error": "An error occurred during the import process."
    }
    ```

---

## Client Integration

Clients can connect to the WebSocket server to receive real-time updates.

### Connection

```javascript
const socket = io('http://localhost:8988');

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});
```

### Event Handling

```javascript
socket.on('progress', (data) => {
  console.log(`Import progress: ${data.percentage}%`);
});

socket.on('complete', (data) => {
  console.log(data.message);
});

socket.on('error', (data) => {
  console.error(data.error);
});
```

---

## Security Considerations

- The WebSocket server is intended for local network use and does not implement authentication or encryption.
- It is recommended to run the WebSocket server behind a firewall and restrict access to trusted clients.
