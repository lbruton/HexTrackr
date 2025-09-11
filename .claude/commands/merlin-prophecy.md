# /merlin-prophecy Command

Ask Merlin to prophesy future documentation drift using mystical pattern analysis.

## Usage
`/merlin-prophecy [timeframe]`

Timeframe options:
- `week` - Next 7 days (default)
- `month` - Next 30 days
- `sprint` - Next sprint cycle
- `quarter` - Next 3 months

## Examples
```bash
/merlin-prophecy              # Next week's drift prediction
/merlin-prophecy month        # 30-day forecast
/merlin-prophecy sprint       # Sprint planning insight
/merlin-prophecy quarter      # Long-term planning
```

## Execution

Launch Merlin with prophecy directive:

```javascript
Task(
  subagent_type: "merlin",
  description: "Prophesy documentation drift",
  prompt: `
    Divine future documentation drift for timeframe: ${timeframe}
    
    PHASE 1: HISTORICAL DIVINATION
    1. Query Memento for past audit records:
       mcp__memento__search_nodes({
         query: "HEXTRACKR:DOCS:AUDIT DOCUMENTATION:AUDIT",
         mode: "hybrid",
         topK: 20
       })
    2. Analyze git history for code change patterns:
       - Files with highest change frequency
       - Recent refactoring areas
       - New feature development zones
    3. Calculate drift velocity per documentation area
    
    PHASE 2: PATTERN RECOGNITION
    1. Identify cyclical patterns:
       - Sprint-based documentation decay
       - Feature release impacts
       - Seasonal development patterns
    2. Detect drift accelerators:
       - Rapid development areas
       - Experimental features
       - API evolution zones
    3. Find stability anchors:
       - Rarely changing documentation
       - Well-maintained sections
       - Auto-generated docs
    
    PHASE 3: RISK CALCULATION
    For each documentation file:
    
    Risk Score = (Change Frequency × Impact × Time Since Update) / Maintenance Factor
    
    Where:
    - Change Frequency: Code changes per week in related files
    - Impact: CRITICAL=10, HIGH=5, MEDIUM=2, LOW=1
    - Time Since Update: Days since last doc update
    - Maintenance Factor: How well maintained (0.5 to 2.0)
    
    PHASE 4: PROPHECY GENERATION
    1. Rank documentation by drift risk
    2. Identify critical drift points
    3. Suggest preventive actions
    4. Calculate confidence levels
    
    PHASE 5: MYSTICAL VISUALIZATION
    Create drift timeline showing:
    - When each doc will likely drift
    - Severity of expected drift
    - Recommended update schedule
    - Resource allocation suggestions
    
    Store prophecy in Memento:
    mcp__memento__create_entities({
      entities: [{
        name: "HEXTRACKR:DOCS:PROPHECY:[timestamp]",
        entityType: "DOCUMENTATION:PROPHECY",
        observations: [predictions]
      }]
    })
    
    Save full prophecy to MERLIN_PROPHECY_[timestamp].md
  `
)
```

## Output Format

Merlin returns:
```markdown
## 🔮 Merlin's Documentation Prophecy

**Divination Date**: 2025-09-10T18:00:00Z
**Prophecy Timeframe**: Next 30 days
**Confidence Level**: 78% (Based on 90 days of patterns)

### 📊 Drift Forecast Summary

**High Risk Documents**: 5 scrolls in danger
**Medium Risk Documents**: 8 scrolls need watching
**Low Risk Documents**: 21 scrolls remain stable

### 🌟 Critical Prophecies

#### ⚠️ IMMINENT DRIFT (Next 7 days)

1. **api-reference/vulnerabilities-api.md**
   - Risk Score: 92/100
   - Prophecy: New endpoints will be added for bulk operations
   - Evidence: 3 PRs in review touching this API
   - Action: Schedule update for Day 3

2. **architecture/backend.md**
   - Risk Score: 85/100
   - Prophecy: Authentication refactor will outdated docs
   - Evidence: Auth module branch nearing merge
   - Action: Assign Larry for immediate review

#### 🔸 APPROACHING DRIFT (Days 8-14)

3. **user-guides/vulnerability-management.md**
   - Risk Score: 67/100
   - Prophecy: UI updates will misalign screenshots
   - Evidence: Frontend sprint starting next week
   - Action: Prepare Curly for UI documentation

### 📈 Drift Velocity Analysis

```
Documentation Area    | Current | Predicted | Acceleration
---------------------|---------|-----------|-------------
API Documentation    | 2.3/wk  | 4.1/wk   | ↑ 78%
Architecture Docs    | 1.1/wk  | 2.8/wk   | ↑ 154%
User Guides         | 0.8/wk  | 1.2/wk   | ↑ 50%
Security Docs       | 0.2/wk  | 0.2/wk   | → 0%
```

### 🎯 Pattern Insights

**Discovered Patterns**:
1. **Sprint Pattern**: Documentation drift spikes on Day 3-5 of sprints
2. **Feature Pattern**: New features cause 3x normal drift rate
3. **Refactor Pattern**: Architecture changes cascade to 4-6 docs

**Stability Anchors**:
- Security documentation (rarely changes)
- Getting started guide (well maintained)
- White papers (conceptual, stable)

### 🗓️ Recommended Update Schedule

**Week 1**:
- Day 3: Update vulnerabilities-api.md (Larry)
- Day 5: Review backend.md (Larry)
- Day 7: Audit checkpoint (All Stooges)

**Week 2**:
- Day 10: Update user guides (Curly)
- Day 12: API documentation sweep (Moe)
- Day 14: Full audit recommended

**Week 3-4**:
- Maintenance mode unless alerts trigger
- Weekly quick audits recommended

### 🎲 Confidence Factors

**High Confidence** (>80%):
- API drift (consistent pattern)
- Sprint-based decay (historical)

**Medium Confidence** (50-80%):
- UI documentation drift (depends on design)
- Architecture updates (refactor timing uncertain)

**Low Confidence** (<50%):
- Security doc changes (unpredictable)
- New feature documentation (unknown scope)

### 💡 Preventive Enchantments

1. **Immediate Actions**:
   - Add doc-update tasks to sprint planning
   - Create PR checklist for doc updates
   - Set up drift alerts for critical docs

2. **Process Improvements**:
   - Pair Stooges with developers during features
   - Weekly 15-minute drift reviews
   - Automated API doc generation exploration

3. **Long-term Strategy**:
   - Implement doc-as-code practices
   - Create documentation debt budget
   - Establish doc update SLAs

### 📊 Risk Matrix

```
Impact ↑  [C] backend    [C] vulns-api
HIGH      [H] database   [H] tickets-api
          [M] guides     [M] frontend
MEDIUM    [M] deploy     [L] security
          [L] intro      [L] white-papers
LOW       ──────────────────────────────→
          LOW    MEDIUM    HIGH
                Probability
```

**Full Prophecy Scroll**: MERLIN_PROPHECY_20250910T180000.md
**Previous Prophecies**: Check Memento for accuracy tracking

---
*"The future is written in code commits, for those who know how to read them."*
```

## Prophecy Types

### Sprint Prophecy
```bash
/merlin-prophecy sprint
```
- Focused on current sprint impact
- Task-level drift predictions
- Developer assignment suggestions

### Release Prophecy
```bash
/merlin-prophecy quarter
```
- Long-term strategic view
- Major refactoring impacts
- Resource planning insights

## Accuracy Tracking

Merlin tracks prophecy accuracy:
- Compares predictions to actual drift
- Adjusts confidence algorithms
- Learns from patterns over time

## Integration

Works with:
- `/merlin-audit` - Validate prophecies
- `/merlin-update-docs` - Prevent predicted drift
- `/atlas-bump-version` - Consider docs in releases
- `/generatedocs` - Schedule based on prophecies

## Automation

Include in planning:
```bash
# Sprint planning ritual
/merlin-prophecy sprint > sprint-docs-plan.md

# Monthly documentation review
/merlin-prophecy month | mail -s "Doc Drift Forecast" team@
```

## Mystical Algorithms

### Drift Velocity
```
V = ΔDocChanges / ΔTime
Acceleration = V(current) - V(previous)
```

### Risk Calculation
```
Risk = Σ(Change Frequency × Impact × Staleness) / Maintenance Score
```

### Confidence Level
```
Confidence = (Accurate Prophecies / Total Prophecies) × Pattern Strength
```

## Notes

- Prophecies improve with more historical data
- Integrates with sprint planning tools
- Can trigger automatic update schedules
- Learns from team development patterns
- Stored in Memento for pattern analysis

---

*"To predict the future, one must first understand the patterns of the past."*