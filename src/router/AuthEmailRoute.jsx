import { Navigate, useLocation } from 'react-router-dom';

/** Redirect when auth flow pages are opened without required email in navigation state */
export default function AuthEmailRoute({ redirectTo, children }) {
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
