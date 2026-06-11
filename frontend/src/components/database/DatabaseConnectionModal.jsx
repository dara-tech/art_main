import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { RiCloseLine, RiDatabase2Line, RiRefreshLine } from '@remixicon/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getDatabaseSettings, updateDatabaseSettings, fetchAvailableDatabases } from '../../services/settingsApi';

export default function DatabaseConnectionModal({ open, onClose }) {
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('5432');
  const [username, setUsername] = useState('postgres');
  const [password, setPassword] = useState('');
  const [database, setDatabase] = useState('art_warehouse');
  const [saving, setSaving] = useState(false);
  const [databases, setDatabases] = useState([]);
  const [loadingDbs, setLoadingDbs] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    // Fetch current settings
    let active = true;
    getDatabaseSettings().then((res) => {
      if (active && res.success && res.data) {
        setHost(res.data.host || '');
        setPort(res.data.port || '');
        setDatabase(res.data.database || '');
        setUsername(res.data.username || '');
        setPassword(res.data.password || '');
      }
    }).catch(err => {
      console.error(err);
      toast.error('Failed to load current database settings');
    });

    return () => {
      active = false;
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateDatabaseSettings({
        host,
        port,
        database,
        username,
        password
      });
      if (res.success) {
        toast.success('Settings saved successfully! Connection reloaded.', { duration: 4000 });
        onClose();
      } else {
        toast.error('Failed to save settings to .env');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadDatabases = async () => {
    setLoadingDbs(true);
    try {
      const res = await fetchAvailableDatabases({ host, port, username, password });
      if (res.success && res.data) {
        setDatabases(res.data);
        if (!res.data.includes(database) && res.data.length > 0) {
          setDatabase(res.data[0]);
        }
        toast.success('Databases loaded successfully');
      } else {
        toast.error('Failed to load databases');
      }
    } catch (err) {
      toast.error('Failed to connect. Please check credentials.');
    } finally {
      setLoadingDbs(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex w-full max-w-md flex-col overflow-hidden bg-card shadow-2xl shadow-black/15 border-none rounded-2xl">
        <div className="flex items-center justify-between bg-[#2a1720] border-b border-white/10 px-6 py-3.5 text-white">
          <div className="flex items-center gap-2">
            <RiDatabase2Line className="size-5" aria-hidden />
            <div>
              <div className="text-base font-semibold text-white">Database Connection</div>
              <div className="mt-0.5 text-xs text-white/70">Configure warehouse database connection</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-md cursor-pointer text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RiCloseLine className="size-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Host</label>
            <input
              type="text"
              className="w-full border border-border/80 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="e.g. localhost"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Port</label>
            <input
              type="text"
              className="w-full border border-border/80 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="e.g. 5432"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Database Name</label>
              <button 
                type="button" 
                onClick={handleLoadDatabases} 
                disabled={loadingDbs}
                className="text-[10px] text-primary flex items-center gap-1 hover:underline disabled:opacity-50"
              >
                <RiRefreshLine className={`size-3 ${loadingDbs ? 'animate-spin' : ''}`} />
                Load Databases
              </button>
            </div>
            {databases.length > 0 ? (
              <select
                className="w-full border border-border/80 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
              >
                {databases.map((db) => (
                  <option key={db} value={db}>{db}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="w-full border border-border/80 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                placeholder="e.g. art_warehouse"
              />
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Username</label>
            <input
              type="text"
              className="w-full border border-border/80 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. postgres"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Password</label>
            <input
              type="password"
              className="w-full border border-border/80 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border/80 bg-muted/25 px-6 py-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Connection'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
