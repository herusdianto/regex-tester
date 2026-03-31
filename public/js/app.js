/**
 * Regex Tester - Test Your Regular Expressions
 * 100% Client-side processing
 */

class RegexTester {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('regexTesterHistory') || '[]');
        this.init();
    }

    init() {
        this.bindResultTabs();
        this.bindPatternInput();
        this.bindTestStringInput();
        this.bindFlagCheckboxes();
        this.bindClearHistory();
        this.initThemeToggle();
        this.loadHistory();
        this.setCurrentYear();
        this.loadExampleOnFirstVisit();
    }

    // ==================== Theme Toggle ====================
    initThemeToggle() {
        const themeSwitch = document.getElementById('theme-switch');
        const themeIcon = document.getElementById('theme-icon');

        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        this.updateThemeIcon(themeIcon, savedTheme);

        themeSwitch.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            const newTheme = isDark ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            this.updateThemeIcon(themeIcon, newTheme);
        });
    }

    updateThemeIcon(iconElement, theme) {
        iconElement.innerHTML = theme === 'dark'
            ? `<svg class="sun-icon" viewBox="0 0 24 24" width="28" height="28"><path d="M12 7a5 5 0 100 10 5 5 0 000-10zM2 13h2a1 1 0 100-2H2a1 1 0 100 2zm18 0h2a1 1 0 100-2h-2a1 1 0 100 2zM11 2v2a1 1 0 102 0V2a1 1 0 10-2 0zm0 18v2a1 1 0 102 0v-2a1 1 0 10-2 0zM5.99 4.58a1 1 0 10-1.41 1.41l1.06 1.06a1 1 0 101.41-1.41L5.99 4.58zm12.37 12.37a1 1 0 10-1.41 1.41l1.06 1.06a1 1 0 101.41-1.41l-1.06-1.06zm1.06-10.96a1 1 0 10-1.41-1.41l-1.06 1.06a1 1 0 101.41 1.41l1.06-1.06zM7.05 18.36a1 1 0 10-1.41-1.41l-1.06 1.06a1 1 0 101.41 1.41l1.06-1.06z"></path></svg>`
            : `<svg class="moon-icon" viewBox="0 0 24 24" width="28" height="28"><path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"></path></svg>`;
    }

    // ==================== Tab Management ====================
    bindResultTabs() {
        document.querySelectorAll('.result-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.result-tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.result-tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(`${btn.dataset.resultTab}-tab`).classList.add('active');
            });
        });
    }

    // ==================== Pattern Input ====================
    bindPatternInput() {
        const patternInput = document.getElementById('regex-pattern');
        patternInput.addEventListener('input', () => this.testRegex());
        patternInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.testRegex();
            }
        });
    }

    // ==================== Test String Input ====================
    bindTestStringInput() {
        const testStringInput = document.getElementById('test-string');
        testStringInput.addEventListener('input', () => this.testRegex());
    }

    // ==================== Flag Checkboxes ====================
    bindFlagCheckboxes() {
        document.querySelectorAll('.flag-option input').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.testRegex());
        });
    }

    // ==================== Regex Testing ====================
    testRegex() {
        const pattern = document.getElementById('regex-pattern').value;
        const testString = document.getElementById('test-string').value;
        const errorElement = document.getElementById('pattern-error');

        // Clear previous error
        errorElement.classList.add('hidden');
        errorElement.textContent = '';

        if (!pattern) {
            this.clearResults();
            return;
        }

        // Get flags
        const flags = this.getFlags();

        try {
            const regex = new RegExp(pattern, flags);
            const matches = this.findMatches(regex, testString);
            this.displayResults(matches, pattern, flags, testString);
        } catch (error) {
            errorElement.textContent = `Invalid regex: ${error.message}`;
            errorElement.classList.remove('hidden');
            this.clearResults();
        }
    }

    getFlags() {
        let flags = '';
        if (document.getElementById('flag-g').checked) flags += 'g';
        if (document.getElementById('flag-i').checked) flags += 'i';
        if (document.getElementById('flag-m').checked) flags += 'm';
        if (document.getElementById('flag-s').checked) flags += 's';
        return flags;
    }

    findMatches(regex, testString) {
        const matches = [];
        let match;

        if (regex.global) {
            while ((match = regex.exec(testString)) !== null) {
                matches.push({
                    match: match[0],
                    index: match.index,
                    groups: match.slice(1),
                    namedGroups: match.groups || {}
                });
            }
        } else {
            match = regex.exec(testString);
            if (match) {
                matches.push({
                    match: match[0],
                    index: match.index,
                    groups: match.slice(1),
                    namedGroups: match.groups || {}
                });
            }
        }

        return matches;
    }

    displayResults(matches, pattern, flags, testString) {
        // Update match count
        document.getElementById('match-count').textContent = `${matches.length} match${matches.length !== 1 ? 'es' : ''}`;

        // Display matches
        this.displayMatches(matches, testString);

        // Display groups
        this.displayGroups(matches);

        // Display details
        this.displayDetails(pattern, flags, matches, testString);

        // Save to history
        this.saveToHistory(pattern, flags, matches.length);
    }

    displayMatches(matches, testString) {
        const container = document.getElementById('matches-list');

        if (matches.length === 0) {
            container.innerHTML = '<p class="placeholder-text">No matches found.</p>';
            return;
        }

        container.innerHTML = '';

        matches.forEach((matchData, index) => {
            const item = document.createElement('div');
            item.className = 'match-item';

            // Highlight the match in context
            const start = Math.max(0, matchData.index - 20);
            const end = Math.min(testString.length, matchData.index + matchData.match.length + 20);
            const before = testString.substring(start, matchData.index);
            const matchText = matchData.match;
            const after = testString.substring(matchData.index + matchData.match.length, end);

            item.innerHTML = `
                <div class="match-header">
                    <span class="match-number">Match ${index + 1}</span>
                    <span class="match-position">Index: ${matchData.index}</span>
                    <span class="match-length">Length: ${matchData.match.length}</span>
                </div>
                <div class="match-context">
                    <span class="match-before">${this.escapeHtml(before)}</span>
                    <span class="match-highlight">${this.escapeHtml(matchText)}</span>
                    <span class="match-after">${this.escapeHtml(after)}</span>
                </div>
                <div class="match-value">
                    <code>${this.escapeHtml(matchText)}</code>
                </div>
            `;

            container.appendChild(item);
        });
    }

    displayGroups(matches) {
        const container = document.getElementById('groups-list');

        const hasGroups = matches.some(m => m.groups.length > 0 || Object.keys(m.namedGroups).length > 0);

        if (!hasGroups) {
            container.innerHTML = '<p class="placeholder-text">No captured groups found.</p>';
            return;
        }

        container.innerHTML = '';

        matches.forEach((matchData, matchIndex) => {
            if (matchData.groups.length > 0 || Object.keys(matchData.namedGroups).length > 0) {
                const groupSection = document.createElement('div');
                groupSection.className = 'group-section';

                let groupsHtml = `<h4>Match ${matchIndex + 1}</h4>`;

                // Numbered groups
                if (matchData.groups.length > 0) {
                    matchData.groups.forEach((group, groupIndex) => {
                        groupsHtml += `
                            <div class="group-item">
                                <span class="group-number">Group ${groupIndex + 1}:</span>
                                <code class="group-value">${group !== undefined ? this.escapeHtml(group) : '<i>undefined</i>'}</code>
                            </div>
                        `;
                    });
                }

                // Named groups
                if (Object.keys(matchData.namedGroups).length > 0) {
                    Object.entries(matchData.namedGroups).forEach(([name, value]) => {
                        groupsHtml += `
                            <div class="group-item">
                                <span class="group-name">${name}:</span>
                                <code class="group-value">${value !== undefined ? this.escapeHtml(value) : '<i>undefined</i>'}</code>
                            </div>
                        `;
                    });
                }

                groupSection.innerHTML = groupsHtml;
                container.appendChild(groupSection);
            }
        });

        if (container.children.length === 0) {
            container.innerHTML = '<p class="placeholder-text">No captured groups found.</p>';
        }
    }

    displayDetails(pattern, flags, matches, testString) {
        const container = document.getElementById('details-content');

        const flagDescriptions = [];
        if (flags.includes('g')) flagDescriptions.push('g - Global (find all matches)');
        if (flags.includes('i')) flagDescriptions.push('i - Case Insensitive');
        if (flags.includes('m')) flagDescriptions.push('m - Multiline (^ and $ match line boundaries)');
        if (flags.includes('s')) flagDescriptions.push('s - Dotall (. matches newlines)');

        container.innerHTML = `
            <div class="detail-item">
                <span class="detail-label">Pattern:</span>
                <code class="detail-value">/${pattern}/${flags}</code>
            </div>
            <div class="detail-item">
                <span class="detail-label">Test String Length:</span>
                <span class="detail-value">${testString.length} characters</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Total Matches:</span>
                <span class="detail-value">${matches.length}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Flags:</span>
                <span class="detail-value">${flagDescriptions.length > 0 ? flagDescriptions.join('<br>') : 'None'}</span>
            </div>
            ${matches.length > 0 ? `
            <div class="detail-item">
                <span class="detail-label">Match Positions:</span>
                <span class="detail-value">${matches.map(m => m.index).join(', ')}</span>
            </div>
            ` : ''}
        `;
    }

    clearResults() {
        document.getElementById('match-count').textContent = '0 matches';
        document.getElementById('matches-list').innerHTML = '<p class="placeholder-text">Enter a pattern and test string to see matches.</p>';
        document.getElementById('groups-list').innerHTML = '<p class="placeholder-text">No captured groups found.</p>';
        document.getElementById('details-content').innerHTML = '<p class="placeholder-text">Enter a pattern to see details.</p>';
    }

    // ==================== History Management ====================
    saveToHistory(pattern, flags, matchCount) {
        const entry = {
            id: Date.now(),
            pattern,
            flags,
            matchCount,
            timestamp: new Date().toISOString()
        };

        // Don't save duplicates
        const existingIndex = this.history.findIndex(h => h.pattern === pattern && h.flags === flags);
        if (existingIndex !== -1) {
            this.history.splice(existingIndex, 1);
        }

        this.history.unshift(entry);

        // Keep only last 50 entries
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }

        localStorage.setItem('regexTesterHistory', JSON.stringify(this.history));
        this.loadHistory();
    }

    loadHistory() {
        const container = document.getElementById('history-list');

        if (this.history.length === 0) {
            container.innerHTML = '<p class="placeholder-text">No patterns yet. Test a regex to see it here.</p>';
            return;
        }

        container.innerHTML = '';

        this.history.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'history-item';

            const date = new Date(entry.timestamp);
            const timeStr = date.toLocaleTimeString();
            const dateStr = date.toLocaleDateString();

            item.innerHTML = `
                <div class="history-pattern">/${entry.pattern}/${entry.flags}</div>
                <div class="history-matches">${entry.matchCount} match${entry.matchCount !== 1 ? 'es' : ''}</div>
                <div class="history-date">${dateStr} ${timeStr}</div>
                <button class="history-load-btn" data-id="${entry.id}" title="Load this pattern">Load</button>
            `;

            item.querySelector('.history-load-btn').addEventListener('click', () => {
                this.loadFromHistory(entry);
            });

            container.appendChild(item);
        });
    }

    loadFromHistory(entry) {
        document.getElementById('regex-pattern').value = entry.pattern;

        // Set flags
        document.getElementById('flag-g').checked = entry.flags.includes('g');
        document.getElementById('flag-i').checked = entry.flags.includes('i');
        document.getElementById('flag-m').checked = entry.flags.includes('m');
        document.getElementById('flag-s').checked = entry.flags.includes('s');

        this.testRegex();
        this.showStatus('Pattern loaded from history', 'success');
    }

    bindClearHistory() {
        document.getElementById('clear-history-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all history?')) {
                this.history = [];
                localStorage.removeItem('regexTesterHistory');
                this.loadHistory();
                this.showStatus('History cleared', 'success');
            }
        });
    }

    // ==================== Utility Functions ====================
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setCurrentYear() {
        document.getElementById('currentYear').textContent = new Date().getFullYear();
    }

    // ==================== Example on First Visit ====================
    loadExampleOnFirstVisit() {
        // Only load example if there's no history (first visit)
        if (this.history.length === 0) {
            const examplePattern = '\\d+';
            const exampleTestString = 'Hello World! This is a test string with numbers 123 and 456. Contact us at 0812-3456-7890 or email@example.com. Price: $99.99. Also check ith numbers 123 and 456 for testing.';
            
            document.getElementById('regex-pattern').value = examplePattern;
            document.getElementById('test-string').value = exampleTestString;
            
            // Run the test to show results
            this.testRegex();
            
            // Show a helpful message
            this.showStatus('Example loaded! Try modifying the pattern or test string.', 'info');
        }
    }

    // ==================== Status Messages ====================
    showStatus(message, type = 'info') {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = `status ${type}`;
        status.classList.remove('hidden');

        setTimeout(() => {
            status.classList.add('hidden');
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RegexTester();
});
