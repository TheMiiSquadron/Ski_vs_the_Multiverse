(function () {
    // TIMER DURATION
    const unlockAtIso = '2026-12-31T23:59:59';
    const bypassPassword = 'Waffles';
    const bypassKey = 'ski_timer_bypass';
    const bypassDurationMs = 30 * 60 * 1000;
    const content = document.getElementById('site-content');
    const gate = document.getElementById('launch-gate');
    const countdown = document.getElementById('countdown');
    const unlockLabel = document.getElementById('unlock-date');
    const bypassBtn = document.getElementById('bypass-timer-btn');
    const passwordModal = document.getElementById('timer-password-modal');
    const passwordForm = document.getElementById('timer-password-form');
    const passwordInput = document.getElementById('timer-password-input');
    const passwordError = document.getElementById('timer-password-error');
    const passwordCancel = document.getElementById('timer-password-cancel');
    const lockWebsiteBtn = document.getElementById('lock-website-btn');

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

    function isBypassed() {
        try {
            const raw = localStorage.getItem(bypassKey);
            if (!raw) {
                return false;
            }

            const saved = JSON.parse(raw);
            if (
                !saved ||
                saved.unlockAtIso !== unlockAtIso ||
                !Number.isFinite(saved.expiresAt) ||
                Date.now() >= saved.expiresAt
            ) {
                localStorage.removeItem(bypassKey);
                return false;
            }

            return true;
        } catch (_) {
            return false;
        }
    }

    function setBypassed() {
        try {
            const payload = {
                unlockAtIso: unlockAtIso,
                expiresAt: Date.now() + bypassDurationMs
            };
            localStorage.setItem(bypassKey, JSON.stringify(payload));
        } catch (_) {}
    }

    function clearBypassed() {
        try {
            localStorage.removeItem(bypassKey);
        } catch (_) {}
    }

    function openPasswordModal() {
        if (!passwordModal || !passwordInput || !passwordError) {
            return;
        }
        passwordInput.value = '';
        passwordError.textContent = '';
        passwordModal.classList.add('is-open');
        passwordModal.setAttribute('aria-hidden', 'false');
        passwordInput.focus();
    }

    function closePasswordModal() {
        if (!passwordModal || !passwordError) {
            return;
        }
        passwordModal.classList.remove('is-open');
        passwordModal.setAttribute('aria-hidden', 'true');
        passwordError.textContent = '';
    }

    if (bypassBtn) {
        bypassBtn.addEventListener('click', function () {
            openPasswordModal();
        });
    }

    if (passwordCancel) {
        passwordCancel.addEventListener('click', function () {
            closePasswordModal();
        });
    }

    if (passwordForm) {
        passwordForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const input = passwordInput ? passwordInput.value : '';
            if (input === bypassPassword) {
                setBypassed();
                closePasswordModal();
                setUnlocked();
                return;
            }

            if (passwordError) {
                passwordError.textContent = 'Incorrect password.';
            }
        });
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && passwordModal && passwordModal.classList.contains('is-open')) {
            closePasswordModal();
        }
    });

    if (lockWebsiteBtn) {
        lockWebsiteBtn.addEventListener('click', function () {
            clearBypassed();
            setLocked();
            tick();
        });
    }

    if (isBypassed()) {
        setUnlocked();
        return;
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
