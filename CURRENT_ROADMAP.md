# HexTrackr Trend Tracking Roadmap
*Updated: August 24, 2025*

## 🎯 **CRITICAL ISSUE IDENTIFIED: No Trend Tracking**
**Problem**: CSV imports create duplicates instead of tracking changes over time  
**Solution**: Transform into time-series vulnerability management system

---

## 📋 **PHASE 1: Database Schema Migration** 
*Risk: HIGH | Impact: CRITICAL | Duration: 2-3 tasks*

### 1.1 Analyze Current Data Structure
- [ ] Audit existing vulnerability data patterns
- [ ] Identify unique vulnerability identifiers (CVE+hostname+date)
- [ ] Map current columns to time-series requirements

### 1.2 Design Time-Series Schema
- [ ] Create `vulnerability_master` table (static CVE data)
- [ ] Create `vulnerability_history` table (time-series: device+date+VPR)
- [ ] Add unique constraints: `(hostname, cve, scan_date)`
- [ ] Design indexes for latest-value queries

### 1.3 Create Migration Scripts
- [ ] Backup existing data
- [ ] Write migration script to reshape current data
- [ ] Test migration on sample data
- [ ] Create rollback procedures

---

## � **PHASE 2: Smart CSV Import System**
*Risk: MEDIUM | Impact: HIGH | Duration: 2-3 tasks*

### 2.1 Redesign Import Logic
- [ ] Use date field as "last_updated" timestamp
- [ ] Implement UPSERT logic (UPDATE if exists, INSERT if new)
- [ ] Key on: `hostname + cve + scan_date`
- [ ] Track VPR changes over time

### 2.2 Data Validation & Integrity
- [ ] Validate date formats during import
- [ ] Ensure VPR score changes are logged
- [ ] Add data quality checks
- [ ] Handle malformed/duplicate entries gracefully

### 2.3 Import Analytics
- [ ] Track what changed during each import
- [ ] Report new/updated/unchanged vulnerabilities
- [ ] Log VPR trend changes per import

---

## 📋 **PHASE 3: Latest Values Display**
*Risk: LOW | Impact: MEDIUM | Duration: 2 tasks*

### 3.1 Update API Endpoints
- [ ] Modify `/api/vulnerabilities` to return latest values only
- [ ] Create efficient queries for most recent data per device+CVE
- [ ] Ensure cards/tables show current state

### 3.2 Frontend Display Updates
- [ ] Update vulnerability cards to show latest VPR
- [ ] Ensure tables reflect most recent scan data
- [ ] Add "last updated" timestamps to UI

---

## 📋 **PHASE 4: Trend Visualization**
*Risk: LOW | Impact: HIGH | Duration: 3-4 tasks*

### 4.1 Historical Data API
- [ ] Create `/api/vulnerabilities/trends` endpoint
- [ ] Return VPR changes over time per vulnerability
- [ ] Support date range filtering

### 4.2 Chart Implementation
- [ ] Design Chart.js trend visualizations
- [ ] Show VPR score changes over time
- [ ] Display severity level migrations
- [ ] Add device-level trend analysis

### 4.3 Dashboard Integration
- [ ] Add trend charts to vulnerability dashboard
- [ ] Create "trending up/down" indicators
- [ ] Show improvement/degradation analytics

---

## � **PHASE 5: API Integration Framework**
*Risk: MEDIUM | Impact: HIGH | Duration: 2-3 tasks*

### 5.1 API Supplement System
- [ ] Design hooks for real-time API data
- [ ] Create 30-day history pull mechanism
- [ ] Merge API data with CSV historical data

### 5.2 Data Source Management
- [ ] Support multiple data sources (CSV + API)
- [ ] Prioritize API data over CSV when available
- [ ] Maintain data source lineage

---

## 🎯 **IMMEDIATE NEXT STEPS**
1. **Start with Phase 1.1**: Analyze current data structure
2. **Keep it simple**: One task at a time
3. **Test thoroughly**: Each phase must be working before moving on

**Which phase would you like to start with? I recommend Phase 1.1 to understand our current data first! 🚀**
