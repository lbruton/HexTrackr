# rEngine MCP Workflow Flowchart

## 🔄 **Complete System Flow**

```mermaid
graph TD
    A[User Starts VS Code Chat] --> B{Action Type?}
    
    B -->|Development Request| C[Rapid Context Search]
    B -->|Break Request| D[Session Handoff]
    B -->|Resume Request| E[Session Resume]
    B -->|Analysis Request| F[AI Analysis]
    
    C --> C1[Search Matrix Query]
    C1 --> C2{Context Found?}
    C2 -->|Yes| C3[Return Targeted Results]
    C2 -->|No| C4[Full Project Ingestion]
    C4 --> C5[Ollama Analysis]
    C5 --> C6[Update Search Matrix]
    C6 --> C3
    
    D --> D1[Force Conversation Scribe]
    D1 --> D2[Ollama Session Analysis]
    D2 --> D3[Create Memory Matrix]
    D3 --> D4[Save to rAgents/session_handoffs.json]
    D4 --> D5[Clear Buffer & End Session]
    
    E --> E1[Load Latest Handoff]
    E1 --> E2[Ollama Context Compression]
    E2 --> E3[Return Minimal Token Context]
    E3 --> E4[Resume Development]
    
    F --> F1{Provider Available?}
    F1 -->|Groq| F2[Groq Analysis]
    F1 -->|Claude| F3[Claude Analysis]
    F1 -->|ChatGPT| F4[ChatGPT Analysis]
    F1 -->|Gemini| F5[Gemini Analysis]
    F1 -->|Ollama| F6[Ollama Analysis]
    
    F2 --> F7[Auto-Record to Memory]
    F3 --> F7
    F4 --> F7
    F5 --> F7
    F6 --> F7
    
    F7 --> G[Automatic Background Processing]
    C3 --> G
    E4 --> G
    
    G --> G1[30-Second Auto-Scribe]
    G1 --> G2[Ollama Memory Analysis]
    G2 --> G3[Update rAgents Memory]
    G3 --> G4[Enhance Search Matrix]
    G4 --> H[Ready for Next Request]
    
    H --> B
```

## 🎯 **Key Workflow Principles**

### **1. Token Efficiency**

- Ollama processes full project locally
- Returns only essential context
- Compressed handoff summaries
- Minimal resume contexts

### **2. Context Continuity**

- Automatic conversation recording
- Intelligent session handoffs
- Smart resume detection
- Persistent memory matrix

### **3. Rapid Targeting**

- Search matrix for instant location
- Full project ingestion fallback
- 1-2 transaction efficiency
- Exact file/function targeting

### **4. AI Provider Resilience**

- 5-tier fallback system
- Intelligent provider selection
- Local Ollama backup
- Automatic error recovery

## 🧠 **Prompt Engineering Architecture**

### **System Roles by Function:**

1. **Code Analysis Expert** - Search matrix creation
2. **Precision Analysis Expert** - Token-efficient responses  
3. **Memory Analysis Expert** - Conversation processing
4. **Code Targeting Specialist** - Exact location finding
5. **Session Handoff Expert** - Break/resume optimization
6. **Context Compression Expert** - Minimal token resumption

### **Prompt Optimization Strategy:**

- Specialized system roles for specific tasks
- JSON output formatting for consistency
- Token efficiency as primary constraint
- Context preservation as secondary goal
- Exact targeting over broad analysis

## ⚡ **Performance Metrics**

- **Search Matrix Entries**: 18+ context mappings
- **Response Time**: 1-2 transaction targeting
- **Memory Efficiency**: 30-second auto-processing
- **Context Accuracy**: Ollama-verified summaries
- **Session Continuity**: Perfect handoff/resume cycle
