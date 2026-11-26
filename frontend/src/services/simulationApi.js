const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export async function simulate(parameters, signal) {
  const response = await fetch(`${base}/api/simulate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parameters), signal,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = Array.isArray(body?.detail)
      ? body.detail.map(item => `${item.loc.at(-1)}: ${item.msg}`).join('; ')
      : body?.detail;
    throw new Error(detail || `Simulation service returned ${response.status}. Check that the Python backend is running.`);
  }
  return response.json();
}
