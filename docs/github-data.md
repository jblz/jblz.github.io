# GitHub Contributions Data

This site now uses static GitHub contributions data instead of making API calls from the frontend. This improves performance and reliability while avoiding API rate limits.

## How it works

1. **Data Collection**: The `scripts/fetch-github-data.js` script fetches GitHub data from the API
2. **Static Storage**: Data is stored in `_data/github-contributions.json`
3. **Frontend Display**: The `javascripts/github-contributions.js` loads and displays the static data

## Data Sources

The script collects data from:
- User profile information (`/users/jblz`)  
- Repository statistics (`/users/jblz/repos`)
- Recent activity events (`/users/jblz/events/public`)
- **OSS Contributions**: Merged pull requests authored by jblz (`/search/issues?q=is:pr+is:merged+author:jblz`)

## Updating the Data

### Manual Update

Run the update script:
```bash
./update-github-data.sh
```

Or run the Node.js script directly:
```bash
node scripts/fetch-github-data.js
```

### Automated Updates

You can set up automated updates using:

1. **GitHub Actions** (recommended for GitHub Pages):
   ```yaml
   # .github/workflows/update-data.yml
   name: Update GitHub Data
   on:
     schedule:
       - cron: '0 0 * * 0'  # Weekly on Sunday
   jobs:
     update-data:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Update GitHub data
           run: node scripts/fetch-github-data.js
         - name: Commit changes
           run: |
             git config --local user.email "action@github.com"
             git config --local user.name "GitHub Action"
             git add _data/github-contributions.json
             git commit -m "Update GitHub contributions data" || exit 0
             git push
   ```

2. **Cron job** (for other hosting):
   ```bash
   # Run weekly on Sunday at midnight
   0 0 * * 0 cd /path/to/repo && ./update-github-data.sh
   ```

## Data Structure

The JSON file contains:
- `user`: Profile information (name, bio, stats)
- `repositories`: Repository data with language statistics
- `oss_contributions`: Merged pull requests to other repositories  
- `recent_activity`: Recent GitHub activity
- `stats`: Summary statistics

## Benefits

- ✅ **No API rate limits** during page views
- ✅ **Faster page loads** (no API calls)
- ✅ **Works offline** (static data included)
- ✅ **OSS contributions highlighted** (merged PRs in other repos)
- ✅ **Cacheable** (static JSON file)

## Fallback

If the static data file can't be loaded, the frontend falls back to sample data to ensure the page still displays properly.