# Incremental Rollout Plan - Smart Site/Location Detection

**Author**: Network Engineer → Developer Transformation  
**Date**: October 15, 2025  
**Priority**: HIGH (Saves significant time on every KEV ticket)  
**Risk**: LOW (Non-breaking, additive changes only)

---

## 🎯 Problem Statement

### Current Pain Points

1. **Manual Site/Location Entry**: Every ticket from KEV dashboard requires guessing site codes
2. **Substring Guessing**: `site = hostname.substring(0, 4)` works 80% of time, fails 20%
3. **No Pattern Recognition**: System doesn't understand `tulsatowernswan01` naming convention
4. **No Learning**: Same mistakes repeated every time
5. **Hexagon EAM Requirements**: MUST have correct 4-char SITE code for integration

### User's Perfect Workflow (Goal)

```text
1. Click "Create Ticket" from KEV dashboard
   Hostname: "tulsatowernswan01"

2. System INTELLIGENTLY parses:
   ✅ Location: "tulsatower" (extracted via regex, not substring!)
   ✅ Site Code: "TULS" (4-char for Hexagon)
   ✅ Device Type: "switch" (recognized "nswan" pattern)
   ✅ Confidence: 95%

3. Modal pre-populates with CORRECT values
   User just clicks Save (no manual correction needed)

4. If site NOT in Tenable data:
   User types "tuls" → Fuzzy search suggests "TULS - tulsatower"
   User clicks suggestion → Done!

5. System LEARNS from corrections:
   Next "tulsatower*" device → Auto-fills correctly
```

---

## 🚀 Incremental Rollout Strategy (No Breaking Changes!)

### Phase 0: Foundation (This Week - 2 hours)

**Goal**: Add smart parsing WITHOUT touching existing ticket creation logic

#### Step 0.1: Add Configuration File ✅ DONE
- **File**: `/config/device-naming-patterns.json`
- **Contents**: Device type patterns (nswan, nrwan, nfpan), site code mappings
- **Impact**: None (config file, not loaded yet)

#### Step 0.2: Add Hostname Parser Service ✅ DONE
- **File**: `/app/services/hostnameParserService.js`
- **Impact**: None (new service, not integrated yet)

#### Step 0.3: Add API Endpoint (New, Non-Breaking)
```javascript
// app/routes/api.js

const { getHostnameParserService } = require("../services/hostnameParserService");

// NEW ENDPOINT - Doesn't touch existing code
router.get("/api/devices/parse-hostname", (req, res) => {
    try {
        const { hostname } = req.query;
        const parser = getHostnameParserService();
        const result = parser.parseHostname(hostname);
        res.json(result);
    } catch (error) {
        console.error("Error parsing hostname:", error);
        res.status(500).json({ error: error.message });
    }
});

// NEW ENDPOINT - Fuzzy search for manual entry
router.get("/api/sites/fuzzy-search", (req, res) => {
    try {
        const { query } = req.query;
        const parser = getHostnameParserService();
        const results = parser.fuzzySearch(query);
        res.json(results);
    } catch (error) {
        console.error("Error in fuzzy search:", error);
        res.status(500).json({ error: error.message });
    }
});
```

**Testing**: 
```bash
curl "http://localhost:8989/api/devices/parse-hostname?hostname=tulsatowernswan01"
# Expected: {"location": "tulsatower", "site_code": "TULS", "device_type": "switch", ...}
```

---

### Phase 0.5: Frontend Integration (Week 1 - 3 hours)

**Goal**: Use smart parsing in vulnerabilities.js WITHOUT changing ticket save logic

#### Step 0.5.1: Modify `createTicketFromVulnerability()` (Non-Breaking)

**Current Code** (vulnerabilities.js):
```javascript
// OLD: Substring guessing
function createTicketFromVulnerability(vulnData) {
    const hostname = vulnData.hostname;
    
    // Current substring logic (KEEP AS FALLBACK)
    const site = hostname.substring(0, 4);
    const location = hostname.substring(0, 5);
    
    document.getElementById("site").value = site;
    document.getElementById("location").value = location;
    
    openTicketModal(vulnData);
}
```

**NEW Code** (Enhanced, with fallback):
```javascript
// ENHANCED: Smart parsing with fallback to old logic
async function createTicketFromVulnerability(vulnData) {
    const hostname = vulnData.hostname;
    
    // TRY: Smart parsing first
    try {
        const response = await fetch(`/api/devices/parse-hostname?hostname=${encodeURIComponent(hostname)}`);
        const parseResult = await response.json();
        
        if (parseResult && parseResult.confidence > 0) {
            // Use smart parsing results
            document.getElementById("site").value = parseResult.site_code;
            document.getElementById("location").value = parseResult.location;
            
            // Show confidence indicator
            showConfidenceBadge(parseResult.confidence, parseResult.parsing_method);
        } else {
            // FALLBACK: Use old substring logic
            useFallbackParsing(hostname);
        }
    } catch (error) {
        // ERROR: Fall back to old logic (system still works!)
        console.warn("Smart parsing failed, using fallback:", error);
        useFallbackParsing(hostname);
    }
    
    openTicketModal(vulnData);
}

// OLD LOGIC: Preserved as fallback
function useFallbackParsing(hostname) {
    const site = hostname.substring(0, 4);
    const location = hostname.substring(0, 5);
    
    document.getElementById("site").value = site;
    document.getElementById("location").value = location;
    
    showConfidenceBadge(0.5, "substring_fallback");
}

// NEW: Visual feedback for users
function showConfidenceBadge(confidence, method) {
    const badge = document.getElementById("siteConfidenceBadge");
    if (!badge) return;  // Graceful degradation if badge doesn't exist
    
    if (confidence >= 0.9) {
        badge.className = "badge bg-success ms-2";
        badge.textContent = "High confidence";
        badge.title = `Parsed via ${method}`;
    } else if (confidence >= 0.7) {
        badge.className = "badge bg-warning ms-2";
        badge.textContent = "Medium confidence - verify";
        badge.title = `Parsed via ${method}`;
    } else {
        badge.className = "badge bg-secondary ms-2";
        badge.textContent = "Low confidence - check values";
        badge.title = `Parsed via ${method}`;
    }
}
```

**HTML Addition** (tickets.html - optional, non-breaking):
```html
<!-- Add confidence badge next to Site field (OPTIONAL) -->
<label for="site">
    Site Code (Hexagon)
    <span id="siteConfidenceBadge" class="badge bg-secondary ms-2" style="display: none;"></span>
</label>
<input type="text" id="site" class="form-control" required>
```

**Why This is Safe**:
- ✅ Old substring logic preserved as `useFallbackParsing()`
- ✅ Try/catch ensures errors don't break ticket creation
- ✅ Confidence badge optional (works without it)
- ✅ Ticket save logic UNCHANGED (no risk to database)

---

### Phase 0.6: Fuzzy Search (Manual Entry Enhancement) (Week 1 - 2 hours)

**Goal**: When user types site/location manually, suggest matches

#### HTML Addition (tickets.html):
```html
<!-- Add fuzzy search dropdown (appears on input) -->
<div class="position-relative">
    <input type="text" 
           id="site" 
           class="form-control" 
           placeholder="Enter site code..."
           autocomplete="off">
    
    <!-- Fuzzy match results dropdown (hidden by default) -->
    <div id="siteFuzzyResults" 
         class="dropdown-menu" 
         style="display: none; max-height: 200px; overflow-y: auto;">
        <!-- Populated dynamically -->
    </div>
</div>
```

#### JavaScript Addition (tickets.js):
```javascript
// NEW: Fuzzy search on site field input
document.getElementById("site")?.addEventListener("input", async (e) => {
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        hideFuzzyResults();
        return;
    }
    
    try {
        const response = await fetch(`/api/sites/fuzzy-search?query=${encodeURIComponent(query)}`);
        const results = await response.json();
        
        if (results && results.length > 0) {
            showFuzzyResults(results);
        } else {
            hideFuzzyResults();
        }
    } catch (error) {
        console.error("Fuzzy search error:", error);
        hideFuzzyResults();
    }
});

function showFuzzyResults(results) {
    const dropdown = document.getElementById("siteFuzzyResults");
    if (!dropdown) return;
    
    dropdown.innerHTML = results.map(r => `
        <a href="#" 
           class="dropdown-item" 
           data-site="${r.site_code}" 
           data-location="${r.location}">
            <strong>${r.site_code}</strong> - ${r.location}
            <small class="text-muted ms-2">${Math.round(r.similarity * 100)}% match</small>
        </a>
    `).join("");
    
    // Add click handlers
    dropdown.querySelectorAll(".dropdown-item").forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            document.getElementById("site").value = item.dataset.site;
            document.getElementById("location").value = item.dataset.location;
            hideFuzzyResults();
        });
    });
    
    dropdown.style.display = "block";
}

function hideFuzzyResults() {
    const dropdown = document.getElementById("siteFuzzyResults");
    if (dropdown) dropdown.style.display = "none";
}
```

**Why This is Safe**:
- ✅ Only appears on manual input (doesn't interfere with auto-fill)
- ✅ Graceful degradation if HTML missing
- ✅ Doesn't change ticket save logic

---

### Phase 1: Database Integration (Week 2-3 - Full SITE_ADDRESS_DATABASE_PLAN)

**After Phase 0.6 proves stable**, implement the full plan:

1. Create `sites`, `site_aliases`, `device_site_mappings` tables
2. Migrate existing ticket data
3. Add learning mechanism (user corrections feed patterns)
4. Connect to address history system

**Why Wait?**:
- Phase 0 delivers **immediate value** (better auto-fill)
- Phase 0 **validates** the parsing logic before DB changes
- Phase 0 is **fully reversible** (just remove API calls)

---

## 📊 Testing Strategy (No Breaking Changes!)

### Manual Testing Checklist

#### Test 1: Existing Functionality (Regression Test)
```text
1. Navigate to vulnerabilities dashboard
2. Click "Create Ticket" on ANY device (even one without pattern)
3. Verify: Modal opens, fields have values (even if low confidence)
4. Save ticket
5. Verify: Ticket saves successfully with all data intact
✅ PASS: Old logic still works as fallback
```

#### Test 2: Pattern Recognition (New Feature)
```text
1. Navigate to vulnerabilities dashboard
2. Click "Create Ticket" on device: "tulsatowernswan01"
3. Verify:
   - Site: "TULS"
   - Location: "tulsatower"
   - Confidence badge: "High confidence" (green)
4. Save ticket
5. Verify: Data saved correctly, Hexagon EAM gets "TULS"
✅ PASS: Smart parsing works for known patterns
```

#### Test 3: Fuzzy Search (Enhancement)
```text
1. Open ticket modal manually
2. Type "tuls" in Site field
3. Verify: Dropdown appears with "TULS - tulsatower"
4. Click suggestion
5. Verify: Fields auto-fill
✅ PASS: Fuzzy search assists manual entry
```

#### Test 4: Fallback Behavior (Safety Net)
```text
1. Temporarily break config file (rename it)
2. Click "Create Ticket" from KEV dashboard
3. Verify: Modal still opens with substring-parsed values
4. Restore config file
✅ PASS: System degrades gracefully
```

---

## 🎓 Configuration Management

### Adding New Device Type Patterns

**Example**: Your team starts using "nlban" for load balancers

**Edit** `/config/device-naming-patterns.json`:
```json
{
  "deviceTypePatterns": [
    {
      "pattern": "nswan",
      "description": "Switch (WAN)",
      "type": "switch",
      "precedence": 1
    },
    {
      "pattern": "nlban",          // NEW
      "description": "Load Balancer",
      "type": "load_balancer",
      "precedence": 4
    }
  ]
}
```

**Reload**: Restart Node.js server OR add admin endpoint:
```javascript
router.post("/api/admin/reload-hostname-config", (req, res) => {
    const parser = getHostnameParserService();
    parser.reloadConfig();
    res.json({success: true, message: "Configuration reloaded"});
});
```

### Adding New Site Code Mappings

**Example**: New site "Durant" with code "DURA"

**Edit** `/config/device-naming-patterns.json`:
```json
{
  "siteCodeMappings": {
    "mappings": [
      {
        "location": "durant",           // NEW
        "site_code": "DURA",
        "aliases": ["dur", "dura", "durantok"],
        "confidence": 0.95,
        "source": "manual_config"
      }
    ]
  }
}
```

**Benefit**: Next time device with "durant" hostname appears, auto-resolves to "DURA"

---

## 📈 Expected Outcomes

### Week 1 (After Phase 0.6)
- ✅ KEV tickets auto-fill with 90-95% accuracy (up from 80%)
- ✅ User sees confidence badges (knows when to verify)
- ✅ Fuzzy search reduces typing on manual entry
- ✅ **Zero breaking changes** to existing tickets

### Week 2-3 (After Phase 1)
- ✅ Database tracks all site codes centrally
- ✅ System learns from user corrections
- ✅ Multi-team site aliases work seamlessly
- ✅ Address history integrates with smart site detection

### Month 2 (After Full Rollout)
- ✅ Accuracy reaches 95%+
- ✅ Average ticket creation time: 30-60 seconds (down from 2-3 minutes)
- ✅ **15+ hours saved per person per year**

---

## 🛡️ Rollback Plan (If Needed)

### Emergency Rollback (5 minutes)

**If smart parsing causes issues:**

1. **Comment out API calls** in `vulnerabilities.js`:
```javascript
// ROLLBACK: Comment this block
// try {
//     const response = await fetch(`/api/devices/parse-hostname?...`);
//     ...
// }

// ALWAYS use fallback for now
useFallbackParsing(hostname);
```

2. **Restart application**: `docker-compose restart`

3. **System reverts to old substring logic** (100% original behavior)

**No database changes in Phase 0**, so rollback is trivial!

---

## 🎯 Success Metrics

### Key Performance Indicators (KPIs)

| Metric | Before | Target (Phase 0.6) | Target (Phase 1) |
|--------|--------|-------------------|------------------|
| Auto-fill accuracy | 80-90% | 90-95% | 95%+ |
| Manual corrections needed | 10-20% | 5-10% | <5% |
| Avg ticket creation time | 2-3 min | 1-2 min | 30-60 sec |
| User confidence | Low | Medium | High |
| Hexagon EAM errors | 5-10% | 2-5% | <2% |

### User Satisfaction Indicators

- ✅ User says: "Wow, it just knew the site code!"
- ✅ User stops manually correcting site fields
- ✅ User requests fuzzy search in other modules
- ✅ Other teams ask for this feature

---

## 📋 Implementation Checklist

### Phase 0 (This Week - Non-Breaking)

- [x] Create `/config/device-naming-patterns.json`
- [x] Create `/app/services/hostnameParserService.js`
- [ ] Add API endpoints (`/api/devices/parse-hostname`, `/api/sites/fuzzy-search`)
- [ ] Test API endpoints with curl/Postman
- [ ] Modify `vulnerabilities.js` with fallback logic
- [ ] Add confidence badge HTML (optional)
- [ ] Add fuzzy search dropdown (optional)
- [ ] Test on dev environment
- [ ] User acceptance testing (create 10 tickets)
- [ ] Deploy to production (low risk!)

### Phase 0.6 (Week 1 - Enhancements)

- [ ] Add fuzzy search event listeners
- [ ] Style confidence badges
- [ ] Add keyboard navigation for fuzzy results
- [ ] Test with real Tenable data
- [ ] Monitor accuracy metrics

### Phase 1 (Week 2-3 - Database Integration)

- [ ] Follow `SITE_ADDRESS_DATABASE_PLAN.md` Phase 1
- [ ] Create sites/aliases tables
- [ ] Migrate existing data
- [ ] Integrate hostnameParser with deviceSiteLookup
- [ ] Add learning mechanism

---

## 🎓 Lessons Learned (Pre-mortem)

### What Could Go Wrong?

**Risk 1**: Config file has syntax error
- **Mitigation**: Service has fallback config in code
- **Detection**: Logs show "Failed to load config"
- **Recovery**: Fix JSON, restart service

**Risk 2**: API endpoint slow (>1 second)
- **Mitigation**: Async/await with timeout, fallback to substring
- **Detection**: Monitor response times
- **Recovery**: Optimize regex patterns, add caching

**Risk 3**: Fuzzy search suggests wrong site
- **Mitigation**: Confidence scores, user can ignore suggestions
- **Detection**: User reports incorrect auto-fill
- **Recovery**: Update config mappings, adjust similarity threshold

**Risk 4**: New hostname pattern doesn't match
- **Mitigation**: Fallback to substring always works
- **Detection**: Low confidence badge appears
- **Recovery**: Add new pattern to config

---

## 📖 Related Documentation

- **Main Plan**: `/SITE_ADDRESS_DATABASE_PLAN.md`
- **Device Mapping**: `/docs/implementations/DEVICE_SITE_MAPPING.md`
- **Architecture**: `/docs/implementations/SITE_SYSTEM_ARCHITECTURE.md`
- **Config Schema**: `/config/device-naming-patterns.json`

---

## 🚀 Ready to Deploy?

**Pre-flight Checklist**:
- [x] Planning complete
- [x] Code written with fallbacks
- [ ] Tests pass (regression + new features)
- [ ] Config file reviewed
- [ ] Backup database (just in case)
- [ ] Deploy to dev environment
- [ ] User testing (3-5 tickets)
- [ ] Monitor logs for errors
- [ ] Deploy to production
- [ ] Celebrate! 🎉

---

**This is YOUR tool to make YOUR job easier. Roll it out at YOUR pace. No pressure!** 😊
