# Data Model: Modal System Z-Index Enhancement

**Date**: 2025-09-09  
**Status**: Complete  
**Prerequisites**: research.md complete, spec.md analysis

## Entity Definitions

### ModalState Entity

**Purpose**: Tracks individual modal instance state and layer information

```javascript
interface ModalState {
  id: string;                    // Unique modal identifier
  layer: number;                 // Z-index layer (1-based)
  zIndex: number;                // Calculated z-index value
  isVisible: boolean;            // Current visibility state
  parentModalId?: string;        // Parent modal for nested scenarios
  focusElement?: HTMLElement;    // Element that triggered modal
  openedAt: Date;               // Timestamp for debugging
}
```

**Relationships**:

- Parent-child relationship for nested modals
- Managed by ModalManager singleton

### ModalLayer Entity

**Purpose**: Represents z-index layer hierarchy and management

```javascript
interface ModalLayer {
  layerNumber: number;           // Layer position (1, 2, 3...)
  zIndex: number;                // Calculated z-index value
  modalId: string;               // Modal occupying this layer
  isActive: boolean;             // Currently interactive layer
  backdropOpacity: number;       // Calculated backdrop opacity
}
```

**Relationships**:

- One-to-one with ModalState
- Ordered collection managed by ModalManager

### ModalManager Entity

**Purpose**: Singleton coordinator for all modal state and layering

```javascript
class ModalManager {
  private activeModals: Map<string, ModalState>;
  private layerStack: ModalLayer[];
  private currentMaxLayer: number;
  private baseZIndex: number = 1000;
  private layerIncrement: number = 10;
  
  // Core methods
  openModal(modalId: string, options: ModalOpenOptions): ModalState
  closeModal(modalId: string): void
  getModalLayer(modalId: string): number
  getTopMostModal(): string | null
}
```

**Relationships**:

- Manages collection of ModalState entities
- Coordinates ModalLayer hierarchy
- Singleton pattern - one instance per application

### FocusManager Entity

**Purpose**: Handles keyboard focus and accessibility across modal layers

```javascript
interface FocusManager {
  currentFocusLayer: number;     // Active focus layer
  focusHistory: HTMLElement[];   // Focus restoration stack
  trapFocus(modalId: string): void;
  restoreFocus(modalId: string): void;
  moveFocusToLayer(layer: number): void;
}
```

**Relationships**:

- Integrated with ModalManager
- Manages focus state per ModalState

## Data Flow

### Modal Opening Sequence

1. User triggers modal → ModalManager.openModal()
2. ModalManager creates new ModalState entity
3. New ModalLayer allocated with calculated z-index
4. FocusManager updates focus trap for new layer
5. CSS classes applied for visual layering

### Modal Closing Sequence  

1. User closes modal → ModalManager.closeModal()
2. ModalState removed from active collection
3. ModalLayer deallocated and reused
4. FocusManager restores focus to parent layer
5. CSS cleanup and layer recalculation

### Z-Index Calculation

```javascript
const calculateZIndex = (layer: number): number => {
  return baseZIndex + (layer - 1) * layerIncrement;
};

// Layer 1: 1000, Layer 2: 1010, Layer 3: 1020...
```

## Validation Rules

### ModalState Validation

- `id` must be unique across all active modals
- `layer` must be positive integer
- `zIndex` must be calculated, not manually set
- `parentModalId` must reference existing modal (if specified)

### ModalLayer Validation

- `layerNumber` must be sequential (no gaps)
- `zIndex` must match calculated value
- `modalId` must reference valid ModalState
- `backdropOpacity` must be 0.1-0.8 range

### ModalManager Validation

- Maximum 5 concurrent modal layers (UX limit)
- Layer stack must be sequential
- No duplicate modal IDs in active collection

## Performance Considerations

### Memory Usage

- ModalState: ~200 bytes per instance
- ModalLayer: ~100 bytes per instance  
- ModalManager: ~1KB base overhead
- Total overhead: <5KB for typical usage (3 modals)

### Computational Complexity

- Modal opening: O(1) - constant time
- Modal closing: O(n) - linear with layer count
- Z-index calculation: O(1) - constant time
- Focus management: O(1) - constant time

## State Persistence

### Session Storage

- No persistence required - modal state is ephemeral
- Modal preferences (if any) stored in localStorage
- Debug information available via ModalManager.getState()

### Error Recovery

- Invalid state detection and cleanup
- Automatic layer recalculation on corruption
- Fallback to single-modal mode if manager fails

---
**Data Model Quality**: HIGH - Comprehensive entity design
**Implementation Complexity**: MEDIUM - Standard state management patterns
