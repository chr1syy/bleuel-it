// Theme Management
const THEME_KEY = 'theme-preference';
const GITHUB_USERNAME = 'chr1syy';

// Initialize theme
function initTheme() {
    const preferredTheme = localStorage.getItem(THEME_KEY) || 'light';
    document.documentElement.setAttribute('data-theme', preferredTheme);
    updateThemeButton(preferredTheme);
}

function updateThemeButton(theme) {
    const btn = document.getElementById('themeBtn');
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    updateThemeButton(newTheme);
}

// GitHub API functions
async function fetchUserData() {
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
        if (!response.ok) throw new Error('Failed to fetch user data');
        return await response.json();
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

async function fetchRepositories() {
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`);
        if (!response.ok) throw new Error('Failed to fetch repositories');
        return await response.json();
    } catch (error) {
        console.error('Error fetching repositories:', error);
        return [];
    }
}

// Fetch profile README
async function fetchProfileReadme() {
    try {
        // First get the README metadata
        const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_USERNAME}/readme`);
        if (!response.ok) throw new Error('Failed to fetch README');
        const data = await response.json();
        
        // Use the raw download URL for proper UTF-8 content
        const rawResponse = await fetch(data.download_url);
        if (!rawResponse.ok) throw new Error('Failed to fetch raw README content');
        
        const content = await rawResponse.text();
        return content;
    } catch (error) {
        console.error('Error fetching README:', error);
        return null;
    }
}

// Simple markdown to HTML converter using marked.js
function markdownToHtml(markdown) {
    if (typeof marked === 'undefined') {
        // Fallback if marked.js isn't loaded yet
        return `<p>${markdown.replace(/\n/g, '<br>')}</p>`;
    }
    
    try {
        // Configure marked options
        marked.setOptions({
            breaks: true,
            gfm: true,
        });
        
        // Parse markdown to HTML
        let html = marked.parse(markdown);
        
        // Note: DOMPurify can strip emojis, so we skip it
        // marked.js produces safe output by default
        return html;
    } catch (error) {
        console.error('Error parsing markdown:', error);
        return `<p>${markdown.replace(/\n/g, '<br>')}</p>`;
    }
}

// Render README
function renderReadme(content) {
    const readmeContent = document.getElementById('readmeContent');
    if (!content) {
        readmeContent.innerHTML = '<p>No README found for profile.</p>';
        return;
    }

    const html = markdownToHtml(content);
    readmeContent.innerHTML = html;
}

// Get language color
function getLanguageColor(language) {
    const colors = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#2b7489',
        'Python': '#3572a5',
        'Java': '#b07219',
        'C': '#555555',
        'CSS': '#563d7c',
        'HTML': '#e34c26',
        'Go': '#00add8',
        'Rust': '#ce422b',
        'Ruby': '#cc342d',
        'PHP': '#777bb4',
        'Swift': '#fa7343',
        'Kotlin': '#7f52ff',
        'Dart': '#00b4ab',
        'Shell': '#89e051',
        'Dockerfile': '#384d54',
        'JSON': '#292929',
    };
    return colors[language] || '#858585';
}

// Create repository card HTML
function createRepoCard(repo) {
    const stars = repo.stargazers_count || 0;
    const language = repo.language || 'Unknown';
    const description = repo.description || 'No description provided';

    return `
        <a href="${repo.html_url}" target="_blank" class="repo-card">
            <div class="repo-name">${repo.name}</div>
            <div class="repo-description">${description}</div>
            <div class="repo-footer">
                <div class="repo-lang">
                    <span class="repo-lang-dot" style="background-color: ${getLanguageColor(language)}"></span>
                    <span>${language}</span>
                </div>
                <div class="repo-stars">
                    <span>⭐</span>
                    <span>${stars}</span>
                </div>
            </div>
        </a>
    `;
}

// Render repositories
function renderRepositories(repos, sortBy = 'updated') {
    const reposList = document.getElementById('reposList');

    if (!repos || repos.length === 0) {
        reposList.innerHTML = '<div class="loading">No repositories found</div>';
        return;
    }

    // Filter out forks if needed, sort by preference
    let filtered = repos.filter(repo => !repo.fork);

    if (sortBy === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'stars') {
        filtered.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
    }
    // 'updated' is default from API

    reposList.innerHTML = filtered.map(createRepoCard).join('');
}

// Update stats
function updateStats(userData, repos) {
    const totalRepos = userData.public_repos || 0;
    const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const totalFollowers = userData.followers || 0;

    document.getElementById('totalRepos').textContent = totalRepos;
    document.getElementById('totalStars').textContent = totalStars;
    document.getElementById('totalFollowers').textContent = totalFollowers;
}

// Sort handler
async function setupSortHandler(repos) {
    const sortSelect = document.getElementById('sortSelect');
    sortSelect.addEventListener('change', (e) => {
        renderRepositories(repos, e.target.value);
    });
}

// Initialize app
async function init() {
    initTheme();

    // Theme toggle button
    document.getElementById('themeBtn').addEventListener('click', toggleTheme);

    // Fetch data
    const [userData, repos, readme] = await Promise.all([
        fetchUserData(),
        fetchRepositories(),
        fetchProfileReadme(),
    ]);

    // Render README
    if (readme) {
        renderReadme(readme);
    }

    if (userData && repos.length > 0) {
        renderRepositories(repos, 'updated');
        updateStats(userData, repos);
        setupSortHandler(repos);
    } else {
        document.getElementById('reposList').innerHTML = '<div class="loading">Failed to load repositories</div>';
    }
}

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', init);
