(function () {
    // TIMER DURATION
    const unlockAtIso = '2026-12-31T23:59:00';
    const content = document.getElementById('site-content');
    const gate = document.getElementById('launch-gate');
    const countdown = document.getElementById('countdown');
    const unlockLabel = document.getElementById('unlock-date');

    if (!content || !gate || !countdown || !unlockLabel) {
        return;
    }

    const unlockAt = new Date(unlockAtIso);
    if (Number.isNaN(unlockAt.getTime())) {
        content.style.display = '';
        gate.style.display = 'none';
        return;
    }

    unlockLabel.textContent = unlockAt.toLocaleString();

    function formatRemaining(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }

    function setUnlocked() {
        gate.style.display = 'none';
        content.style.display = '';
    }

    function setLocked() {
        content.style.display = 'none';
        gate.style.display = 'grid';

        const audio = document.getElementById('bg-music');
        if (audio) {
            audio.removeAttribute('autoplay');
            audio.pause();
            audio.currentTime = 0;
        }
    }

    function tick() {
        const now = new Date();
        const remaining = unlockAt.getTime() - now.getTime();

        if (remaining <= 0) {
            setUnlocked();
            countdown.textContent = '00d 00h 00m 00s';
            return true;
        }

        countdown.textContent = formatRemaining(remaining);
        return false;
    }

    setLocked();
    if (tick()) {
        return;
    }

    const timer = setInterval(function () {
        if (tick()) {
            clearInterval(timer);
        }
    }, 1000);
})();
