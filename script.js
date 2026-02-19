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
        const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_USERNAME}/readme`);
        if (!response.ok) throw new Error('Failed to fetch README');
        const data = await response.json();
        // Decode base64 content with proper UTF-8 handling
        const binaryString = atob(data.content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const content = new TextDecoder('utf-8').decode(bytes);
        return content;
    } catch (error) {
        console.error('Error fetching README:', error);
        return null;
    }
}

// Simple markdown to HTML converter
function markdownToHtml(markdown) {
    let html = markdown;

    // Escape HTML special characters except for URLs
    html = html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/&amp;(#\d+|#x[0-9a-f]+|[a-z]+);/gi, '&$1;'); // Restore entities

    // Headings
    html = html.replace(/^### (.*?)$/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*?)$/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*?)$/gim, '<h1>$1</h1>');

    // Horizontal rules
    html = html.replace(/^---+$/gim, '<hr>');
    html = html.replace(/^\*\*\*+$/gim, '<hr>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Code blocks
    html = html.replace(/```(.*?)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Unordered lists
    html = html.replace(/^\* (.*?)$/gim, '<li>$1</li>');
    html = html.replace(/^\- (.*?)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\n<ul>/g, '');

    // Ordered lists
    html = html.replace(/^\d+\. (.*?)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>)/s, '<ol>$1</ol>');
    html = html.replace(/<\/ol>\n<ol>/g, '');

    // Paragraphs
    html = html.split('\n\n').map(p => {
        p = p.trim();
        if (p && !p.match(/^<[hpuol]/)) {
            return `<p>${p}</p>`;
        }
        return p;
    }).join('\n');

    // Blockquotes
    html = html.replace(/^\&gt; (.*?)$/gim, '<blockquote>$1</blockquote>');

    return html;
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
