/**
 * GitHub Contributions Display Module
 * Displays GitHub user contributions, repositories, and stats using pre-fetched static data
 */

class GitHubContributions {
    constructor(username) {
        this.username = username;
        this.dataUrl = 'data/github-contributions.json';
        this.data = null;
    }

    async loadStaticData() {
        if (this.data) {
            return this.data;
        }

        try {
            const response = await fetch(this.dataUrl);
            if (!response.ok) {
                throw new Error(`Failed to load GitHub data: ${response.status}`);
            }
            this.data = await response.json();
            console.log('GitHub contributions data loaded successfully');
            return this.data;
        } catch (error) {
            console.error('Error loading GitHub data:', error);
            
            // Fallback to sample data for development
            if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
                return this.getSampleData();
            }
            
            throw error;
        }
    }

    getSampleData() {
        // Fallback data for development - mirrors the structure of the static JSON
        return {
            generated_at: new Date().toISOString(),
            user: {
                login: 'jblz',
                name: 'Jeff Bowen', 
                public_repos: 25,
                followers: 42,
                following: 35,
                bio: 'Software Developer & Open Source Contributor',
                location: 'Earth',
                blog: 'https://jeff.blog'
            },
            repositories: {
                total_count: 6,
                top_repositories: [
                    {
                        name: 'awesome-project',
                        description: 'An amazing open source project that does cool things',
                        html_url: 'https://github.com/jblz/awesome-project',
                        stargazers_count: 128,
                        forks_count: 23,
                        language: 'JavaScript'
                    },
                    {
                        name: 'react-components',
                        description: 'Reusable React components library',
                        html_url: 'https://github.com/jblz/react-components',
                        stargazers_count: 89,
                        forks_count: 15,
                        language: 'TypeScript'
                    },
                    {
                        name: 'python-utilities',
                        description: 'Collection of useful Python utility functions',
                        html_url: 'https://github.com/jblz/python-utilities',
                        stargazers_count: 64,
                        forks_count: 12,
                        language: 'Python'
                    },
                    {
                        name: 'css-framework',
                        description: 'Lightweight CSS framework for modern web apps',
                        html_url: 'https://github.com/jblz/css-framework',
                        stargazers_count: 45,
                        forks_count: 8,
                        language: 'CSS'
                    },
                    {
                        name: 'node-api',
                        description: 'RESTful API built with Node.js and Express',
                        html_url: 'https://github.com/jblz/node-api',
                        stargazers_count: 37,
                        forks_count: 6,
                        language: 'JavaScript'
                    },
                    {
                        name: 'go-microservice',
                        description: 'Microservice architecture example in Go',
                        html_url: 'https://github.com/jblz/go-microservice',
                        stargazers_count: 28,
                        forks_count: 4,
                        language: 'Go'
                    }
                ],
                language_stats: {
                    'JavaScript': 2,
                    'TypeScript': 1,
                    'Python': 1,
                    'CSS': 1,
                    'Go': 1
                }
            },
            oss_contributions: {
                total_count: 10,
                contributions: []
            },
            recent_activity: [
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
                }
            ],
            stats: {
                total_stars: 391,
                total_forks: 68,
                languages_used: 6,
                oss_contributions_count: 10
            }
        };
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

    renderTopRepositories(repositoriesData) {
        const topRepos = repositoriesData.top_repositories;

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

    renderLanguageStats(repositoriesData) {
        const languages = repositoriesData.language_stats;
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

    renderOSSContributions(ossData) {
        if (!ossData.contributions || ossData.contributions.length === 0) {
            return '';
        }

        const recentContributions = ossData.contributions.slice(0, 5);
        
        return `
            <div class="oss-contributions">
                <h3>Recent OSS Contributions (${ossData.total_count} total)</h3>
                <div class="contributions-list">
                    ${recentContributions.map(contribution => {
                        const date = new Date(contribution.merged_at || contribution.closed_at).toLocaleDateString();
                        return `
                            <div class="contribution-item">
                                <div class="contribution-title">
                                    <a href="${contribution.html_url}" target="_blank" rel="noopener">${contribution.title}</a>
                                </div>
                                <div class="contribution-meta">
                                    <span class="contribution-repo">${contribution.repository.name}</span>
                                    <span class="contribution-date">${date}</span>
                                </div>
                                ${contribution.body ? `<div class="contribution-body">${contribution.body.substring(0, 100)}${contribution.body.length > 100 ? '...' : ''}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    renderRecentActivity(activityData) {
        const recentEvents = activityData.slice(0, 5);
        
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
                                action = `Created ${event.payload?.ref_type || 'branch'} in ${event.repo.name}`;
                                break;
                            case 'IssuesEvent':
                                action = `${event.payload?.action || 'updated'} issue in ${event.repo.name}`;
                                break;
                            case 'PullRequestEvent':
                                action = `${event.payload?.action || 'updated'} pull request in ${event.repo.name}`;
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
                        <p>Using sample data for demonstration in development environment.</p>
                        <p>Static GitHub data will be displayed when deployed to GitHub Pages.</p>
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
            const data = await this.loadStaticData();

            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error(`Container with id '${containerId}' not found`);
            }

            const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
            const isUsingStaticData = !!this.data;
            
            let notice = '';
            if (isLocalhost && !isUsingStaticData) {
                notice = `
                    <div class="dev-notice">
                        <h3>🚧 Development Mode</h3>
                        <p>Using sample data for demonstration. Static GitHub data will be displayed when deployed to GitHub Pages.</p>
                    </div>
                `;
            } else if (isUsingStaticData) {
                notice = `
                    <div class="static-data-notice">
                        <p><em>GitHub contributions data last updated: ${new Date(data.generated_at).toLocaleDateString()}</em></p>
                    </div>
                `;
            }

            container.innerHTML = `
                <div class="github-contributions">
                    <div class="contributions-header">
                        <h2>GitHub Contributions</h2>
                        <p>Showcasing open source contributions and personal projects</p>
                    </div>
                    
                    ${notice}
                    
                    ${this.renderUserStats(data.user)}
                    
                    <div class="contributions-content">
                        <div class="left-column">
                            ${this.renderTopRepositories(data.repositories)}
                            ${this.renderLanguageStats(data.repositories)}
                        </div>
                        <div class="right-column">
                            ${this.renderOSSContributions(data.oss_contributions)}
                            ${this.renderRecentActivity(data.recent_activity)}
                        </div>
                    </div>
                    
                    <div class="github-summary">
                        <p><strong>Summary:</strong> ${data.stats.total_stars} stars earned • ${data.stats.oss_contributions_count} OSS contributions • ${data.stats.languages_used} languages used</p>
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