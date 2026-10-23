// Application State
const state = {
  backendUrl: '',
  isConnected: false,
  latencyMs: 0
};

// DOM Elements
const urlInput = document.getElementById('backend-url-input');
const btnReconnect = document.getElementById('btn-reconnect');
const btnResetUrl = document.getElementById('btn-reset-url');
const statusBadge = document.getElementById('system-status-badge');
const statusLabel = document.getElementById('status-label');
const latencyTag = document.getElementById('latency-tag');
const envTableBody = document.getElementById('env-table-body');
const envMessageText = document.getElementById('env-message-text');
const btnTestHealth = document.getElementById('btn-test-health');
const btnTestConfig = document.getElementById('btn-test-config');
const btnTestEcho = document.getElementById('btn-test-echo');
const echoInput = document.getElementById('echo-payload-input');
const responseMeta = document.getElementById('response-meta');
const responseJsonDisplay = document.getElementById('response-json-display');

// Determine best default URL
function getInitialBackendUrl() {
  const saved = localStorage.getItem('deployment_test_backend_url');
  if (saved) return saved;

  const currentProtocol = window.location.protocol;
  const currentHost = window.location.host;

  if (currentProtocol.startsWith('http') && currentHost && !currentHost.includes(':5500') && !currentHost.includes(':3000')) {
    // If served from the node backend directly or a custom host
    return window.location.origin;
  }
  return 'http://localhost:5005';
}

// Clean and normalize URLs (strip trailing slashes)
function cleanUrl(url) {
  return url.trim().replace(/\/+$/, '');
}

// Update status indicators
function setStatus(status, latency = null, message = '') {
  statusBadge.className = 'status-badge ' + status;
  if (status === 'online') {
    statusLabel.textContent = 'Backend Online';
    latencyTag.textContent = `${latency} ms`;
    state.isConnected = true;
  } else if (status === 'offline') {
    statusLabel.textContent = message || 'Backend Offline';
    latencyTag.textContent = 'Timeout';
    state.isConnected = false;
  } else {
    statusLabel.textContent = 'Connecting...';
    latencyTag.textContent = '-- ms';
  }
}

// Display JSON in inspector
function showResponse(title, status, timeMs, data) {
  responseMeta.textContent = `${title} • ${status} (${timeMs}ms)`;
  responseJsonDisplay.textContent = JSON.stringify(data, null, 2);
}

// Fetch backend environment and configuration
async function checkBackend() {
  const baseUrl = cleanUrl(urlInput.value || 'http://localhost:5005');
  state.backendUrl = baseUrl;
  localStorage.setItem('deployment_test_backend_url', baseUrl);

  setStatus('checking');
  const startTime = performance.now();

  try {
    const res = await fetch(`${baseUrl}/api/config`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    const elapsed = Math.round(performance.now() - startTime);

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = await res.json();
    setStatus('online', elapsed);
    renderEnvTable(data);
    showResponse('GET /api/config', res.status, elapsed, data);
  } catch (err) {
    console.error('Connection failed:', err);
    setStatus('offline', null, 'Cannot reach backend');
    renderOfflineTable(baseUrl, err.message);
    showResponse('Connection Error', 'FAILED', 0, {
      error: err.message,
      targetUrl: baseUrl,
      tip: 'Ensure the backend is running (`npm start`) and CORS is permitted.'
    });
  }
}

// Render the environment variables table
function renderEnvTable(data) {
  envMessageText.textContent = data.message || 'No message defined in .env';

  const rows = [
    {
      key: 'APP_NAME',
      val: data.appName || 'Not defined',
      status: 'Loaded'
    },
    {
      key: 'NODE_ENV',
      val: data.nodeEnv || 'Not defined',
      status: 'Active'
    },
    {
      key: 'PORT',
      val: data.port || '5005',
      status: 'Listening'
    },
    {
      key: 'MESSAGE',
      val: data.message || 'Not defined',
      status: 'Loaded'
    },
    {
      key: 'API_KEY',
      val: data.maskedApiKey || 'Not provided',
      status: data.hasApiKey ? 'Loaded (Masked)' : 'Missing'
    },
    {
      key: 'SERVER_TIME',
      val: data.serverTime || new Date().toISOString(),
      status: 'Realtime'
    }
  ];

  envTableBody.innerHTML = rows.map(r => `
    <tr>
      <td class="var-name">${r.key}</td>
      <td class="var-val">${escapeHtml(String(r.val))}</td>
      <td>
        <span class="badge-pill ${r.status.includes('Missing') ? 'badge-info' : 'badge-success'}">
          ${r.status}
        </span>
      </td>
    </tr>
  `).join('');
}

// Render fallback table when backend cannot be reached
function renderOfflineTable(targetUrl, errorMsg) {
  envMessageText.textContent = `Backend at ${targetUrl} is unreachable. Check if server is running.`;
  envTableBody.innerHTML = `
    <tr>
      <td colspan="3" class="loading-cell" style="color: var(--error);">
        ⚠️ Failed to connect to: <code>${escapeHtml(targetUrl)}</code><br>
        <small style="margin-top: 0.5rem; display: inline-block;">Reason: ${escapeHtml(errorMsg)}</small>
      </td>
    </tr>
  `;
}

// Utility to escape HTML strings
function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// API Health Check Button Handler
btnTestHealth.addEventListener('click', async () => {
  const baseUrl = cleanUrl(urlInput.value || 'http://localhost:5005');
  const t0 = performance.now();
  try {
    const res = await fetch(`${baseUrl}/api/health`);
    const elapsed = Math.round(performance.now() - t0);
    const json = await res.json();
    showResponse('GET /api/health', res.status, elapsed, json);
  } catch (err) {
    showResponse('GET /api/health', 'ERROR', 0, { error: err.message });
  }
});

// API Config Check Button Handler
btnTestConfig.addEventListener('click', async () => {
  checkBackend();
});

// API Echo POST Button Handler
btnTestEcho.addEventListener('click', async () => {
  const baseUrl = cleanUrl(urlInput.value || 'http://localhost:5005');
  const payloadText = echoInput.value.trim() || `Deployment test ping ${new Date().toLocaleTimeString()}`;
  const t0 = performance.now();

  try {
    const res = await fetch(`${baseUrl}/api/echo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientMessage: payloadText,
        sentAt: new Date().toISOString(),
        clientBrowser: navigator.userAgent
      })
    });
    const elapsed = Math.round(performance.now() - t0);
    const json = await res.json();
    showResponse('POST /api/echo', res.status, elapsed, json);
  } catch (err) {
    showResponse('POST /api/echo', 'ERROR', 0, { error: err.message });
  }
});

// Event Listeners
btnReconnect.addEventListener('click', () => {
  checkBackend();
});

urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    checkBackend();
  }
});

btnResetUrl.addEventListener('click', () => {
  const defaultUrl = window.location.protocol.startsWith('http') ? window.location.origin : 'http://localhost:5005';
  urlInput.value = defaultUrl;
  checkBackend();
});

// Initialization
window.addEventListener('DOMContentLoaded', () => {
  const initialUrl = getInitialBackendUrl();
  urlInput.value = initialUrl;
  
  // Set default dynamic echo string
  echoInput.value = `Deployment ping from client at ${new Date().toLocaleTimeString()}`;

  checkBackend();
});
