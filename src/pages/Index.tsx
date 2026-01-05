import { Navigate } from 'react-router-dom';

export default function Index() {
  // TEMPORARY: Bypassing auth for testing - go directly to dashboard
  return <Navigate to="/dashboard" replace />;
}
