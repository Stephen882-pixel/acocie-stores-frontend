// src/components/profile/AddressBook.jsx
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AddressForm from './AddressForm';
import Button from '../ui/Button';
import { usersApi } from '../../api/users.api';
import { getApiErrorMessage } from '../../utils/apiError';

export default function AddressBook() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  // null = closed, 'new' = adding, address object = editing
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = () =>
    usersApi.getAddresses()
      .then(({ data }) => setAddresses(data.addresses ?? []))
      .catch((err) => toast.error(getApiErrorMessage(err, 'Could not load addresses.')))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editing === 'new') {
        await usersApi.addAddress(payload);
        toast.success('Address added.');
      } else {
        await usersApi.updateAddress(editing.id, payload);
        toast.success('Address updated.');
      }
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not save address.'));
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (address) => {
    setBusyId(address.id);
    try {
      await usersApi.updateAddress(address.id, { isDefault: true });
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not set default address.'));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (address) => {
    if (!window.confirm('Delete this address?')) return;
    setBusyId(address.id);
    try {
      await usersApi.deleteAddress(address.id);
      setAddresses((list) => list.filter((a) => a.id !== address.id));
      toast.success('Address deleted.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not delete address.'));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 gap-4 animate-pulse">
        {[0, 1].map((i) => <div key={i} className="h-40 bg-gray-200 rounded-card" />)}
      </div>
    );
  }

  if (editing) {
    return (
      <section className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {editing === 'new' ? 'New address' : 'Edit address'}
        </h2>
        <AddressForm
          initial={editing === 'new' ? undefined : editing}
          onSubmit={handleSave}
          onCancel={() => setEditing(null)}
          submitting={saving}
        />
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Saved addresses</h2>
        <Button size="sm" onClick={() => setEditing('new')}>+ Add address</Button>
      </div>

      {addresses.length === 0 ? (
        <div className="card p-10 text-center text-sm text-gray-500">
          You have no saved addresses yet. Add one to speed up checkout.
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <li
              key={a.id}
              className={`card p-5 flex flex-col gap-2 ${a.isDefault ? 'ring-1 ring-scarlet-500' : ''} ${busyId === a.id ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{a.label || 'Address'}</span>
                {a.isDefault && (
                  <span className="text-[10px] uppercase tracking-wide font-semibold text-scarlet-700 bg-scarlet-50 px-1.5 py-0.5 rounded">
                    Default
                  </span>
                )}
              </div>
              <address className="not-italic text-sm text-gray-600 leading-relaxed">
                {a.fullName}<br />
                {a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ''}<br />
                {a.city}, {a.state} {a.postalCode}<br />
                {a.country}<br />
                {a.phone}
              </address>
              <div className="flex gap-4 mt-auto pt-2 text-xs font-medium">
                <button onClick={() => setEditing(a)} className="text-scarlet-600 hover:underline">Edit</button>
                {!a.isDefault && (
                  <button onClick={() => handleSetDefault(a)} className="text-gray-600 hover:underline">Set as default</button>
                )}
                <button onClick={() => handleDelete(a)} className="text-gray-500 hover:text-red-600 ml-auto">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
