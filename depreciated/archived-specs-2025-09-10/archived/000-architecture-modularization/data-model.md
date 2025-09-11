# Data Model: Architecture Modularization

**Date**: 2025-09-09  
**Status**: Complete  

## Entity Definitions

### IWidget Entity

**Purpose**: Core interface for all dashboard widgets with standardized lifecycle

```typescript
interface IWidget extends IWidgetLifecycle {
  config: IWidgetConfig;
}

interface IWidgetLifecycle {
  init(config: IWidgetConfig, dependencies: IWidgetDependencies): Promise<void> | void;
  render(targetElement: HTMLElement, state: any): Promise<void> | void;
  destroy(): Promise<void> | void;
}
```

### IWidgetConfig Entity

**Purpose**: Configuration and metadata for individual widget instances

```typescript
interface IWidgetConfig {
  id: string;                           // Unique instance identifier
  type: string;                         // Registered widget type
  name: string;                         // Display name
  description?: string;                 // Optional description
  initialState?: Record<string, any>;   // Instance-specific initial state
  dependencies?: IWidgetDependency[];   // Explicit widget dependencies
  meta?: Record<string, any>;           // Custom metadata
}
```

### IWidgetRegistryEntry Entity

**Purpose**: Widget type definitions in central registry for dynamic loading

```typescript
interface IWidgetRegistryEntry {
  type: string;                         // Unique widget type identifier
  displayName: string;                  // User-friendly name
  description?: string;                 // Widget purpose description
  modulePath: string;                   // Path for dynamic import
  component: new (...args: any[]) => IWidget;  // Constructor function
  supportedConfigSchema?: Record<string, any>; // Config validation schema
  requiredStateDomains?: Array<keyof IDomainState>;  // State access requirements
  emittedEvents?: Array<IEventRegistryEntry>;    // Events this widget emits
  subscribedEvents?: Array<IEventRegistryEntry>; // Events this widget consumes
}
```

### IRootState Entity

**Purpose**: Tiered state structure preventing monolithic state management

```typescript
interface IRootState {
  global: IGlobalState;     // Application-wide state
  domains: IDomainState;    // Domain-separated state slices
}

interface IGlobalState {
  user: {
    id: string;
    role: 'admin' | 'user' | 'viewer';
    preferences: { theme: string; language: string; };
  };
  ui: {
    theme: 'light' | 'dark';
    language: string;
    layout: 'grid' | 'list' | 'custom';
    sidebarOpen: boolean;
  };
  appStatus: 'loading' | 'ready' | 'error';
}

interface IDomainState {
  vulnerabilities: IVulnerabilitiesState;
  tenable: ITenableState;
  cisco: ICiscoState;
  assets: IAssetsState;
}
```

### IEventBus Entity

**Purpose**: Structured event system with naming conventions and payload schemas

```typescript
interface IEventBus {
  emit<TName extends EventName>(
    eventName: TName, 
    payload: IEventPayloadMap[TName], 
    source?: string
  ): void;
  
  on<TName extends EventName>(
    eventName: TName, 
    handler: (event: IEvent<TName>) => void
  ): () => void;  // Returns unsubscribe function
  
  off<TName extends EventName>(
    eventName: TName, 
    handler: (event: IEvent<TName>) => void
  ): void;
}

// Event naming convention: [SourceWidget]:[Subject]:[Verb]
type EventName = `${string}:${string}:${string}`;

interface IEvent<TName extends EventName> {
  name: TName;
  payload: IEventPayloadMap[TName];
  timestamp: number;
  source?: string;  // Widget ID or module that emitted event
}
```

### IEventRegistry Entity

**Purpose**: Central documentation and validation for all system events

```typescript
interface IEventRegistry {
  registerEvent<TName extends EventName>(entry: IEventRegistryEntry<TName>): void;
  getEventSchema<TName extends EventName>(eventName: TName): IEventRegistryEntry<TName> | undefined;
  getAllEvents(): IEventRegistryEntry[];
  validateEventPayload<TName extends EventName>(eventName: TName, payload: any): boolean;
}

interface IEventRegistryEntry<TName extends EventName = EventName> {
  name: TName;
  description: string;
  payloadSchema: { [key: string]: any };    // JSON schema for payload validation
  sourceModules: string[];                  // Modules that emit this event
  consumerModules: string[];                // Modules that consume this event
  impact?: string;                          // Description of side effects
}
```

### IStateManager Entity

**Purpose**: Centralized state management with domain separation and selector access

```typescript
interface IStateManager {
  getState(): IRootState;
  dispatch<TType extends string, TPayload>(action: IStateAction<TType, TPayload>): void;
  subscribe(listener: (state: IRootState) => void): () => void;  // Returns unsubscribe
}

interface IStateAction<TType extends string, TPayload = undefined> {
  type: TType;
  payload: TPayload;
}

// Selector functions prevent direct state access
type IStateSelector<TResult, TArgs extends any[] = []> = 
  (state: IRootState, ...args: TArgs) => TResult;
```

### IErrorBoundary Entity

**Purpose**: Widget-level error isolation with graceful degradation

```typescript
interface IErrorBoundary {
  logError(error: Error, errorInfo?: IWidgetErrorEventPayload['errorInfo']): void;
  notifyError(payload: IWidgetErrorEventPayload): void;
  renderFallback(): React.ReactNode | any;
}

interface IWidgetErrorEventPayload {
  widgetId: string;                     // Failed widget instance ID
  widgetType: string;                   // Widget type that failed
  error: {
    message: string;
    name: string;
    stack?: string;
  };
  errorInfo?: {                         // Framework-specific error context
    componentStack?: string;
    [key: string]: any;
  };
  timestamp: number;
}

interface IErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: IWidgetErrorEventPayload['errorInfo'];
}
```

### IPerformanceMonitor Entity

**Purpose**: Performance tracking and optimization metrics collection

```typescript
interface IPerformanceMonitor {
  recordWidgetPerformance(metrics: IWidgetPerformanceMetrics): void;
  recordBundleMetrics(metrics: IBundleMetrics): void;
  getRecentWidgetPerformance(widgetId?: string, limit?: number): IWidgetPerformanceMetrics[];
  getLatestBundleMetrics(): IBundleMetrics | undefined;
  sendToAnalytics(data: any): void;
}

interface IWidgetPerformanceMetrics {
  widgetId: string;
  widgetType: string;
  loadTimeMs?: number;                  // Lazy loading time
  renderTimeMs?: number;                // Initial render time
  memoryUsageBytes?: number;            // Memory snapshot
  destructionTimeMs?: number;           // Cleanup time
  timestamp: number;
}

interface IBundleMetrics {
  initialBundleSizeKB: number;          // Main bundle size
  vendorChunkSizeKB: number;            // Shared dependencies
  widgetChunkSizesKB: { [widgetType: string]: number };  // Per-widget chunks
  totalAppSizeKB: number;               // Total application size
  buildTimestamp: string;
}
```

### IWidgetDependency Entity

**Purpose**: Explicit dependency tracking to prevent circular references

```typescript
interface IWidgetDependency {
  type: 'widget' | 'service' | 'state-domain';
  id: string;                           // Widget type, service name, or state domain
  version?: string;                     // Optional version constraint
  critical?: boolean;                   // Cannot function without this dependency
}
```

## Data Flow

### Widget Lifecycle Flow

1. **Registration**: Widget types registered in `IWidgetRegistrationSystem` with metadata
2. **Instantiation**: Dashboard requests widget instance using `IWidgetConfig`
3. **Initialization**: Widget `init()` method called with dependencies and configuration
4. **Rendering**: Widget `render()` method called with target DOM element and state slice
5. **State Updates**: Widget subscribes to relevant state changes through selectors
6. **Event Communication**: Widget emits/subscribes to typed events via `IEventBus`
7. **Destruction**: Widget `destroy()` method called for cleanup when removed

### State Management Flow

1. **Domain Separation**: State organized by domain (vulnerabilities, tenable, cisco, assets)
2. **Selector Access**: Widgets access state only through `IStateSelector` functions
3. **Action Dispatch**: State changes initiated via `IStateAction` dispatch
4. **State Updates**: Domain-specific reducers/mutations process actions
5. **Widget Notification**: Subscribed widgets notified of relevant state changes

### Event System Flow

1. **Event Registration**: All events documented in `IEventRegistry` with schemas
2. **Event Emission**: Widgets emit typed events following naming convention
3. **Event Consumption**: Interested widgets subscribe to specific event types
4. **Payload Validation**: Event payloads validated against registered schemas
5. **Error Propagation**: Widget errors propagated via `Widget:Error:Occurred` events

## Validation Rules

### Widget Validation

- `IWidgetConfig.id` MUST be unique across all widget instances
- `IWidgetConfig.type` MUST exist in widget registry before instantiation
- Widget MUST implement all `IWidgetLifecycle` methods
- Widget dependencies MUST be resolved before `init()` method called

### State Management Validation

- All state access MUST use `IStateSelector` functions, not direct state access
- State actions MUST follow `IStateAction<TType, TPayload>` interface
- Domain state MUST NOT reference other domains directly
- State listeners MUST unsubscribe on widget destruction

### Event System Validation  

- Event names MUST follow `[SourceWidget]:[Subject]:[Verb]` naming convention
- All events MUST be registered in `IEventRegistry` before use
- Event payloads MUST match registered schema for validation
- Event handlers MUST unsubscribe on widget destruction

### Error Handling Validation

- All widgets MUST be wrapped in error boundaries
- Error boundaries MUST emit `Widget:Error:Occurred` events for failures
- Error boundaries MUST render fallback UI without crashing application
- Error information MUST NOT expose sensitive system details

## Performance Considerations

### Bundle Optimization

- **Code Splitting**: Each widget type loaded as separate chunk via dynamic imports
- **Vendor Chunking**: Shared dependencies (React, state management) in separate vendor chunk
- **Tree Shaking**: Unused widget code eliminated from production bundles
- **Lazy Loading**: Widget code loaded on-demand when instantiated

### Memory Management

- **Widget Cleanup**: Proper `destroy()` implementation prevents memory leaks
- **Event Unsubscription**: All event listeners removed on widget destruction
- **State Subscription Cleanup**: State listeners unsubscribed when widget destroyed
- **DOM Element Cleanup**: Widget responsible for cleaning up created DOM elements

### State Access Optimization

- **Selector Memoization**: Expensive state derivations cached with memoized selectors
- **Fine-grained Subscriptions**: Widgets subscribe only to relevant state slices
- **Batched Updates**: State changes batched to prevent excessive re-renders
- **Domain Isolation**: State domains prevent unnecessary cross-domain updates

## Integration Points

### Framework Integration

- **Component Framework**: React/Vue/Svelte integration for widget rendering
- **State Management**: Redux/Vuex/Svelte stores for centralized state
- **Router Integration**: Widget visibility controlled by application routing
- **Build Tools**: Webpack/Vite configuration for code splitting and optimization

### Development Tools

- **Widget Registry UI**: Administrative interface for managing registered widgets  
- **Event Bus Inspector**: Development tool for monitoring event flow
- **State DevTools**: Integration with Redux DevTools or equivalent
- **Performance Profiler**: Runtime performance monitoring and reporting

### External Systems

- **Analytics Integration**: Widget usage and performance metrics collection
- **Error Reporting**: Integration with error monitoring services (Sentry, Bugsnag)
- **Configuration Management**: Widget configuration stored in backend systems
- **Asset Management**: Dynamic loading of widget assets and dependencies

## Architectural Patterns

### Widget Registration Pattern

- Central registry manages all available widget types
- Dynamic import system enables lazy loading of widget code
- Type safety enforced through TypeScript interfaces
- Dependency resolution handled at registration time

### Tiered State Pattern

- Global state for application-wide concerns (user, UI, app status)
- Domain state for feature-specific data (vulnerabilities, integrations)
- Selector-based access prevents tight coupling to state structure
- Domain boundaries prevent cross-contamination of concerns

### Event Bus Pattern

- Structured naming convention ensures event discoverability
- Central registry documents all events and their contracts
- Payload validation prevents runtime errors from malformed data
- Subscription management prevents memory leaks

### Error Boundary Pattern

- Widget-level isolation prevents application-wide crashes
- Graceful degradation maintains user experience during failures
- Centralized error reporting enables systematic issue resolution
- Fallback UI patterns provide consistent error handling experience
