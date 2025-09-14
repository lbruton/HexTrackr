# Claude Code Subagent Usage Guide

This reference guide covers all available Claude Code subagents organized by domain and use case. Each agent is an expert in a specific technology domain and can be invoked automatically by context or explicitly by name.

## Quick Reference

### How to Use Subagents

**Automatic Invocation**: Claude Code automatically selects the appropriate subagent based on task context.

**Explicit Invocation**: Mention the subagent by name:

```
"Use the python-expert to optimize this algorithm"
"Get the react-expert to refactor this component"
```

## Subagent Categories

### 00. System Agents

*Internal orchestration and meta-coordination agents*

### 01. Core Development

- **api-designer**: REST and GraphQL API architecture, endpoint design, documentation
- **backend-developer**: Server-side development, scalable APIs, microservices
- **electron-pro**: Cross-platform desktop applications with web technologies
- **frontend-developer**: UI/UX development, React/Vue/Angular components
- **fullstack-developer**: End-to-end feature development, full-stack integration
- **graphql-architect**: GraphQL schemas, federation, resolvers, type systems
- **microservices-architect**: Distributed systems design, service boundaries
- **mobile-developer**: Cross-platform mobile development, React Native/Flutter
- **ui-designer**: Visual design, interaction patterns, accessibility
- **websocket-engineer**: Real-time communication, bidirectional protocols
- **wordpress-master**: WordPress development, themes, plugins, performance

### 02. Language Specialists

#### Systems Programming

- **c-expert**: C programming, memory management, system calls, performance
- **cpp-expert**: Modern C++ (C++20/23), STL, templates, RAII, smart pointers
- **rust-expert**: Rust development, memory safety, ownership, systems programming

#### Web Languages

- **javascript-expert**: Modern JavaScript (ES6+), async patterns, Node.js APIs
- **typescript-expert**: TypeScript development, type safety, advanced features
- **php-expert**: Modern PHP (8.3+), Laravel, Symfony, performance optimization

#### Enterprise Languages

- **java-expert**: Java development, Spring Boot, enterprise patterns, JVM
- **csharp-expert**: C# development, .NET ecosystem, LINQ, enterprise patterns
- **kotlin-expert**: Kotlin development, Android, Spring Boot, coroutines
- **scala-expert**: Scala development, functional programming, Akka, JVM

#### Dynamic Languages

- **python-expert**: Python (3.11+), type safety, async, data science, web frameworks
- **ruby-expert**: Ruby development, Rails, metaprogramming, elegant syntax
- **go-expert**: Go development, concurrency, channels, idiomatic patterns

#### Mobile Languages

- **swift-expert**: Swift development, iOS/macOS, Apple ecosystem, SwiftUI
- **dart-expert**: Dart development, Flutter, mobile apps, cross-platform

#### Functional Languages

- **haskell-expert**: Haskell development, functional programming, monads
- **clojure-expert**: Clojure development, functional programming, Lisp
- **elixir-expert**: Elixir development, functional programming, Erlang VM
- **erlang-expert**: Erlang development, concurrent programming, fault tolerance
- **ocaml-expert**: OCaml development, functional/systems programming

#### Specialized Languages

- **lua-expert**: Lua scripting, game development, embedded systems
- **perl-expert**: Perl development, text processing, system administration

### 03. Infrastructure

#### Containerization & Orchestration

- **docker-expert**: Docker containerization, images, multi-stage builds
- **kubernetes-expert**: Container orchestration, scaling, production deployment

#### Infrastructure as Code

- **terraform-expert**: Infrastructure provisioning, cloud resources, state management
- **pulumi-expert**: Multi-language infrastructure as code, cloud provisioning
- **ansible-expert**: Configuration management, automation, deployment

#### CI/CD Platforms

- **jenkins-expert**: CI/CD pipelines, automation, distributed builds
- **github-actions-expert**: GitHub workflows, automation, marketplace actions
- **gitlab-ci-expert**: GitLab pipelines, DevOps automation, runners
- **circleci-expert**: Continuous integration/deployment, parallel execution

### 04. Quality & Security

#### Testing Frameworks

- **jest-expert**: JavaScript testing, mocking, snapshot testing
- **vitest-expert**: Vite-based testing, modern JavaScript testing
- **mocha-expert**: Flexible JavaScript testing framework
- **jasmine-expert**: BDD testing, behavior-driven development
- **ava-expert**: Concurrent testing, modern JavaScript patterns
- **cypress-expert**: End-to-end testing, web automation, component testing
- **playwright-expert**: Cross-browser testing, automation, mobile testing
- **selenium-expert**: Web automation, browser testing, grid setup
- **testcafe-expert**: End-to-end testing without WebDriver
- **puppeteer-expert**: Chrome automation, headless browsing, PDF generation

#### Security & Authentication

- **owasp-top10-expert**: Web application security, vulnerability assessment
- **jwt-expert**: Token-based authentication, security best practices
- **oauth-oidc-expert**: OAuth 2.0, OpenID Connect, identity protocols
- **auth0-expert**: Authentication/authorization service integration
- **keycloak-expert**: Identity and access management, SSO

### 05. Data & AI

#### Data Science & ML

- **pandas-expert**: Data manipulation, analysis, data cleaning
- **numpy-expert**: Numerical computing, array operations, scientific computing
- **scikit-learn-expert**: Machine learning, model selection, feature engineering
- **tensorflow-expert**: Deep learning, neural networks, production ML
- **pytorch-expert**: Deep learning, dynamic computation graphs, research
- **langchain-expert**: LLM applications, RAG systems, AI workflows

#### Databases - SQL

- **sql-expert**: Complex queries, optimization, database design
- **postgres-expert**: PostgreSQL advanced features, extensions, performance
- **mysql-expert**: MySQL development, InnoDB, replication, performance
- **sqlite-expert**: Embedded databases, mobile apps, local storage
- **mariadb-expert**: MariaDB development, MySQL compatibility
- **mssql-expert**: Microsoft SQL Server, T-SQL, enterprise features

#### Databases - NoSQL

- **mongodb-expert**: MongoDB development, aggregation, sharding, performance
- **redis-expert**: Caching, pub/sub, data structures, performance
- **neo4j-expert**: Graph databases, Cypher queries, relationships
- **cassandra-expert**: Distributed databases, CQL, high availability
- **cockroachdb-expert**: Distributed SQL, consistency, scalability
- **dynamodb-expert**: NoSQL patterns, AWS integration, performance
- **elasticsearch-expert**: Search, analytics, ELK stack, full-text search
- **opensearch-expert**: Search and analytics, Elasticsearch alternative
- **vector-db-expert**: Vector databases, embeddings, similarity search

#### ORMs & Query Builders

- **prisma-expert**: Type-safe database access, migrations, schema modeling
- **sequelize-expert**: Node.js ORM, database management, associations
- **typeorm-expert**: TypeScript ORM, decorators, active record/data mapper
- **knex-expert**: Query builder, migrations, database abstraction
- **mongoose-expert**: MongoDB ODM, schemas, middleware, validation

### 06. Developer Experience

#### Build Tools & Bundlers

- **webpack-expert**: Module bundling, optimization, plugins
- **rollup-expert**: ES module bundling, tree shaking, library builds

#### Runtime & Package Managers

- **nodejs-expert**: Node.js runtime, packages, performance optimization
- **bun-expert**: Fast JavaScript runtime, package manager, bundler
- **deno-expert**: Secure JavaScript runtime, TypeScript native

#### Background Jobs & Queues

- **celery-expert**: Distributed task queues, Python background jobs
- **sidekiq-expert**: Background job processing, Ruby/Rails integration
- **bullmq-expert**: Redis-based job queues, Node.js task processing

### 07. Specialized Domains

#### Web Frameworks - Frontend

- **react-expert**: React (18+), hooks, state management, performance
- **vue-expert**: Vue.js (3+), Composition API, reactivity, performance
- **angular-expert**: Angular (15+), TypeScript, RxJS, enterprise patterns
- **svelte-expert**: Svelte development, reactivity, minimal bundle size
- **solidjs-expert**: Fine-grained reactivity, performance optimization
- **nextjs-expert**: Next.js (14+), SSR/SSG, React optimization
- **remix-expert**: Remix development, nested routing, web standards
- **angularjs-expert**: Legacy AngularJS support, migration strategies
- **astro-expert**: Static site generation, component islands
- **jquery-expert**: DOM manipulation, legacy browser support

#### Web Frameworks - Backend

- **express-expert**: Express.js middleware, routing, Node.js APIs
- **fastapi-expert**: FastAPI async/await, Pydantic, OpenAPI documentation
- **flask-expert**: Flask blueprints, extensions, Python web patterns
- **django-expert**: Django ORM, admin interface, Python web framework
- **rails-expert**: Ruby on Rails, MVC, ActiveRecord, conventions
- **laravel-expert**: Laravel Eloquent, Blade, PHP web patterns
- **nestjs-expert**: NestJS decorators, modules, enterprise architecture
- **spring-boot-expert**: Spring Boot microservices, Java enterprise
- **gin-expert**: Gin framework, Go web APIs, middleware
- **fiber-expert**: Fiber framework, high-performance Go web apps
- **fastify-expert**: High-performance Node.js web framework
- **aspnet-core-expert**: ASP.NET Core, C# web APIs, .NET ecosystem
- **actix-expert**: Actix-web, Rust web frameworks, async patterns
- **phoenix-expert**: Phoenix framework, Elixir, real-time features

#### Styling & UI

- **html-expert**: Semantic markup, accessibility, web standards
- **css-expert**: Modern layouts, animations, responsive design
- **tailwind-expert**: Utility-first CSS, customization, performance

#### Mobile & Desktop

- **react-native-expert**: Cross-platform mobile, native modules
- **flutter-expert**: Flutter/Dart, cross-platform, widget system
- **ios-expert**: iOS development, Swift, UIKit, Apple guidelines
- **swiftui-expert**: SwiftUI declarative UI, modern iOS patterns
- **android-expert**: Android development, Kotlin, Jetpack Compose
- **electron-expert**: Cross-platform desktop, web technologies
- **tauri-expert**: Rust backend, web frontend, lightweight desktop
- **expo-expert**: React Native managed workflow, development tools

### 08. Business & Product

#### Payment Processing

- **stripe-expert**: Payment processing, webhooks, subscriptions
- **braintree-expert**: Payment processing, PayPal integration

#### Communication & Messaging

- **rabbitmq-expert**: Message queuing, AMQP, distributed systems
- **kafka-expert**: Event streaming, distributed systems, real-time data
- **nats-expert**: Lightweight messaging, pub/sub, microservices
- **mqtt-expert**: IoT messaging, lightweight protocols, device communication
- **websocket-expert**: Real-time communication, bidirectional data flow
- **grpc-expert**: High-performance RPC, protocol buffers, microservices

#### API Technologies

- **graphql-expert**: Schemas, resolvers, federation, type systems
- **rest-expert**: HTTP standards, API design, best practices
- **openapi-expert**: API documentation, specifications, tooling
- **trpc-expert**: End-to-end type safety, TypeScript APIs

#### External Services

- **openai-api-expert**: GPT models, AI integration, prompt engineering
- **sns-expert**: AWS messaging, notifications, pub/sub patterns
- **sqs-expert**: AWS message queuing, distributed systems

### 09. Meta-Orchestration

#### Monitoring & Observability

- **prometheus-expert**: Metrics collection, monitoring, alerting
- **grafana-expert**: Visualization, dashboard creation, data sources
- **loki-expert**: Log aggregation, querying, observability
- **elk-expert**: Elasticsearch, Logstash, Kibana stack
- **opentelemetry-expert**: Observability, tracing, metrics standardization

#### Database Management

- **flyway-expert**: Database migrations, version control, schema evolution
- **liquibase-expert**: Database change management, rollbacks

### 10. Research & Analysis

*Analysis and research-focused agents*

## Usage Patterns

### Development Workflow

1. **Planning**: Use architecture agents for system design
2. **Implementation**: Use language-specific experts for coding
3. **Testing**: Use testing framework experts for quality assurance
4. **Deployment**: Use infrastructure experts for production readiness
5. **Monitoring**: Use observability experts for operational insights

### Best Practices

- **Context Matters**: Agents are automatically selected based on file types and project structure
- **Explicit Override**: Use agent names when you need specific expertise
- **Combine Agents**: Complex tasks may involve multiple agents working together
- **Stay Current**: Agents are updated with latest framework versions and best practices

## Agent Locations

- **Core Agents**: `~/.claude/agents/00-system-agents/` through `~/.claude/agents/10-research-analysis/`
- **Expert Collection**: `~/.claude/agents/99-expert-agents/` (265+ specialized agents)
- **Project Specific**: Local `.claude/agents/` directory for custom agents

Total Available Agents: **265+** across all categories and domains.
