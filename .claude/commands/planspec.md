Collaboratively plan and refine a feature idea before creating the specification.

**Purpose**: Interactive ideation phase to explore, refine, and prepare a feature concept before formal specification.

**Usage**: `/planspec "rough feature idea"`

**Process**:

## Phase 1: Initial Discussion
When user provides a rough idea, engage in dialogue to understand:
1. **Problem Statement**: What specific problem does this solve?
2. **User Impact**: Who benefits and how?
3. **Success Criteria**: How do we measure success?
4. **Constraints**: Any technical or business limitations?
5. **Dependencies**: What existing features does this touch?

## Phase 2: Explore Approaches
Discuss potential solutions:
- Present 2-3 different approaches if applicable
- Highlight trade-offs of each approach
- Consider edge cases and error scenarios
- Discuss integration with existing features

## Phase 3: Refine Requirements
Work with user to clarify:
- Specific metrics (e.g., "fast" → "<500ms response time")
- Scale expectations (e.g., "many users" → "50+ concurrent")
- Deployment details (e.g., "web app" → "Docker on port 8989")
- Technology constraints from current stack

## Phase 4: Generate Specification Prompt
Output a polished, detailed prompt for `/specify` that includes:
- Clear problem statement
- Concrete success criteria
- Specific constraints and requirements
- All clarifications from discussion

## Example Interaction:

```
User: /planspec "I want to fix the table overflow"

Claude: Let me help you refine this idea. First, which table is having overflow issues?

User: The AG-Grid vulnerability table - it scrolls horizontally on some screens

Claude: I see. Let me understand the current situation better...

Based on what you've described, the overflow issue likely occurs when:
- Viewport width is between 1024-1400px
- More than 25 items are displayed

What's your preferred solution approach:
1. Adjust container padding dynamically?
2. Modify column widths to be more responsive?
3. Implement horizontal scroll as intended behavior?

User: Let's keep the padding but fix the calculation

Claude: Good choice. Let me clarify a few details:
- Should this work for all item counts (10, 25, 50, 100)?
- Minimum browser width to support? (current: 768px)
- Should we maintain the current 15px padding exactly?

User: Yes to all

Claude: Perfect! Here's the refined specification prompt:

"Create a specification for fixing the AG-Grid table container overflow issue in the 
vulnerability view. The solution must maintain the current 15px padding while preventing 
horizontal scroll at all viewport widths from 768px to 1920px. The fix should work 
correctly with all item count options (10, 25, 50, 100 items) and preserve the current 
column visibility and sizing behavior. Success is measured by no horizontal scroll bar 
appearing at any supported viewport width while maintaining full data visibility."

Would you like me to refine this further or shall we proceed to /specify?
```

## Key Principles:
- **Ask, don't assume** - Get specific details from user
- **Dialogue over research** - Focus on understanding user needs through conversation
- **Concrete over vague** - Transform general ideas into specific requirements
- **Validate understanding** - Confirm interpretation before proceeding

## Output Format:
The final output should be a single, comprehensive prompt that can be passed directly to `/specify` command, containing all necessary context and constraints discovered during the discussion.