import { Navigate } from 'react-router-dom';

/** Legacy insight / event-report URL — use Data Visualize (វិភាគ) instead. */
export default function InsightReportPage() {
  return <Navigate to="/visualize" replace />;
}
