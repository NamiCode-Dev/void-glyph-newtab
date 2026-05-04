function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    document.getElementById('clock').innerHTML = `${hours}<span class="colon">:</span>${minutes}`;
}

function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', options).toUpperCase();
    document.getElementById('date').textContent = dateString;
}

function updateProgress() {
    const now = new Date();
    
    // Day progress (Circular)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayProgress = (now - startOfDay) / (24 * 60 * 60 * 1000);
    const dayPercent = Math.round(dayProgress * 100);
    document.getElementById('day-percent').textContent = `${dayPercent}%`;
    updateCircle('day-circle', dayProgress);

    // Year progress (Segmented)
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
    const yearProgress = (now - startOfYear) / (endOfYear - startOfYear);
    renderSegments('year-progress', yearProgress, 40);
    document.getElementById('year-percent').textContent = `${Math.round(yearProgress * 100)}% COMPLETED`;
}

function updateCircle(id, progress) {
    const circle = document.getElementById(id);
    if (circle) {
        const circumference = 2 * Math.PI * 46; // 289.0
        const offset = circumference * (1 - progress);
        circle.style.strokeDashoffset = offset;
    }
}

function renderSegments(containerId, progress, count) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const activeCount = Math.floor(progress * count);
    
    for (let i = 0; i < count; i++) {
        const segment = document.createElement('div');
        const isAccent = (i + 1) % 10 === 0;
        segment.className = `segment ${i < activeCount ? 'active' : ''} ${isAccent ? 'accent' : ''}`;
        container.appendChild(segment);
    }
}

const sessionStartTime = Date.now();

function updateSessionStats() {
    const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    const hrs = String(Math.floor(elapsed / 3600)).padStart(2, '0');
    const mins = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    
    const el = document.getElementById('session-info');
    if (el) {
        el.innerHTML = `<span style="color: var(--accent-red)">●</span> UPTIME: ${hrs}:${mins}:${secs}`;
    }
}

async function updateBattery() {
    if ('getBattery' in navigator) {
        const battery = await navigator.getBattery();
        const updateInfo = () => {
            const level = Math.round(battery.level * 100);
            const levelProgress = battery.level;
            document.getElementById('battery-value').textContent = `${level}%`;
            const circle = document.getElementById('battery-circle');
            if (circle) {
                circle.style.stroke = level <= 20 ? 'var(--accent-red)' : 'var(--text-display)';
            }
            updateCircle('battery-circle', levelProgress);
        };
        updateInfo();
        battery.addEventListener('levelchange', updateInfo);
    }
}

function handleSearch(e) {
    if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query) {
            window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }
    }
}

async function initMode() {
    const { mode } = await chrome.storage.local.get('mode');
    const isLight = mode === 'light';
    document.body.classList.toggle('light-mode', isLight);
    document.getElementById('mode-toggle').textContent = isLight ? '[ LIGHT_MODE ]' : '[ DARK_MODE ]';
}

async function toggleMode() {
    const isLight = document.body.classList.toggle('light-mode');
    const mode = isLight ? 'light' : 'dark';
    await chrome.storage.local.set({ mode });
    document.getElementById('mode-toggle').textContent = isLight ? '[ LIGHT_MODE ]' : '[ DARK_MODE ]';
}

function updateStatus() {
    // Greeting based on time
    const hours = new Date().getHours();
    const greetingElement = document.getElementById('greeting');
    if (greetingElement) {
        if (hours < 12) greetingElement.textContent = 'STATUS: MORNING_PHASE';
        else if (hours < 18) greetingElement.textContent = 'STATUS: ACTIVE_DUTY';
        else greetingElement.textContent = 'STATUS: NIGHT_MODE';
    }
}

// Initialize
initMode();
updateClock();
updateDate();
updateBattery();
updateProgress();
updateSessionStats();
updateStatus();

setInterval(updateClock, 100);
setInterval(updateDate, 100);
setInterval(updateBattery, 100);
setInterval(updateProgress, 100); 
setInterval(updateSessionStats, 100);   
setInterval(updateStatus, 100);

document.getElementById('search-input').addEventListener('keydown', handleSearch);
document.getElementById('mode-toggle').addEventListener('click', toggleMode);
document.getElementById('license-toggle').addEventListener('click', () => {
    document.getElementById('license-modal').classList.add('active');
});
document.getElementById('close-license').addEventListener('click', () => {
    document.getElementById('license-modal').classList.remove('active');
});

// Close modal on click outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('license-modal');
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// Disable context menu, zoom, and copy
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('copy', (e) => e.preventDefault());

// Prevent keyboard zoom
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
        e.preventDefault();
    }
}, { passive: false });

// Prevent wheel zoom
document.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
        e.preventDefault();
    }
}, { passive: false });
