// BaiTap7 - CI/CD Demo - Dynamic timestamp update

document.addEventListener('DOMContentLoaded', function () {
    const timestampEl = document.getElementById('timestamp');
    const commitHashEl = document.getElementById('commit-hash');

    if (timestampEl) {
        const now = new Date();
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        };
        timestampEl.textContent = now.toLocaleString('vi-VN', options);
    }

    // GitLab CI exposes CI_COMMIT_SHA as an environment variable
    // We check if we're running in GitLab Pages context
    if (commitHashEl) {
        // In a real GitLab pipeline, this would be injected
        // For demo purposes, show a placeholder
        commitHashEl.textContent = 'GitLab CI will inject commit hash at build time';
    }
});
