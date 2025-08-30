# Protocol 004: Code Development with Context7 Integration

**Protocol ID**: CODE-DEV-004  
**Version**: 1.0  
**Type**: Operational  
**Layer**: Development  
**Status**: Active  
**Priority**: HIGH

## Overview

This protocol ensures that all code development activities leverage Context7 for up-to-date library documentation and follows best practices for library selection and implementation.

## Core Requirements

### **1. Context7 Integration Mandatory**

- **Before coding**: Always check Context7 for latest library documentation
- **Library selection**: Use Context7 to compare options and find optimal solutions
- **Documentation reference**: Include Context7 library tokens and snippets in context
- **Version awareness**: Ensure using current library versions and patterns

### **2. Library Selection Criteria**

```json
{
  "priority_order": [
    "modern_frameworks",
    "actively_maintained", 
    "good_documentation",
    "community_support",
    "performance_optimized"
  ],
  "preferred_libraries": {
    "frontend": ["Next.js", "React", "Tailwind CSS", "Shadcn UI"],
    "backend": ["FastAPI", "Express", "Supabase"],
    "ui_components": ["Shadcn UI", "Radix UI", "Headless UI"],
    "styling": ["Tailwind CSS", "CSS Modules"],
    "state_management": ["Zustand", "React Query", "SWR"],
    "ai_integration": ["Vercel AI SDK", "LangChain"],
    "data_viz": ["D3.js", "Chart.js", "Recharts"]
  }
}
```

### **3. Context7 Workflow**

1. **Search Phase**: Query Context7 for relevant libraries
2. **Documentation Review**: Read latest docs and best practices
3. **Token Estimation**: Check documentation size for context planning
4. **Implementation**: Use current patterns and examples
5. **Validation**: Verify against latest library standards

## Implementation Guidelines

### **HTML/JavaScript Development**

```markdown

## 🔍 Context7 Library Check

- [ ] Searched Context7 for relevant libraries
- [ ] Reviewed latest documentation (within 1 week)
- [ ] Selected appropriate library versions
- [ ] Included library context in development

## 📚 Libraries Used

- **Framework**: [library name] (Context7 tokens: XXX)
- **Styling**: [library name] (Context7 tokens: XXX)
- **Components**: [library name] (Context7 tokens: XXX)
- **Utils**: [library name] (Context7 tokens: XXX)

## 🎯 Implementation Notes

- Latest patterns from Context7 docs
- Performance considerations
- Accessibility standards
- Mobile responsiveness

```

### **React/Next.js Projects**

```javascript
// Protocol-compliant React component structure
// Based on Context7 latest Next.js documentation

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils' // Shadcn pattern
import { Button } from '@/components/ui/button' // Shadcn UI

// Component follows latest Context7 React patterns
export function ProtocolCompliantComponent({ className, ...props }) {
  // Implementation using latest library patterns
  return (
    <div className={cn("protocol-component", className)} {...props}>
      {/* Context7-documented patterns */}
    </div>
  )
}
```

### **Backend API Development**

```python

# Protocol-compliant FastAPI structure

# Based on Context7 latest FastAPI documentation

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

# Following Context7 FastAPI patterns

app = FastAPI(
    title="rEngine API",
    description="Protocol-compliant API following Context7 patterns",
    version="1.0.0"
)

# Implementation using latest library standards

```

## Docker Integration

### **Context7 MCP Access**

```bash

# Context7 available at: http://localhost:4049

# Search libraries before coding

curl -X GET "http://localhost:4049/search?q=react"

# Get library documentation

curl -X GET "http://localhost:4049/docs/react"
```

### **Development Workflow**

1. **Start Enhanced Docker**: `./docker/rengine-manager.sh start enhanced`
2. **Access Context7**: <http://localhost:4049>
3. **Search libraries**: Use Context7 interface
4. **Copy documentation**: Include in development context
5. **Implement**: Follow latest patterns

## Protocol Compliance Checklist

### **Before Starting Any Code Project**

- [ ] Context7 server running (port 4049)
- [ ] Searched for relevant libraries
- [ ] Reviewed latest documentation
- [ ] Selected appropriate library stack
- [ ] Estimated context token requirements

### **During Development**

- [ ] Following latest library patterns
- [ ] Using current syntax and APIs
- [ ] Implementing best practices from docs
- [ ] Considering performance implications
- [ ] Ensuring accessibility standards

### **Code Review Requirements**

- [ ] Libraries are current versions
- [ ] Patterns match Context7 documentation
- [ ] No deprecated methods used
- [ ] Performance optimized
- [ ] Accessible implementation

## Library-Specific Guidelines

### **Next.js Projects**

- **App Router**: Use latest App Router patterns from Context7
- **Server Components**: Follow current server/client component patterns
- **Styling**: Integrate Tailwind CSS with latest configuration
- **State**: Use Zustand or React Query for state management

### **React Components**

- **Hooks**: Use latest React 18+ patterns
- **TypeScript**: Follow current TypeScript patterns
- **Styling**: Use Tailwind + Shadcn UI components
- **Testing**: Follow current testing library patterns

### **Styling & UI**

- **Tailwind CSS**: Use latest utility classes and configuration
- **Shadcn UI**: Follow component patterns and theming
- **Responsive**: Mobile-first approach
- **Dark Mode**: Support system preferences

## Error Prevention

### **Common Issues to Avoid**

1. **Outdated patterns**: Using old library syntax
2. **Version conflicts**: Mixing incompatible versions
3. **Performance issues**: Not following optimization patterns
4. **Accessibility gaps**: Missing ARIA and semantic markup
5. **Security concerns**: Not following security best practices

### **Validation Steps**

1. **Context7 verification**: Confirm patterns match latest docs
2. **Performance check**: Ensure optimal implementation
3. **Accessibility audit**: Test with screen readers
4. **Security review**: Follow security best practices
5. **Mobile testing**: Verify responsive behavior

## Integration with rEngine Platform

### **Memory Integration**

- Store library choices in `rMemory/library_decisions.json`
- Track Context7 usage patterns
- Document library selection rationale

### **Project Tracking**

- Update MASTER_ROADMAP.md with library decisions
- Track technical debt related to library updates
- Monitor for security updates

### **Automation**

- Regular Context7 library update checks
- Automated dependency updates
- Security vulnerability scanning

## 🔗 Referenced Protocols

### **Foundation Protocols** (Required)

- **MULTI-PROJ-001 v1.0**: Multi-Project Tracking Protocol
  - **Applies to**: Project structure, naming conventions
  - **Sections Used**: §3 (Naming Convention), §4 (Directory Structure)

- **NOTES-001 v1.0**: Notes and Documentation Protocol  
  - **Applies to**: Code documentation, library decision tracking
  - **Sections Used**: §2 (Attribution Standards), §3 (Placement Rules)

### **Development Protocols** (Related)

- **TOKEN-MGT-019 v1.0**: Token Limit Management Protocol
  - **Applies to**: Context7 documentation token planning
  - **Sections Used**: §2 (Token Estimation), §3 (Context Management)

## Success Metrics

- **Library Currency**: 100% usage of libraries updated within 30 days
- **Pattern Compliance**: All code follows Context7 documented patterns
- **Performance**: No performance regressions from library choices
- **Security**: Zero security vulnerabilities from outdated libraries
- **Developer Experience**: Reduced development time through better library docs

---

**Maintained by**: rEngine AI Assistant System  
**Last Updated**: August 23, 2025  
**Next Review**: September 23, 2025
