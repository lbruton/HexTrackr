# GitHub Repository Setup Commands

## Step 1: Create Public Repository on GitHub

1. Go to <https://github.com/new>
2. Create repository named: `HexTrackr` (or `HexTrackr-Public` if you prefer)
3. Make it PUBLIC
4. DO NOT initialize with README, LICENSE, or .gitignore (we have them)

## Step 2: Push Public Repository

After creating the repository on GitHub, run these commands:

```bash
cd /Volumes/DATA/GitHub/HexTrackr-Public
git remote add origin https://github.com/Lonnie-Bruton/HexTrackr.git
git push -u origin main

# Tag the version
git tag v1.0.12
git push --tags
```

## Step 3: Rename Current Repository on GitHub

1. Go to <https://github.com/Lonnie-Bruton/HexTrackr/settings> (OLD repo)
2. Rename repository to: `HexTrackr-Dev`
3. Make it PRIVATE

## Step 4: Update Local Dev Repository

```bash
cd /Volumes/DATA/GitHub/HexTrackr
git remote set-url origin https://github.com/Lonnie-Bruton/HexTrackr-Dev.git

# Test the connection
git remote -v
```

## Step 5: Update Codacy

1. Go to Codacy dashboard
2. Add the new public HexTrackr repository
3. Configure for free public scanning
4. Update badge in README if needed

## Step 6: Create Sync Script

This script will sync from dev to public for releases:

```bash
cd /Volumes/DATA/GitHub/HexTrackr
./release-to-public.sh v1.0.13
```

## Verification Checklist

- [ ] Public repo created and pushed
- [ ] Dev repo renamed and made private
- [ ] Codacy connected to public repo
- [ ] GitHub Actions working on public repo
- [ ] Docker build works from public repo
- [ ] Documentation accessible at /docs-html

## Rollback (if needed)

If something goes wrong:

1. Delete the public repository
2. Rename HexTrackr-Dev back to HexTrackr
3. Make it public again
4. Restore from backup if needed
