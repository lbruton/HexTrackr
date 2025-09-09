# Data Model: JavaScript Module Extraction

**Date**: 2025-09-09  
**Status**: Complete  

## Entity Definitions

### IVulnerabilityCoreOrchestrator Entity

**Purpose**: Central coordination entity managing all specialized module managers and inter-module communication

```typescript
interface IVulnerabilityCoreOrchestrator extends IModuleLifecycle {
  dataManager: IVulnerabilityDataManager;
  statisticsManager: IVulnerabilityStatisticsManager;
  chartManager: IVulnerabilityChartManager;
  searchManager: IVulnerabilitySearchManager;
  gridManager: IVulnerabilityGridManager;
  cardsManager: IVulnerabilityCardsManager;
  
  initializeAllModules(parentManager: ModernVulnManager): Promise<void>;
  coordinateDataFlow(data: VulnerabilityData): Promise<void>;
  handleModuleError(moduleId: string, error: ModuleError): void;
  getModuleHealth(): Promise<OrchestratorHealthReport>;
}
```

### IModuleLifecycle Entity

**Purpose**: Standardized lifecycle interface ensuring consistent module behavior across architecture

```typescript
interface IModuleLifecycle {
  init(config: ModuleConfig): Promise<boolean>;
  render(container?: HTMLElement): Promise<void>;
  update(data?: unknown): Promise<void>;
  destroy(): Promise<void>;
  getStatus(): ModuleStatus;
}

type ModuleStatus = 'initializing' | 'ready' | 'updating' | 'error' | 'destroyed';

interface ModuleConfig {
  id: string;
  name: string;
  version: string;
  dependencies?: string[];
  eventBus?: IEventBus;
  performanceThresholds?: IPerformanceThresholds;
  errorHandler?: IErrorHandler;
}
```

### IVulnerabilityDataManager Entity

**Purpose**: Centralized data processing, caching, and API communication management

```typescript
interface IVulnerabilityDataManager extends IModuleLifecycle {
  // Data Processing Methods
  fetchVulnerabilities(filters?: VulnerabilityFilters): Promise<VulnerabilityData[]>;
  processVulnerabilityData(rawData: RawVulnerabilityData): ProcessedVulnerabilityData;
  cacheData(key: string, data: unknown, ttl?: number): void;
  getCachedData<T>(key: string): T | null;
  
  // Data Validation
  validateVulnerabilityData(data: unknown): ValidationResult;
  sanitizeData(data: RawVulnerabilityData): SafeVulnerabilityData;
  
  // Event System (Custom Implementation)
  on(event: DataManagerEvent, callback: DataManagerCallback): void;
  off(event: DataManagerEvent, callback: DataManagerCallback): void;
  emit(event: DataManagerEvent, payload: DataManagerEventPayload): void;
}

type DataManagerEvent = 'dataFetched' | 'dataProcessed' | 'cacheUpdated' | 'error';
type DataManagerCallback = (payload: DataManagerEventPayload) => void;

interface DataManagerEventPayload {
  type: DataManagerEvent;
  timestamp: number;
  data?: unknown;
  error?: Error;
  metadata?: Record<string, unknown>;
}
```

### IVulnerabilityStatisticsManager Entity

**Purpose**: Metrics calculation, trend analysis, and statistical processing

```typescript
interface IVulnerabilityStatisticsManager extends IModuleLifecycle {
  // Statistics Calculation
  calculateVulnerabilityStats(data: VulnerabilityData[]): VulnerabilityStatistics;
  calculateTrendIndicators(current: VulnerabilityStats, previous?: VulnerabilityStats): TrendIndicators;
  generateMetricsByType(metricType: MetricType): MetricCalculation;
  
  // Chart Integration
  updateStatisticsDisplay(): Promise<void>;
  updateChart(chartInstance: ApexChartsInstance): void;
  flipStatCards(): void;
  
  // Configuration
  setMetricType(type: MetricType): void;
  getCurrentMetricType(): MetricType;
}

type MetricType = 'vpr' | 'cvss' | 'severity' | 'age';

interface VulnerabilityStatistics {
  totalCount: number;
  severityCounts: Record<SeverityLevel, number>;
  vprStats: {
    average: number;
    median: number;
    distribution: Record<string, number>;
  };
  trends: TrendIndicators;
  lastUpdated: Date;
}

interface TrendIndicators {
  direction: 'increasing' | 'decreasing' | 'stable';
  percentage: number;
  period: string;
  significance: 'low' | 'medium' | 'high';
}
```

### IVulnerabilityChartManager Entity

**Purpose**: ApexCharts integration, visualization rendering, and chart lifecycle management

```typescript
interface IVulnerabilityChartManager extends EventTarget, IModuleLifecycle {
  // Chart Management
  createChart(containerId: string, config: ChartConfiguration): Promise<ApexChartsInstance>;
  updateChartData(data: ChartDataSet): Promise<void>;
  destroyChart(chartId: string): void;
  resizeChart(chartId: string): void;
  
  // Tooltip and Interactivity
  createCustomTooltip(params: TooltipParams): string;
  setupChartInteractivity(): void;
  handleChartClick(event: ChartClickEvent): void;
  
  // Configuration Management
  getDefaultChartConfig(): ChartConfiguration;
  applyTheme(theme: ChartTheme): void;
  setResponsiveOptions(options: ResponsiveChartOptions): void;
}

interface ChartConfiguration {
  type: 'donut' | 'bar' | 'line' | 'area';
  height: number;
  colors: string[];
  theme: ChartTheme;
  responsive: ResponsiveChartOptions[];
  tooltip: TooltipConfiguration;
  legend: LegendConfiguration;
  animations: AnimationConfiguration;
}

interface TooltipParams {
  series: number[];
  seriesIndex: number;
  dataPointIndex: number;
  w: ApexChartsOptions;
}

type ChartTheme = 'light' | 'dark';
```

### IVulnerabilitySearchManager Entity

**Purpose**: Search functionality, filtering, and CVE/Cisco SA lookup management

```typescript
interface IVulnerabilitySearchManager extends IModuleLifecycle {
  // Search Operations
  performSearch(query: SearchQuery): Promise<SearchResults>;
  applyFilters(filters: SearchFilters): void;
  clearFilters(): void;
  
  // External Lookups
  lookupCVE(cveId: string): Promise<CVEDetails | null>;
  lookupCiscoSA(saId: string): Promise<CiscoAdvisoryDetails | null>;
  performBulkLookup(identifiers: string[]): Promise<BulkLookupResults>;
  
  // Search State Management
  getActiveFilters(): SearchFilters;
  getSearchHistory(): SearchHistoryEntry[];
  saveSearchPreset(name: string, filters: SearchFilters): void;
}

interface SearchQuery {
  text: string;
  filters: SearchFilters;
  sortBy?: SortOption;
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface SearchFilters {
  severity?: SeverityLevel[];
  vprRange?: { min: number; max: number };
  dateRange?: { start: Date; end: Date };
  status?: VulnerabilityStatus[];
  tags?: string[];
  hasExploit?: boolean;
  affectedProducts?: string[];
}

interface SearchResults {
  items: VulnerabilityData[];
  totalCount: number;
  facets: SearchFacets;
  query: SearchQuery;
  executionTime: number;
}
```

### IVulnerabilityGridManager Entity

**Purpose**: AG Grid operations, table management, and data presentation

```typescript
interface IVulnerabilityGridManager extends IModuleLifecycle {
  // Grid Management
  initializeGrid(containerId: string, config: GridConfiguration): Promise<void>;
  updateGridData(data: VulnerabilityData[]): void;
  refreshGrid(): void;
  destroyGrid(): void;
  
  // Column Management
  getColumnDefinitions(): ColumnDefinition[];
  updateColumnDefinitions(columns: ColumnDefinition[]): void;
  resizeColumnsToFit(): void;
  autoSizeColumns(): void;
  
  // Selection and Interaction
  getSelectedRows(): VulnerabilityData[];
  selectRows(rowIds: string[]): void;
  clearSelection(): void;
  onRowClick(handler: RowClickHandler): void;
  
  // Pagination and Sorting
  setPaginationPageSize(size: number): void;
  getCurrentPage(): number;
  getTotalPages(): number;
  sortByColumn(columnId: string, direction: SortDirection): void;
}

interface GridConfiguration {
  pagination: boolean;
  paginationPageSize: number;
  sortable: boolean;
  filterable: boolean;
  resizable: boolean;
  columnDefs: ColumnDefinition[];
  defaultColDef: DefaultColumnDefinition;
  suppressRowClickSelection?: boolean;
  rowMultiSelectWithClick?: boolean;
}

type RowClickHandler = (event: RowClickEvent) => void;
type SortDirection = 'asc' | 'desc';
```

### IVulnerabilityCardsManager Entity

**Purpose**: Card-based view rendering, pagination, and responsive layout management

```typescript
interface IVulnerabilityCardsManager extends IModuleLifecycle {
  // Card Rendering
  renderCards(data: VulnerabilityData[], container: HTMLElement): void;
  renderDeviceCards(devices: DeviceData[], container: HTMLElement): void;
  updateCardContent(cardId: string, data: Partial<VulnerabilityData>): void;
  
  // Pagination Management
  setPaginationConfig(config: CardPaginationConfig): void;
  navigateToPage(pageNumber: number): void;
  updateItemsPerPage(itemsPerPage: number): void;
  
  // Card Interactions
  handleCardClick(cardId: string, action: CardAction): void;
  showCardDetails(cardId: string): void;
  toggleCardSelection(cardId: string): void;
  
  // VPR Scoring
  calculateVPRDisplay(vprScore: number): VPRDisplayData;
  getVPRColorClass(score: number): string;
  formatVPRTooltip(score: number, details: VPRDetails): string;
}

interface CardPaginationConfig {
  itemsPerPage: number;
  showPageNumbers: boolean;
  showItemCount: boolean;
  enableQuickJump: boolean;
}

type CardAction = 'view' | 'edit' | 'delete' | 'export' | 'details';

interface VPRDisplayData {
  score: number;
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  colorClass: string;
  tooltip: string;
}
```

### IEventBus Entity

**Purpose**: Standardized event communication system for inter-module coordination

```typescript
interface IEventBus extends EventTarget {
  // Event Registration
  registerEventType(eventType: ModuleEventType): void;
  getRegisteredEvents(): ModuleEventType[];
  
  // Event Publishing
  publishEvent(event: ModuleEvent): void;
  publishDataUpdate(data: unknown, sourceModule: string): void;
  publishError(error: ModuleError, sourceModule: string): void;
  
  // Event Subscription
  subscribeToEvent(eventType: string, handler: EventHandler, options?: SubscriptionOptions): UnsubscribeFunction;
  subscribeToDataUpdates(handler: DataUpdateHandler): UnsubscribeFunction;
  subscribeToErrors(handler: ErrorHandler): UnsubscribeFunction;
}

interface ModuleEvent {
  type: string;
  source: string;
  payload: unknown;
  timestamp: number;
  correlationId?: string;
}

type EventHandler = (event: ModuleEvent) => void;
type DataUpdateHandler = (data: unknown, source: string) => void;
type ErrorHandler = (error: ModuleError, source: string) => void;
type UnsubscribeFunction = () => void;
```

### IPerformanceMonitor Entity

**Purpose**: Performance tracking, metrics collection, and system health monitoring

```typescript
interface IPerformanceMonitor {
  // Performance Tracking
  startMeasurement(operationId: string, operationType: OperationType): void;
  endMeasurement(operationId: string): PerformanceMeasurement;
  recordMetric(metric: PerformanceMetric): void;
  
  // Health Monitoring
  getModuleHealth(moduleId: string): ModuleHealthStatus;
  getSystemHealth(): SystemHealthReport;
  isOperationWithinThreshold(measurement: PerformanceMeasurement): boolean;
  
  // Reporting
  generatePerformanceReport(): PerformanceReport;
  exportMetrics(format: 'json' | 'csv'): string;
  getMetricHistory(metricName: string, timeRange: TimeRange): MetricDataPoint[];
}

interface PerformanceMeasurement {
  operationId: string;
  operationType: OperationType;
  duration: number;
  timestamp: number;
  memoryUsed?: number;
  cpuTime?: number;
}

type OperationType = 'init' | 'render' | 'update' | 'destroy' | 'data-fetch' | 'data-process' | 'chart-render';

interface ModuleHealthStatus {
  moduleId: string;
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  lastCheck: Date;
  metrics: {
    averageResponseTime: number;
    errorRate: number;
    memoryUsage: number;
    operationsPerSecond: number;
  };
  issues: HealthIssue[];
}
```

### IErrorHandler Entity

**Purpose**: Centralized error management, logging, and recovery coordination

```typescript
interface IErrorHandler {
  // Error Processing
  handleError(error: ModuleError, context: ErrorContext): void;
  logError(error: ModuleError, severity: ErrorSeverity): void;
  reportError(error: ModuleError, shouldNotify?: boolean): void;
  
  // Error Recovery
  attemptRecovery(error: RecoverableError): Promise<boolean>;
  getRecoveryStrategy(errorType: string): RecoveryStrategy | null;
  executeRecoveryPlan(plan: RecoveryPlan): Promise<RecoveryResult>;
  
  // Error Aggregation
  getErrorSummary(timeRange: TimeRange): ErrorSummary;
  getFrequentErrors(limit: number): ErrorFrequencyReport[];
  clearErrorLog(olderThan?: Date): number;
}

interface ModuleError extends Error {
  moduleId: string;
  errorCode: string;
  severity: ErrorSeverity;
  context: ErrorContext;
  timestamp: Date;
  stack?: string;
  recoverable: boolean;
}

type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface ErrorContext {
  operation: string;
  data?: unknown;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
}
```

## Data Flow

### Module Initialization Flow

1. **Orchestrator Creation**: VulnerabilityCoreOrchestrator instantiated with configuration
2. **Module Registration**: Specialized managers registered with dependency injection
3. **Event Bus Setup**: Centralized communication system established
4. **Lifecycle Coordination**: All modules initialized through standardized interface
5. **Health Monitoring**: Performance tracking and error handling activated

### Event-Driven Communication Flow

1. **Event Publication**: Modules publish typed events through standardized EventBus
2. **Event Routing**: Orchestrator routes events to interested subscribers
3. **Data Synchronization**: Cross-module data updates coordinated through events
4. **Error Propagation**: Module errors captured and propagated for handling
5. **Performance Tracking**: All operations measured and monitored

### Data Processing Flow

1. **Data Acquisition**: VulnerabilityDataManager fetches raw data from APIs
2. **Data Validation**: Input validation and sanitization applied
3. **Data Transformation**: Raw data processed into standardized formats
4. **Data Distribution**: Processed data distributed to consuming modules via events
5. **UI Updates**: Visual modules update displays based on processed data

## Validation Rules

### Module Lifecycle Validation

- All modules MUST implement IModuleLifecycle interface
- Module initialization MUST complete within performance thresholds
- Module destruction MUST clean up all resources and event listeners
- Module status MUST be accurately tracked and reported

### Event System Validation  

- All events MUST follow standardized ModuleEvent interface
- Event payloads MUST be serializable and type-safe
- Event subscriptions MUST be properly cleaned up on module destruction
- Event publication MUST include source module identification

### Performance Validation

- Module operations MUST complete within defined thresholds
- Memory usage MUST remain stable during module lifecycle
- Error rates MUST stay below acceptable limits
- Performance metrics MUST be continuously monitored

### Data Integrity Validation

- All vulnerability data MUST pass validation before processing
- Data transformations MUST maintain referential integrity
- Cached data MUST have appropriate TTL and invalidation strategies
- API responses MUST be sanitized before distribution

## Performance Considerations

### Module Loading Optimization

- **Lazy Loading**: Modules loaded on-demand to minimize initial bundle size
- **Code Splitting**: Each module packaged as separate chunk for efficient caching
- **Dependency Management**: Shared dependencies optimized to prevent duplication
- **Initialization Batching**: Module initialization coordinated to prevent resource contention

### Memory Management

- **Resource Cleanup**: All modules implement proper destroy() methods
- **Event Listener Management**: Automatic cleanup of subscriptions on destruction
- **Cache Management**: LRU-based caching with configurable size limits
- **Memory Monitoring**: Continuous tracking of module memory usage

### Event System Performance

- **Event Batching**: Multiple events batched for efficient processing
- **Selective Subscription**: Modules subscribe only to relevant event types
- **Event Throttling**: High-frequency events throttled to prevent performance degradation
- **Async Processing**: Event handlers designed for non-blocking operation

## Integration Points

### External Library Integration

- **ApexCharts**: Chart rendering integrated through VulnerabilityChartManager
- **AG Grid**: Table functionality encapsulated in VulnerabilityGridManager
- **Bootstrap**: Styling framework maintained across all modules
- **Event Target**: Native browser events used for standardized communication

### API Integration Points

- **REST Endpoints**: Vulnerability data fetched through standardized endpoints
- **CVE Database**: External CVE lookups integrated through SearchManager
- **Cisco Security**: Cisco advisory integration through SearchManager
- **Caching Layer**: Redis/local storage integration for performance optimization

### Development Tools Integration

- **Jest Testing**: All modules designed for comprehensive unit testing
- **TypeScript**: Strong typing enforced across all interfaces
- **ESLint**: Code quality maintained through standardized linting
- **Performance DevTools**: Integration with browser performance monitoring

## Architectural Patterns

### Orchestrator Pattern

- Central coordination without tight coupling between modules
- Dependency injection for clean module instantiation
- Centralized error handling and performance monitoring
- Event-driven communication for loose coupling

### Module Factory Pattern

- Standardized module creation through configuration
- Type-safe module instantiation with dependency injection
- Lifecycle management through consistent interfaces
- Error isolation through module boundaries

### Observer Pattern

- Event-driven architecture for inter-module communication
- Selective subscription to relevant data updates
- Automatic cleanup of subscriptions on module destruction
- Type-safe event payloads with validation

### Strategy Pattern

- Pluggable error recovery strategies
- Configurable performance thresholds per module
- Swappable chart configurations and themes
- Flexible search and filtering implementations
