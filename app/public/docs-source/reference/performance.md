# Performance Guidelines & Benchmarks

## Performance Requirements

As defined in the HexTrackr Constitution Article IV, the following performance benchmarks must be maintained:

### Response Time Standards

- **Page loads**: Must complete within 2 seconds
- **API responses**: Must return within 500ms for standard operations
- **Database queries**: Must execute within 100ms for simple operations
- **WebSocket messages**: Must be delivered within 50ms

### Processing Benchmarks

- **CSV imports**: Must process at least 1000 rows per second
- **Batch operations**: Must handle at least 100 items concurrently
- **Search operations**: Must return results within 200ms
- **Export operations**: Must begin streaming within 1 second

### Resource Constraints

- **Memory usage**: Must not exceed 512MB during normal operations
- **CPU usage**: Must remain below 80% during standard load
- **Database size**: Monitoring alerts set at 80% capacity
- **Log files**: Automatic rotation at 100MB

## Performance Optimization Tips

### Database Optimization

1. **Indexes**: Ensure proper indexes on frequently queried columns
2. **Query optimization**: Use EXPLAIN to analyze slow queries
3. **Connection pooling**: Maintain optimal connection pool size
4. **Regular maintenance**: VACUUM and ANALYZE SQLite database regularly

### Frontend Optimization

1. **Lazy loading**: Load data on demand, especially for large datasets
2. **Virtual scrolling**: Use AG Grid's virtual scrolling for large tables
3. **Debouncing**: Debounce search inputs and filter operations
4. **Caching**: Leverage browser caching for static assets

### Backend Optimization

1. **Streaming**: Use streaming for large file operations
2. **Pagination**: Always paginate large result sets
3. **Async operations**: Use async/await for non-blocking operations
4. **WebSocket efficiency**: Batch WebSocket messages when possible

## Monitoring & Metrics

### Key Metrics to Track

- Response time percentiles (P50, P95, P99)
- Memory usage trends
- Database query performance
- WebSocket connection count
- Import/export throughput

### Performance Testing

```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 http://localhost:8989/api/vulnerabilities/stats

# Memory profiling
docker stats hextrackr-hextrackr-1

# Database performance
sqlite3 data/hextrackr.db "EXPLAIN QUERY PLAN SELECT * FROM vulnerabilities_current;"
```

## Troubleshooting Performance Issues

### Slow Page Loads

1. Check browser developer tools Network tab
2. Identify slow API calls or large asset downloads
3. Verify Docker container resources
4. Check for database locks or slow queries

### High Memory Usage

1. Monitor with `docker stats`
2. Check for memory leaks in long-running operations
3. Verify import batch sizes
4. Review WebSocket connection management

### Database Performance

1. Run VACUUM to reclaim space
2. Analyze query plans with EXPLAIN
3. Check for missing indexes
4. Monitor transaction locks

---

*Performance requirements defined in Constitution Article IV*
