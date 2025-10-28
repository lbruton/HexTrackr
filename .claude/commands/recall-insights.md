Please invoke the memento-oracle task tool and Generate a weekly insights report covering the last 7 days of development.

**Project Detection**: Auto-detects from working directory, or override with `project:name` argument

**Project Context Helper:**
```javascript
// Auto-detect project or use explicit override
const getProject = (args = "") => {
  // Priority 1: Explicit project argument
  const projectMatch = args.match(/project:(\w+)/i);
  if (projectMatch) return projectMatch[1].toUpperCase();

  // Priority 2: Git repository name from working directory
  try {
    const cwd = process.cwd();
    const parts = cwd.split('/').filter(p => p.length > 0);
    const repoName = parts[parts.length - 1];
    if (repoName && repoName !== 'tmp') return repoName.toUpperCase();
  } catch (e) {}

  // Priority 3: Fallback to generic
  return "PROJECT";
};

const PROJECT = getProject($ARGUMENTS);
const PROJECT_TAG = `project:${PROJECT.toLowerCase()}`;
```

Please:
1. Query Memento for all sessions from the last 7 days
2. Extract key discoveries, insights, and breakthroughs from each day
3. Identify major achievements, problems solved, and cultural shifts
4. Use optimized searches to find related work
5. Provide the User with the information using the following template

**Enhanced Search Strategy (Optimized for Search Type):**
- **Temporal Tags** (use search_nodes): `"week-${currentWeek}-${year}"` for exact week
- **Project Tags** (use search_nodes): `"${PROJECT_TAG}"` for current project
- **Linear Tags** (use search_nodes): `"linear:HEX-XXX"` to group by Linear issues
- **Learning Tags** (use search_nodes): `"breakthrough"`, `"lesson-learned"`, `"pattern"` tags
- **Spec Tags** (use search_nodes): `"spec:XXX"` tags to group work by specifications
- **Status Tags** (use search_nodes): `"completed"` vs `"in-progress"` to show progress
- **Conceptual Insights** (use semantic_search): Search for themes like "performance improvements", "architectural decisions", "quality enhancements"

**Tag Reference**: See `TAXONOMY.md` in project root (or Linear DOCS-14 if available)

Template:

# Weekly Insights Report

## 📅 [Project Name]: 7-Day Journey of Discoveries (Month Days, Year)

### Day 1: Month Date - One Line Summary
**🔍 Key Discoveries**:
- [What was found or uncovered]
**💡 Insights**:
- [What was learned or understood]
**🚀 Breakthroughs**:
- [Major advances or solutions]
**🏷️ Tags**: [Relevant tags from that day's work]

### Day 2: Month Date - One Line Summary
**🔍 Key Discoveries**:
**💡 Insights**:
**🚀 Breakthroughs**:
**🏷️ Tags**:

### Day 3: Month Date - One Line Summary
**🔍 Key Discoveries**:
**💡 Insights**:
**🚀 Breakthroughs**:
**🏷️ Tags**:

### Day 4: Month Date - One Line Summary
**🔍 Key Discoveries**:
**💡 Insights**:
**🚀 Breakthroughs**:
**🏷️ Tags**:

### Day 5: Month Date - One Line Summary
**🔍 Key Discoveries**:
**💡 Insights**:
**🚀 Breakthroughs**:
**🏷️ Tags**:

### Day 6: Month Date - One Line Summary
**🔍 Key Discoveries**:
**💡 Insights**:
**🚀 Breakthroughs**:
**🏷️ Tags**:

### Day 7: Month Date - One Line Summary
**🔍 Key Discoveries**:
**💡 Insights**:
**🚀 Breakthroughs**:
**🏷️ Tags**:

## 🎯 Week Summary

**Major Achievements**:
- [List significant completions]

**Cultural Shifts**:
- [Changes in approach or philosophy]

**Problems Solved**:
- [Issues resolved]

**Specifications Progress** (if applicable):
- Spec XXX: [Status and progress]
- Spec YYY: [Status and progress]

**Cross-Project Insights** (if any):
- [Reusable patterns or lessons that apply beyond current project]

---

*Generated using Memento Knowledge Graph with Tag-Based Search*
*Tag Taxonomy: /TAXONOMY.md*