/**
 * GitHub Contributions Display Module
 * Fetches and displays GitHub user contributions, repositories, and stats
 */

class GitHubContributions {
    constructor(username) {
        this.username = username;
        this.apiUrl = 'https://api.github.com';
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    async fetchFromCache(key, fetchFunction) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        try {
            const data = await fetchFunction();
            this.cache.set(key, { data, timestamp: Date.now() });
            return data;
        } catch (error) {
            console.error(`Error fetching ${key}:`, error);
            
            // If we're on localhost or there's a CORS error, return sample data
            if (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || error.message.includes('fetch')) {
                return this.getSampleData(key);
            }
            
            throw error;
        }
    }

    getSampleData(type) {
        const sampleData = {
            userInfo: {
                login: 'jblz',
                name: 'Jeff Bowen', 
                public_repos: 25,
                followers: 42,
                following: 35,
                bio: 'Software Developer & Open Source Contributor',
                location: 'Earth',
                blog: 'https://jeff.blog'
            },
            repositories: [
                {
                    name: 'awesome-project',
                    description: 'An amazing open source project that does cool things',
                    html_url: 'https://github.com/jblz/awesome-project',
                    stargazers_count: 128,
                    forks_count: 23,
                    language: 'JavaScript',
                    fork: false
                },
                {
                    name: 'react-components',
                    description: 'Reusable React components library',
                    html_url: 'https://github.com/jblz/react-components',
                    stargazers_count: 89,
                    forks_count: 15,
                    language: 'TypeScript',
                    fork: false
                },
                {
                    name: 'python-utilities',
                    description: 'Collection of useful Python utility functions',
                    html_url: 'https://github.com/jblz/python-utilities',
                    stargazers_count: 64,
                    forks_count: 12,
                    language: 'Python',
                    fork: false
                },
                {
                    name: 'css-framework',
                    description: 'Lightweight CSS framework for modern web apps',
                    html_url: 'https://github.com/jblz/css-framework',
                    stargazers_count: 45,
                    forks_count: 8,
                    language: 'CSS',
                    fork: false
                },
                {
                    name: 'node-api',
                    description: 'RESTful API built with Node.js and Express',
                    html_url: 'https://github.com/jblz/node-api',
                    stargazers_count: 37,
                    forks_count: 6,
                    language: 'JavaScript',
                    fork: false
                },
                {
                    name: 'go-microservice',
                    description: 'Microservice architecture example in Go',
                    html_url: 'https://github.com/jblz/go-microservice',
                    stargazers_count: 28,
                    forks_count: 4,
                    language: 'Go',
                    fork: false
                }
            ],
            events: [
                {
                    type: 'PushEvent',
                    repo: { name: 'jblz/awesome-project' },
                    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    type: 'CreateEvent',
                    repo: { name: 'jblz/new-feature' },
                    payload: { ref_type: 'branch' },
                    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    type: 'IssuesEvent',
                    repo: { name: 'jblz/react-components' },
                    payload: { action: 'closed' },
                    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    type: 'PullRequestEvent',
                    repo: { name: 'jblz/python-utilities' },
                    payload: { action: 'opened' },
                    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    type: 'WatchEvent',
                    repo: { name: 'jblz/css-framework' },
                    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
        };

        return sampleData[type] || {};
    }

    async fetchUserInfo() {
        return this.fetchFromCache('userInfo', async () => {
            const response = await fetch(`${this.apiUrl}/users/${this.username}`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'jblz.github.io'
                }
            });
            if (!response.ok) throw new Error(`Failed to fetch user info: ${response.status}`);
            return response.json();
        });
    }

    async fetchRepositories() {
        return this.fetchFromCache('repositories', async () => {
            const response = await fetch(`${this.apiUrl}/users/${this.username}/repos?sort=updated&per_page=100`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'jblz.github.io'
                }
            });
            if (!response.ok) throw new Error(`Failed to fetch repositories: ${response.status}`);
            return response.json();
        });
    }

    async fetchEvents() {
        return this.fetchFromCache('events', async () => {
            const response = await fetch(`${this.apiUrl}/users/${this.username}/events/public?per_page=30`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'jblz.github.io'
                }
            });
            if (!response.ok) throw new Error(`Failed to fetch events: ${response.status}`);
            return response.json();
        });
    }

    renderUserStats(user) {
        return `
            <div class="github-stats">
                <div class="stat-item">
                    <span class="stat-number">${user.public_repos}</span>
                    <span class="stat-label">Repositories</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${user.followers}</span>
                    <span class="stat-label">Followers</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${user.following}</span>
                    <span class="stat-label">Following</span>
                </div>
            </div>
        `;
    }

    renderTopRepositories(repos) {
        const topRepos = repos
            .filter(repo => !repo.fork)
            .sort((a, b) => (b.stargazers_count + b.forks_count) - (a.stargazers_count + a.forks_count))
            .slice(0, 6);

        return `
            <div class="top-repositories">
                <h3>Top Repositories</h3>
                <div class="repos-grid">
                    ${topRepos.map(repo => `
                        <div class="repo-card">
                            <h4><a href="${repo.html_url}" target="_blank">${repo.name}</a></h4>
                            <p class="repo-description">${repo.description || 'No description'}</p>
                            <div class="repo-stats">
                                <span class="repo-stat">
                                    <span class="star">⭐</span> ${repo.stargazers_count}
                                </span>
                                <span class="repo-stat">
                                    <span class="fork">🍴</span> ${repo.forks_count}
                                </span>
                                ${repo.language ? `<span class="repo-language">${repo.language}</span>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderLanguageStats(repos) {
        const languages = {};
        repos.forEach(repo => {
            if (repo.language && !repo.fork) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
        });

        const sortedLanguages = Object.entries(languages)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8);

        if (sortedLanguages.length === 0) return '';

        const total = sortedLanguages.reduce((sum, [, count]) => sum + count, 0);

        return `
            <div class="language-stats">
                <h3>Programming Languages</h3>
                <div class="language-bars">
                    ${sortedLanguages.map(([language, count]) => {
                        const percentage = (count / total * 100).toFixed(1);
                        return `
                            <div class="language-bar">
                                <div class="language-info">
                                    <span class="language-name">${language}</span>
                                    <span class="language-count">${count} repos</span>
                                </div>
                                <div class="language-progress">
                                    <div class="language-fill" style="width: ${percentage}%"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    renderRecentActivity(events) {
        const recentEvents = events.slice(0, 5);
        
        return `
            <div class="recent-activity">
                <h3>Recent Activity</h3>
                <div class="activity-list">
                    ${recentEvents.map(event => {
                        const date = new Date(event.created_at).toLocaleDateString();
                        let action = '';
                        
                        switch (event.type) {
                            case 'PushEvent':
                                action = `Pushed to ${event.repo.name}`;
                                break;
                            case 'CreateEvent':
                                action = `Created ${event.payload.ref_type} in ${event.repo.name}`;
                                break;
                            case 'IssuesEvent':
                                action = `${event.payload.action} issue in ${event.repo.name}`;
                                break;
                            case 'PullRequestEvent':
                                action = `${event.payload.action} pull request in ${event.repo.name}`;
                                break;
                            case 'WatchEvent':
                                action = `Starred ${event.repo.name}`;
                                break;
                            default:
                                action = `${event.type} in ${event.repo.name}`;
                        }
                        
                        return `
                            <div class="activity-item">
                                <span class="activity-action">${action}</span>
                                <span class="activity-date">${date}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="loading">
                    <div class="loading-spinner"></div>
                    <p>Loading GitHub contributions...</p>
                </div>
            `;
        }
    }

    showError(containerId, error) {
        const container = document.getElementById(containerId);
        const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        
        if (container) {
            if (isLocalhost) {
                container.innerHTML = `
                    <div class="dev-notice">
                        <h3>🚧 Development Mode</h3>
                        <p>GitHub API calls are blocked on localhost due to CORS policy.</p>
                        <p>This will work properly when deployed to GitHub Pages.</p>
                        <p>Showing sample data for demonstration...</p>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="error">
                        <p>Failed to load GitHub data: ${error.message}</p>
                        <p>Please try again later.</p>
                    </div>
                `;
            }
        }
    }

    async render(containerId) {
        this.showLoading(containerId);

        try {
            const [user, repos, events] = await Promise.all([
                this.fetchUserInfo(),
                this.fetchRepositories(),
                this.fetchEvents()
            ]);

            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error(`Container with id '${containerId}' not found`);
            }

            const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
            const devNotice = isLocalhost ? `
                <div class="dev-notice">
                    <h3>🚧 Development Mode</h3>
                    <p>Showing sample data for demonstration. Real GitHub data will be displayed when deployed to GitHub Pages.</p>
                </div>
            ` : '';

            container.innerHTML = `
                <div class="github-contributions">
                    <div class="contributions-header">
                        <h2>GitHub Contributions</h2>
                        <p>Showcasing activity across all repositories</p>
                    </div>
                    
                    ${devNotice}
                    
                    ${this.renderUserStats(user)}
                    
                    <div class="contributions-content">
                        <div class="left-column">
                            ${this.renderTopRepositories(repos)}
                            ${this.renderLanguageStats(repos)}
                        </div>
                        <div class="right-column">
                            ${this.renderRecentActivity(events)}
                        </div>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Error rendering GitHub contributions:', error);
            this.showError(containerId, error);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const contributionsContainer = document.getElementById('github-contributions');
    if (contributionsContainer) {
        const github = new GitHubContributions('jblz');
        github.render('github-contributions');
    }
});