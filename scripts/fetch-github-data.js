#!/usr/bin/env node

/**
 * GitHub Data Fetcher
 * Fetches GitHub contributions data and saves it to a JSON file for static site generation
 * 
 * Usage: node scripts/fetch-github-data.js
 * 
 * This script fetches:
 * - User profile information
 * - Repository list and statistics  
 * - Merged pull requests (OSS contributions)
 * - Recent activity events
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const USERNAME = 'jblz';
const OUTPUT_FILE = path.join(__dirname, '..', '_data', 'github-contributions.json');
const GITHUB_API_BASE = 'https://api.github.com';

// GitHub API helper
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const headers = {
            'User-Agent': 'jblz.github.io-data-fetcher',
            'Accept': 'application/vnd.github.v3+json',
            ...options.headers
        };

        console.log(`Fetching: ${url}`);
        
        const req = https.get(url, { headers }, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const json = JSON.parse(data);
                        console.log(`✓ Success: ${url} (${res.statusCode})`);
                        resolve(json);
                    } catch (error) {
                        console.error(`✗ JSON parse error for ${url}:`, error.message);
                        reject(error);
                    }
                } else {
                    console.error(`✗ HTTP error ${res.statusCode} for ${url}:`, data);
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });
        
        req.on('error', (error) => {
            console.error(`✗ Request error for ${url}:`, error.message);
            reject(error);
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error(`Request timeout for ${url}`));
        });
    });
}

// Fetch user profile information
async function fetchUserInfo() {
    const url = `${GITHUB_API_BASE}/users/${USERNAME}`;
    return await makeRequest(url);
}

// Fetch user's repositories
async function fetchRepositories() {
    const url = `${GITHUB_API_BASE}/users/${USERNAME}/repos?sort=updated&per_page=100&type=all`;
    return await makeRequest(url);
}

// Fetch recent user events
async function fetchEvents() {
    const url = `${GITHUB_API_BASE}/users/${USERNAME}/events/public?per_page=30`;
    return await makeRequest(url);
}

// Fetch merged pull requests by the user
async function fetchMergedPullRequests() {
    const url = `${GITHUB_API_BASE}/search/issues?q=is:pr+is:merged+author:${USERNAME}&sort=updated&order=desc&per_page=100`;
    const result = await makeRequest(url);
    return result.items || [];
}

// Process and clean data for frontend consumption
function processData(userInfo, repositories, events, pullRequests) {
    // Filter out forks and sort repositories by activity score
    const originalRepos = repositories
        .filter(repo => !repo.fork)
        .map(repo => ({
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            html_url: repo.html_url,
            stargazers_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            language: repo.language,
            topics: repo.topics || [],
            created_at: repo.created_at,
            updated_at: repo.updated_at,
            activity_score: repo.stargazers_count + repo.forks_count
        }))
        .sort((a, b) => b.activity_score - a.activity_score);

    // Process language statistics
    const languageStats = {};
    originalRepos.forEach(repo => {
        if (repo.language) {
            languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
        }
    });

    // Process OSS contributions (merged PRs in other repositories)
    const ossContributions = pullRequests
        .filter(pr => !pr.repository_url.includes(`/${USERNAME}/`)) // Exclude own repos
        .map(pr => ({
            title: pr.title,
            html_url: pr.html_url,
            state: pr.state,
            created_at: pr.created_at,
            updated_at: pr.updated_at,
            closed_at: pr.closed_at,
            merged_at: pr.pull_request?.merged_at,
            repository: {
                name: pr.repository_url.split('/').slice(-2).join('/'),
                url: pr.repository_url.replace('api.github.com/repos', 'github.com')
            },
            body: pr.body,
            comments: pr.comments
        }))
        .slice(0, 50); // Limit to most recent 50

    // Process recent activity
    const recentActivity = events.slice(0, 10).map(event => ({
        type: event.type,
        repo: {
            name: event.repo.name,
            url: `https://github.com/${event.repo.name}`
        },
        created_at: event.created_at,
        payload: event.payload
    }));

    return {
        generated_at: new Date().toISOString(),
        user: {
            login: userInfo.login,
            name: userInfo.name,
            bio: userInfo.bio,
            blog: userInfo.blog,
            location: userInfo.location,
            email: userInfo.email,
            avatar_url: userInfo.avatar_url,
            html_url: userInfo.html_url,
            public_repos: userInfo.public_repos,
            public_gists: userInfo.public_gists,
            followers: userInfo.followers,
            following: userInfo.following,
            created_at: userInfo.created_at,
            updated_at: userInfo.updated_at
        },
        repositories: {
            total_count: originalRepos.length,
            top_repositories: originalRepos.slice(0, 6),
            all_repositories: originalRepos,
            language_stats: languageStats
        },
        oss_contributions: {
            total_count: ossContributions.length,
            contributions: ossContributions
        },
        recent_activity: recentActivity,
        stats: {
            total_stars: originalRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
            total_forks: originalRepos.reduce((sum, repo) => sum + repo.forks_count, 0),
            languages_used: Object.keys(languageStats).length,
            oss_contributions_count: ossContributions.length
        }
    };
}

// Main execution function
async function main() {
    try {
        console.log('🚀 Starting GitHub data collection...\n');

        // Ensure output directory exists
        const outputDir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
            console.log(`📁 Created directory: ${outputDir}`);
        }

        // Fetch all data in parallel
        console.log('📡 Fetching data from GitHub API...');
        const [userInfo, repositories, events, pullRequests] = await Promise.all([
            fetchUserInfo(),
            fetchRepositories(), 
            fetchEvents(),
            fetchMergedPullRequests()
        ]);

        console.log('\n📊 Data fetched successfully:');
        console.log(`  - User: ${userInfo.name} (@${userInfo.login})`);
        console.log(`  - Repositories: ${repositories.length}`);
        console.log(`  - Events: ${events.length}`);
        console.log(`  - Merged PRs: ${pullRequests.length}`);

        // Process and structure the data
        console.log('\n🔄 Processing data...');
        const processedData = processData(userInfo, repositories, events, pullRequests);

        // Save to JSON file
        console.log(`💾 Saving data to: ${OUTPUT_FILE}`);
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(processedData, null, 2));

        console.log('\n✅ GitHub data collection completed successfully!');
        console.log('\n📈 Summary:');
        console.log(`  - Original repositories: ${processedData.repositories.total_count}`);
        console.log(`  - OSS contributions: ${processedData.oss_contributions.total_count}`);
        console.log(`  - Total stars earned: ${processedData.stats.total_stars}`);
        console.log(`  - Languages used: ${processedData.stats.languages_used}`);
        console.log(`  - Data saved to: ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('\n❌ Error fetching GitHub data:', error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { main, fetchUserInfo, fetchRepositories, fetchEvents, fetchMergedPullRequests };