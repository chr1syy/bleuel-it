const THEME_KEY = 'theme-preference';
const GITHUB_USERNAME = 'chr1syy';
const CACHE_KEY = 'github-data-cache-v3';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes
const GITHUB_TOKEN = '{{GITHUB_TOKEN}}';

// Cache management
function getCachedData() {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const data = JSON.parse(cached);
        const now = Date.now();

        if (now - data.timestamp > CACHE_DURATION) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error reading cache:', error);
        return null;
    }
}

function setCachedData(data) {
    try {
        const cacheData = {
            ...data,
            timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.error('Error writing cache:', error);
    }
}

// GitHub API with authentication support
function createHeaders() {
    const headers = {
        'Accept': 'application/vnd.github.v3+json'
    };

    if (GITHUB_TOKEN && GITHUB_TOKEN !== '{{GITHUB_TOKEN}}') {
        headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    return headers;
}

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
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
            headers: createHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch user data');
        return await response.json();
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

async function fetchRepositories() {
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`, {
            headers: createHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch repositories');
        return await response.json();
    } catch (error) {
        console.error('Error fetching repositories:', error);
        return [];
    }
}

// Fetch profile README as pre-rendered HTML via GitHub Markdown API
async function fetchProfileReadme() {
    try {
        // Get raw markdown content
        const readmeResponse = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_USERNAME}/readme`, {
            headers: createHeaders()
        });
        if (!readmeResponse.ok) throw new Error('Failed to fetch README metadata');
        const readmeData = await readmeResponse.json();

        const rawResponse = await fetch(readmeData.download_url);
        if (!rawResponse.ok) throw new Error('Failed to fetch raw README');
        const markdown = await rawResponse.text();

        // Use GitHub's own Markdown rendering API — handles emojis, GFM, everything
        const renderHeaders = createHeaders();
        renderHeaders['Content-Type'] = 'application/json';

        const renderResponse = await fetch('https://api.github.com/markdown', {
            method: 'POST',
            headers: renderHeaders,
            body: JSON.stringify({
                text: markdown,
                mode: 'gfm',
                context: `${GITHUB_USERNAME}/${GITHUB_USERNAME}`
            })
        });
        if (!renderResponse.ok) throw new Error('Failed to render markdown');

        return await renderResponse.text();
    } catch (error) {
        console.error('Error fetching README:', error);
        return null;
    }
}

// Render README — content is already HTML from GitHub's API
function renderReadme(html) {
    const readmeContent = document.getElementById('readmeContent');
    if (!html) {
        readmeContent.innerHTML = '<p>No README found for profile.</p>';
        return;
    }
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

    let filtered = repos.filter(repo => !repo.fork);

    if (sortBy === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'stars') {
        filtered.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
    }

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
    document.getElementById('themeBtn').addEventListener('click', toggleTheme);

    const cachedData = getCachedData();
    if (cachedData) {
        renderFromData(cachedData);
        return;
    }

    const [userData, repos, readme] = await Promise.all([
        fetchUserData(),
        fetchRepositories(),
        fetchProfileReadme(),
    ]);

    const freshData = { userData, repos, readme };

    if (userData && repos.length > 0) {
        setCachedData(freshData);
    }

    renderFromData(freshData);
}

// Helper function to render data
function renderFromData(data) {
    const { userData, repos, readme } = data;

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
