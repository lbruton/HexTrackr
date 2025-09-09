# WebSocket Progress Tracking - Implementation Todo List

## Priority: Tonight's Focus (3-4 hours)

**Goal**: Replace basic toast notifications with real-time progress tracking for CSV imports

## Backend Tasks

### 1. Socket.io Server Setup

- [ ] Install socket.io dependency
- [ ] Integrate Socket.io with existing Express server
- [ ] Configure CORS for WebSocket connections
- [ ] Set up connection/disconnection handlers

### 2. Progress Event System

- [ ] Modify `bulkLoadToStagingTable()` to emit progress events
- [ ] Modify `processStagingToFinalTables()` to emit batch progress
- [ ] Add progress events to CSV parsing phase
- [ ] Implement progress calculation (percentage, ETA)
- [ ] Add error event emission for failed operations

### 3. Import Process Integration

- [ ] Integrate progress events into `/api/vulnerabilities/import-staging`
- [ ] Add unique session IDs for multiple concurrent imports
- [ ] Handle progress state cleanup on completion/error

## Frontend Tasks

### 4. WebSocket Client Setup

- [ ] Add socket.io-client to frontend dependencies
- [ ] Create WebSocket connection manager
- [ ] Handle connection/disconnection states
- [ ] Implement automatic reconnection logic

### 5. Progress UI Components

- [ ] Create real-time progress bar component
- [ ] Design progress modal with status indicators
- [ ] Add cancel import functionality
- [ ] Replace existing toast notifications
- [ ] Add progress percentage and ETA display

### 6. Integration with Existing UI

- [ ] Modify CSV import triggers to use WebSocket progress
- [ ] Update vulnerability-manager.js import handlers
- [ ] Ensure progress UI works in both table and card views
- [ ] Handle multiple file import scenarios

## Testing Tasks

### 7. Unit Tests

- [ ] Test Socket.io server integration
- [ ] Test progress event emission accuracy
- [ ] Test frontend progress calculation
- [ ] Test error state handling

### 8. Integration Tests

- [ ] Test full import flow with progress tracking
- [ ] Test concurrent import handling
- [ ] Test connection drop recovery
- [ ] Test large file import scenarios (50MB+)

### 9. Browser Tests (Playwright)

- [ ] Test progress UI visibility and updates
- [ ] Test cancel functionality
- [ ] Test progress accuracy against actual import time
- [ ] Test responsive behavior on mobile

## Error Handling & Edge Cases

### 10. Resilience Features

- [ ] Handle WebSocket connection drops gracefully
- [ ] Fallback to polling if WebSocket fails
- [ ] Handle server restart during import
- [ ] Clean up progress state on page refresh

## Documentation & Cleanup

### 11. Documentation

- [ ] Update API documentation with WebSocket events
- [ ] Document progress event schema
- [ ] Add troubleshooting guide for WebSocket issues
- [ ] Update architecture documentation

### 12. Code Quality

- [ ] Run ESLint on new WebSocket code
- [ ] Add JSDoc comments for new functions
- [ ] Ensure Codacy compliance
- [ ] Remove legacy toast notification code

## Performance Considerations

### 13. Optimization

- [ ] Limit progress event frequency (throttling)
- [ ] Optimize progress calculation efficiency
- [ ] Memory usage monitoring for long imports
- [ ] Browser performance impact assessment

## Success Criteria

✅ **Primary Goals**

- Real-time progress bars replace toast notifications
- Accurate progress percentage and ETA calculation
- Cancel capability for running imports
- Graceful handling of connection issues

✅ **Secondary Goals**  

- Support for concurrent imports
- Mobile-responsive progress UI
- Performance impact < 5% on import speed
- Clean fallback when WebSocket unavailable

## Time Estimates

- Backend Setup: 1 hour
- Frontend Implementation: 1.5 hours  
- Testing & Integration: 1 hour
- Documentation & Polish: 30 minutes
- **Total: 4 hours**
