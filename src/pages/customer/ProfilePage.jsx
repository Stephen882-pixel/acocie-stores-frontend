// src/pages/customer/ProfilePage.jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProfileDetails from '../../components/profile/ProfileDetails';
import AddressBook from '../../components/profile/AddressBook';
import SecuritySettings from '../../components/profile/SecuritySettings';
import { usersApi } from '../../api/users.api';
import { getApiErrorMessage } from '../../utils/apiError';

const TABS = [
  { key: 'details', label: 'Profile' },
  { key: 'addresses', label: 'Addresses' },
  { key: 'security', label: 'Security' },
];

export default function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TABS.some((t) => t.key === searchParams.get('tab')) ? searchParams.get('tab') : 'details';

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.getProfile()
      .then(({ data }) => setProfile(data.user))
      .catch((err) => toast.error(getApiErrorMessage(err, 'Could not load profile.')))
      .finally(() => setLoading(false));
  }, []);

  const initials = `${profile?.firstName?.[0] ?? ''}${profile?.lastName?.[0] ?? ''}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-scarlet-100 flex items-center justify-center text-scarlet-700 font-bold text-lg">
          {initials || '?'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {profile ? `${profile.firstName} ${profile.lastName}` : 'My account'}
          </h1>
          {profile?.email && <p className="text-sm text-gray-500">{profile.email}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setSearchParams(t.key === 'details' ? {} : { tab: t.key }, { replace: true })}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? 'border-scarlet-600 text-scarlet-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'details' && (
        loading ? (
          <div className="card p-6 space-y-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-40" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        ) : profile ? (
          <ProfileDetails
            profile={profile}
            onUpdated={(fields) => setProfile((p) => ({ ...p, ...fields }))}
          />
        ) : (
          <p className="text-sm text-gray-500">Profile unavailable.</p>
        )
      )}
      {tab === 'addresses' && <AddressBook />}
      {tab === 'security' && <SecuritySettings />}
    </div>
  );
}
