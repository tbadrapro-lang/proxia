// Wrapper minimal autour de l'API Notification du navigateur.
// Utilisé par Leads.jsx (realtime nouveau lead) et DashboardHome.jsx (permission au mount).

export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return 'error';
  }
}

export function sendNotification(title, body = '', options = {}) {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;
  if (Notification.permission !== 'granted') return null;
  try {
    return new Notification(title, {
      body,
      icon: '/proxia-logo.png',
      badge: '/proxia-logo.png',
      ...options,
    });
  } catch {
    return null;
  }
}
