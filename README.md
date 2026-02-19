# bleuel-it - GitHub Profile Webpage

A clean, modern webpage that displays your GitHub profile and repositories, mimicking GitHub's design with light/dark theme support.

## Features

- ✨ **GitHub Profile Display** - Shows your avatar, bio, and profile information
- 📝 **Profile README** - Displays your profile README (from `username/username` repo) with full markdown support
- 📚 **Repository Listing** - Dynamically fetches and displays all your public repositories
- 🎨 **Light/Dark Theme** - Toggle between light and dark modes with theme persistence
- 📊 **GitHub Stats** - Displays total repositories, stars, and followers
- 🔍 **Repository Sorting** - Sort repositories by recent updates, name, or stars
- 📱 **Responsive Design** - Works beautifully on desktop and mobile devices
- 🚀 **Live Data** - Fetches real data from the GitHub API
- 🔑 **GitHub Token Support** - Optional authentication for higher rate limits (5,000 vs 60 requests/hour)
- 💾 **Data Caching** - 30-minute local cache to reduce API calls and improve performance

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No additional dependencies or installations required!

### Installation

1. Clone this repository:
```bash
git clone https://github.com/chr1syy/bleuel-it.git
cd bleuel-it
```

2. Open `index.html` in your web browser:
```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

Or simply double-click `index.html` to open it.

## Usage

- **Set GitHub Token** (Optional): Enter your GitHub Personal Access Token in the input field at the top for higher rate limits (5,000 requests/hour vs 60)
- **Toggle Theme**: Click the moon/sun icon in the top-right corner to switch between light and dark modes
- **Sort Repositories**: Use the dropdown menu to sort repositories by:
  - Recently updated (default)
  - Name (alphabetical)
  - Most stars
- **View Repository**: Click any repository card to open it on GitHub

## Customization

To customize this webpage for a different GitHub user, edit `script.js` and change the `GITHUB_USERNAME` variable:

```javascript
const GITHUB_USERNAME = 'your-username';
```

You can also customize:
- **Profile Information**: Edit the HTML in `index.html` to change the profile section
- **Styling**: Modify `styles.css` to change colors, fonts, and layout
- **Language Colors**: Add or modify language color mappings in the `getLanguageColor()` function in `script.js`

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables for theming
- **JavaScript (Vanilla)** - No frameworks or libraries
- **GitHub API** - Real-time data fetching

## API Information

This webpage uses the GitHub REST API v3 to fetch:
- User profile data from `/users/{username}`
- User repositories from `/users/{username}/repos`
- Profile README from `/repos/{username}/{username}/readme`

The profile README is fetched from a special repository named `{username}/{username}` (e.g., `chr1syy/chr1syy`), which GitHub uses to display a custom README on your profile page.

### Rate Limiting & Authentication

- **Unauthenticated**: 60 requests per hour per IP address
- **Authenticated**: 5,000 requests per hour per user

To avoid rate limits, you can:
1. **Add a GitHub Token**: Enter your Personal Access Token in the input field at the top of the page
2. **Data Caching**: The page caches data for 30 minutes to reduce API calls

### Creating a GitHub Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name like "bleuel-it-webpage"
4. Select the `public_repo` scope (read-only access to public repositories)
5. Copy the token and paste it into the input field on the webpage

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the MIT License.

## Built With

Built with ❤️ using vanilla HTML, CSS, and JavaScript.

## Author

Made by [chr1syy](https://github.com/chr1syy)

---

**Questions or suggestions?** Feel free to open an issue or reach out on GitHub!
