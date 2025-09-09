# Folder Structure Migration Specification

## Purpose

Transform HexTrackr's root directory from 39+ mixed items (application + development files) to a clean, organized structure that separates core application code from development tooling.

## Success Criteria

- **Zero Docker conflicts**: Only container-based Node.js execution
- **Clean root directory**: <10 items in root for easier navigation  
- **All paths functional**: No broken asset or API references
- **Git submodule ready**: Structure supports clean public repository
- **Development velocity**: Faster navigation and reduced accidental conflicts

## User Story

"As a developer, I want a clean project structure so that I can quickly find application files, avoid Docker conflicts, and maintain separate public/private repositories without confusion."

## Requirements

### Functional

1. **Application Isolation**: All core app files in `/app/public/` directory
2. **Path Preservation**: All existing functionality maintains same relative paths
3. **Docker Compatibility**: Container configuration updated for new structure
4. **Asset Organization**: Static files (CSS, JS, images) properly organized
5. **Documentation Alignment**: HTML generation works with new paths

### Non-Functional

- **Zero Downtime**: Migration must not break existing deployments
- **Backward Compatibility**: APIs and functionality unchanged
- **Performance**: No degradation in load times or responsiveness
- **Developer Experience**: Improved navigation and organization

## Current State

```
/ (39+ items)
├── server.js                  # Core application server
├── *.html                     # Application pages
├── styles/                    # CSS assets
├── scripts/                   # JavaScript assets
├── data/                      # SQLite database
├── uploads/                   # File storage
├── docs-source/              # Documentation
├── docs-html/                # Generated docs
├── .eslintrc.js              # Development configs
├── .codacyrc                 # Quality configs
├── docker-compose.yml        # Container config
├── package.json              # Dependencies
├── node_modules/             # Installed packages
└── [25+ other dev files]     # Various configs/tools
```

## Target State

```
/ (Clean root - <10 items)
├── app/
│   └── public/               # Core application
│       ├── server.js         # Moved from root
│       ├── *.html           # Moved from root  
│       ├── styles/          # Moved from root
│       ├── scripts/         # Moved from root
│       ├── data/            # Moved from root
│       └── uploads/         # Moved from root
├── docs-source/             # Keep in root (dev docs)
├── docs-html/               # Keep in root (generated)
├── docker-compose.yml       # Keep in root (container)
├── package.json            # Keep in root (dependencies)
├── README.md               # Keep in root (project info)
├── .gitignore              # Keep in root (git config)
└── [2-3 essential configs]  # Minimal necessary files
```

## Implementation Steps

### Phase 1: Directory Creation and Migration

1. **Create Structure**:
   ```bash
   mkdir -p app/public
   ```

2. **Move Core Application Files**:
   ```bash
   # Move server and HTML files
   mv server.js app/public/
   mv *.html app/public/
   
   # Move asset directories
   mv styles app/public/
   mv scripts app/public/
   mv data app/public/
   mv uploads app/public/
   ```

3. **Update Docker Configuration**:
   - Update `docker-compose.yml` volume mounts to `/app/public`
   - Update working directory to `/app/public`
   - Update port bindings and health checks

### Phase 2: Path Reference Updates

4. **Update HTML Asset References**:
   - All `<link>` tags with relative paths remain the same
   - All `<script>` tags with relative paths remain the same
   - Verify all asset loading works correctly

5. **Update Server.js Static Serving**:
   ```javascript
   // Update static file serving paths
   app.use('/styles', express.static(path.join(__dirname, 'styles')));
   app.use('/scripts', express.static(path.join(__dirname, 'scripts')));
   app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
   ```

6. **Update Documentation Generation**:
   - Update `html-content-updater.js` paths
   - Ensure documentation portal links work correctly

### Phase 3: Testing and Validation

7. **Docker Testing**:
   ```bash
   docker-compose up -d
   docker-compose logs -f
   ```

8. **Functionality Validation**:
   - Load all HTML pages successfully
   - Verify all assets load (CSS, JS, images)
   - Test all API endpoints
   - Validate file uploads work
   - Confirm database connectivity

9. **Path Verification**:
   - Check all relative paths resolve correctly
   - Verify no broken links or 404 errors
   - Test documentation portal functionality

## Dependencies

- **Docker Configuration**: Must update volume mounts and working directory
- **HTML Files**: 20+ files need path verification (should work without changes)
- **Asset Loading**: CSS/JS relative paths should remain functional
- **Database Access**: SQLite file location updates
- **File Uploads**: Upload directory relocation

## Testing Strategy

### Manual Testing

1. **Docker Container Startup**: Verify clean startup with no conflicts
2. **Page Loading**: Load each HTML page and verify all assets
3. **API Functionality**: Test all endpoints via Postman/browser
4. **File Operations**: Test CSV upload and processing
5. **Documentation**: Verify docs portal generation works

### Automated Testing

1. **Playwright Tests**: Run full UI test suite after migration
2. **API Tests**: Validate all endpoints return correct responses
3. **Performance Tests**: Ensure no degradation in load times

## Git Submodule Strategy

### Future Enhancement (Post-Migration)

```
HexTrackr-Dev/ (Private repository)
├── app/
│   └── HexTrackr/ (Public submodule)
│       └── public/ (Application code)
├── dev-tools/
├── configs/
└── documentation/
```

**Benefits**:
- **Clean Public Repo**: Only application code visible publicly
- **Dev File Backup**: All development tools safely versioned
- **Single Development Location**: Work in one place, push to both repos
- **Professional Appearance**: Public repo shows clean, focused application

## Risk Mitigation

### Potential Issues

1. **Path Breaking**: Relative paths might break during migration
   - **Mitigation**: Test all pages thoroughly after each change

2. **Docker Conflicts**: Container might not start with new paths
   - **Mitigation**: Update docker-compose.yml first, test incrementally

3. **Database Access**: SQLite file might not be found
   - **Mitigation**: Update all database connection paths in server.js

4. **Asset Loading**: CSS/JS files might fail to load
   - **Mitigation**: Verify all static file serving paths are correct

## Rollback Plan

If migration fails:

1. **Revert File Moves**:
   ```bash
   mv app/public/* .
   rmdir app/public app
   ```

2. **Restore Docker Config**: Revert docker-compose.yml changes

3. **Clear Container State**: 
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Post-Migration Benefits

- **Cleaner Development**: Easier to find application vs. development files
- **Docker Isolation**: Prevents accidental Node.js startup conflicts
- **Future Git Strategy**: Enables clean public/private repository separation
- **Better Organization**: Logical separation of concerns
- **Reduced Root Clutter**: From 39+ items to <10 essential files

## Future Enhancements

After successful migration:

1. **Git Submodule Implementation**: Set up nested repository strategy
2. **CI/CD Pipeline**: Automated deployment from clean structure
3. **Development Scripts**: Helper scripts for common development tasks
4. **Asset Optimization**: Potential for better asset bundling and optimization