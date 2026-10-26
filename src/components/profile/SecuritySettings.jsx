// src/components/profile/SecuritySettings.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { usersApi } from '../../api/users.api';
import { useAuthStore } from '../../store/authStore';
import { getApiErrorMessage } from '../../utils/apiError';

/** Rough "Chrome on Linux"-style summary of a user-agent string. */
function describeAgent(ua = '') {
  const browser = /Edg\//.test(ua) ? 'Edge'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /Safari\//.test(ua) ? 'Safari'
    : /PostmanRuntime/.test(ua) ? 'Postman'
    : null;
  const os = /Windows/.test(ua) ? 'Windows'
    : /Android/.test(ua) ? 'Android'
    : /iPhone|iPad/.test(ua) ? 'iOS'
    : /Mac OS X/.test(ua) ? 'macOS'
    : /Linux/.test(ua) ? 'Linux'
    : null;
  if (browser && os) return `${browser} on ${os}`;
  return browser ?? os ?? 'Unknown device';
}

export default function SecuritySettings() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    usersApi.getLoginHistory(10)
      .then(({ data }) => setHistory(data.history ?? []))
      .catch(() => toast.error('Could not load login history.'))
      .finally(() => setLoadingHistory(false));
  }, []);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!password) return;
    setDeleting(true);
    try {
      await usersApi.deleteAccount(password);
      logout();
      toast.success('Your account has been deleted.');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not delete account.'));
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Password</h2>
          <p className="text-sm text-gray-500">Changing your password signs you out everywhere.</p>
        </div>
        <Link to="/change-password" className="btn-secondary text-center">Change password</Link>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent sign-ins</h2>
        {loadingHistory ? (
          <div className="space-y-2 animate-pulse">
            {[0, 1, 2].map((i) => <div key={i} className="h-8 bg-gray-200 rounded" />)}
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-500">No sign-in activity recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
                  <th className="py-2 pr-4 font-medium">When</th>
                  <th className="py-2 pr-4 font-medium">Device</th>
                  <th className="py-2 pr-4 font-medium">IP address</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.map((h) => (
                  <tr key={h.id}>
                    <td className="py-2 pr-4 whitespace-nowrap text-gray-700">
                      {format(new Date(h.loginAt), 'MMM d, yyyy · HH:mm')}
                    </td>
                    <td className="py-2 pr-4 text-gray-700" title={h.userAgent}>{describeAgent(h.userAgent)}</td>
                    <td className="py-2 pr-4 text-gray-500 font-mono text-xs">{h.ipAddress ?? '—'}</td>
                    <td className="py-2">
                      <span className={h.status === 'success' ? 'text-emerald-600' : 'text-red-600'}>
                        {h.status === 'success' ? 'Success' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card p-6 border-red-200">
        <h2 className="text-lg font-semibold text-red-700">Delete account</h2>
        <p className="text-sm text-gray-500 mt-1">
          This permanently deletes your account, addresses and cart. It cannot be undone.
        </p>
        {showDelete ? (
          <form onSubmit={handleDelete} className="mt-4 space-y-3 max-w-sm">
            <Input
              label="Confirm with your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <Button type="submit" variant="danger" isLoading={deleting} disabled={!password}>
                Delete my account
              </Button>
              <Button type="button" variant="ghost" onClick={() => { setShowDelete(false); setPassword(''); }}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button variant="danger" className="mt-4" onClick={() => setShowDelete(true)}>
            Delete account
          </Button>
        )}
      </section>
    </div>
  );
}
