import './_group.css';
import DashboardPage from './_Dashboard';
import { AppShell } from './_Shell';

// Extracted real dashboard and shell; only data/auth/navigation are stubbed.
export function Current() {
  return <AppShell><DashboardPage /></AppShell>;
}
