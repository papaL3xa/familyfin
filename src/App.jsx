import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ArrowRightLeft,
  Settings,
  Tags,
  Plus,
  Trash2,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Home,
  User,
  CreditCard,
  Receipt,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Shield
} from 'lucide-react';
import {
  fetchTransactions,
  addTransaction,
  deleteTransaction,
  fetchCategories,
  addCategory,
  deleteCategory,
  fetchWallets,
  addWallet,
  deleteWallet,
  fetchDebts,
  addDebt,
  deleteDebt,
  registerUser,
  loginUser,
  approveUser,
  rejectUser,
  getPendingUsers,
  fetchActiveUsers,
  extendSubscription,
  toggleBlockUser,
  getConfig
} from './services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, Legend
} from 'recharts';
import {
  format, isSameDay, isSameWeek, isSameMonth, isSameYear,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths
} from 'date-fns';
import './index.css';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const formatDate = (dateStr) => {
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : format(d, 'dd MMM yyyy');
  } catch (e) { return dateStr; }
};

function GlassSelect({ value: propValue, onChange, options, style, name, required }) {
  const [internalValue, setInternalValue] = useState(options[0]?.value || '');
  const [isOpen, setIsOpen] = useState(false);

  const isControlled = propValue !== undefined;
  const value = isControlled ? propValue : internalValue;

  const handleChange = (val) => {
    if (!isControlled) setInternalValue(val);
    if (onChange) onChange(val);
    setIsOpen(false);
  };

  const selectedLabel = options.find(o => o.value === value)?.label || "Pilih...";

  return (
    <div style={{ position: 'relative', ...style }}>
      {name && <input type="hidden" name={name} value={value} required={required} />}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)', cursor: 'pointer', color: 'var(--text-main)',
          userSelect: 'none', minWidth: '150px'
        }}
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={16} style={{ marginLeft: '0.5rem' }} />
      </div>

      {isOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setIsOpen(false)} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 10,
            background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.5rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxHeight: '300px', overflowY: 'auto'
          }}>
            {options.map(o => (
              <div
                key={o.value}
                onClick={() => handleChange(o.value)}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer',
                  color: 'var(--text-main)',
                  background: value === o.value ? 'rgba(0,0,0,0.05)' : 'transparent',
                  transition: 'background 0.2s'
                }}
                onMouseOver={e => e.target.style.background = 'rgba(168, 85, 247, 0.15)'}
                onMouseOut={e => e.target.style.background = value === o.value ? 'rgba(0,0,0,0.05)' : 'transparent'}
              >
                {o.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function GlassDatePicker({ value, onChange, name, required, style }) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(value || new Date().toISOString().split('T')[0]);
  const activeValue = value !== undefined ? value : internalValue;

  const [currentDate, setCurrentDate] = useState(new Date(activeValue));

  const handleSelect = (date) => {
    const formatted = format(date, 'yyyy-MM-dd');
    if (value === undefined) setInternalValue(formatted);
    if (onChange) onChange({ target: { value: formatted } });
    setIsOpen(false);
  };

  const handlePrevMonth = (e) => { e.stopPropagation(); setCurrentDate(subMonths(currentDate, 1)); };
  const handleNextMonth = (e) => { e.stopPropagation(); setCurrentDate(addMonths(currentDate, 1)); };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <div style={{ position: 'relative', ...style }}>
      {name && <input type="hidden" name={name} value={activeValue} required={required} />}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)', cursor: 'pointer', color: 'var(--text-main)',
          userSelect: 'none', minWidth: '150px'
        }}
      >
        <span>{formatDate(activeValue)}</span>
        <CalendarIcon size={16} style={{ marginLeft: '0.5rem', opacity: 0.7 }} />
      </div>

      {isOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setIsOpen(false)} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 10, width: '280px',
            background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontWeight: 600 }}>
              <div onClick={handlePrevMonth} style={{ cursor: 'pointer', padding: '0.25rem', borderRadius: '50%' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <ChevronLeft size={20} />
              </div>
              <div>{format(currentDate, 'MMMM yyyy')}</div>
              <div onClick={handleNextMonth} style={{ cursor: 'pointer', padding: '0.25rem', borderRadius: '50%' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <ChevronRight size={20} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {weekDays.map(d => <div key={d}>{d}</div>)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {allDays.map(day => {
                const isSelected = isSameDay(day, new Date(activeValue));
                const isCurrentMonth = isSameMonth(day, monthStart);
                return (
                  <div
                    key={day.toString()}
                    onClick={() => handleSelect(day)}
                    style={{
                      padding: '0.4rem 0', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem',
                      background: isSelected ? 'var(--primary)' : 'transparent',
                      color: isSelected ? 'white' : (isCurrentMonth ? 'var(--text-main)' : 'var(--text-muted)'),
                      opacity: isCurrentMonth ? 1 : 0.4
                    }}
                    onMouseOver={e => !isSelected && (e.currentTarget.style.background = 'rgba(168, 85, 247, 0.15)')}
                    onMouseOut={e => !isSelected && (e.currentTarget.style.background = 'transparent')}
                  >
                    {format(day, 'd')}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CurrencyInput({ name, required, placeholder, className, style, defaultValue }) {
  const [displayValue, setDisplayValue] = useState(defaultValue ? parseInt(defaultValue, 10).toLocaleString('id-ID') : "");
  const [rawValue, setRawValue] = useState(defaultValue || "");

  const handleChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, ''); // strip non-numeric
    setRawValue(val);
    if (val) {
      setDisplayValue(parseInt(val, 10).toLocaleString('id-ID'));
    } else {
      setDisplayValue("");
    }
  };

  return (
    <>
      <input type="hidden" name={name} value={rawValue} required={required} />
      <input
        type="text"
        inputMode="numeric"
        className={className}
        style={style}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        required={required}
      />
    </>
  );
}

function AdminDashboard({ currentUser, onLogout, apiUrl, onSaveApiUrl }) {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [folderId, setFolderId] = useState(localStorage.getItem('gas_folder_id') || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [confirmReject, setConfirmReject] = useState(null);
  const [approveUserEmail, setApproveUserEmail] = useState(null);
  const [extendUser, setExtendUser] = useState(null);
  const [extendType, setExtendType] = useState('1');
  const [customYears, setCustomYears] = useState('2');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const [pending, active] = await Promise.all([
        getPendingUsers(),
        fetchActiveUsers()
      ]);
      setPendingUsers(pending || []);
      setActiveUsers(active || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveFolderId = (e) => {
    e.preventDefault();
    localStorage.setItem('gas_folder_id', folderId);
    setMessage({ type: 'success', text: "Folder ID berhasil disimpan." });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleApprove = (email) => {
    if (!folderId) {
      setMessage({ type: 'error', text: "Mohon isi dan simpan Folder ID terlebih dahulu sebelum menyetujui akun." });
      return;
    }
    setApproveUserEmail(email);
  };

  const executeApprove = async () => {
    if (!approveUserEmail) return;
    setLoading(true);
    setMessage(null);
    try {
      let years = extendType === 'custom' ? customYears : extendType;
      const res = await approveUser(approveUserEmail, folderId, years);
      if (res.success) {
        setMessage({ type: 'success', text: `Akun ${approveUserEmail} berhasil disetujui. Spreadsheet ID: ${res.spreadsheetId}` });
        loadUsers();
      } else {
        setMessage({ type: 'error', text: res.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Terjadi kesalahan." });
    } finally {
      setLoading(false);
      setApproveUserEmail(null);
    }
  };

  const handleReject = (email) => {
    setConfirmReject(email);
  };

  const executeReject = async (email) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await rejectUser(email);
      if (res.success) {
        setMessage({ type: 'success', text: res.message || `Akun ${email} berhasil ditolak.` });
        loadUsers();
      } else {
        setMessage({ type: 'error', text: res.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Terjadi kesalahan." });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (email) => {
    if (!window.confirm(`Apakah Anda yakin ingin mengubah status blokir akun ${email}?`)) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await toggleBlockUser(email);
      if (res.success) {
        setMessage({ type: 'success', text: `Status ${email} diubah menjadi ${res.status}.` });
        loadUsers();
      } else {
        setMessage({ type: 'error', text: res.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Terjadi kesalahan." });
    } finally {
      setLoading(false);
    }
  };

  const executeExtend = async () => {
    if (!extendUser) return;
    setLoading(true);
    setMessage(null);
    try {
      let years = extendType === 'custom' ? customYears : extendType;
      const res = await extendSubscription(extendUser, years);
      if (res.success) {
        setMessage({ type: 'success', text: `Masa aktif ${extendUser} berhasil diperpanjang.` });
        loadUsers();
      } else {
        setMessage({ type: 'error', text: res.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Terjadi kesalahan." });
    } finally {
      setLoading(false);
      setExtendUser(null);
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Dasbor Admin</h2>
        <button className="btn btn-outline" onClick={onLogout}>Keluar</button>
      </div>

      {message && (
        <div style={{ padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', background: message.type === 'error' ? 'var(--danger-bg)' : 'var(--success-bg)', color: message.type === 'error' ? 'var(--danger)' : 'var(--success)' }}>
          {message.text}
        </div>
      )}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Pengaturan Google Drive</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Masukkan Folder ID tempat spreadsheet baru akan dibuat secara otomatis saat menyetujui pengguna.
        </p>
        <form onSubmit={handleSaveFolderId} style={{ display: 'flex', gap: '1rem' }}>
          <input type="text" className="form-control" value={folderId} onChange={e => setFolderId(e.target.value)} placeholder="Contoh: 1BxiMVs0XRY..." required style={{ flex: 1 }} />
          <button type="submit" className="btn btn-primary">Simpan</button>
        </form>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Pengaturan Web App URL</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Tautan Google Apps Script Anda. Ubah hanya jika Anda mendeploy ulang script dengan URL baru.
        </p>
        <form onSubmit={onSaveApiUrl} style={{ display: 'flex', gap: '1rem' }}>
          <input type="url" name="apiUrl" defaultValue={apiUrl} className="form-control" placeholder="https://script.google.com/macros/s/.../exec" required style={{ flex: 1 }} />
          <button type="submit" className="btn btn-primary" onClick={() => {
            setMessage({ type: 'success', text: "Web App URL berhasil diperbarui." });
            setTimeout(() => setMessage(null), 3000);
          }}>Perbarui URL</button>
        </form>
      </div>

      <div className="card">
        <h3>Permintaan Pendaftaran Tertunda</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Daftar pengguna yang telah mendaftar dan menunggu persetujuan Anda. Menyetujui pengguna akan membuat spreadsheet baru di folder yang diatur di atas.
        </p>
        
        {pendingUsers.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--glass-bg)', borderRadius: '8px' }}>
            Tidak ada permintaan pendaftaran tertunda.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingUsers.map((u, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0' }}>{u.email}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mendaftar pada: {new Date(u.date).toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-outline" onClick={() => handleReject(u.email)} disabled={loading} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                    Tolak
                  </button>
                  <button className="btn btn-primary" onClick={() => handleApprove(u.email)} disabled={loading}>
                    Setujui
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Daftar Pengguna Aktif</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Kelola pengguna yang sudah disetujui. Anda dapat memblokir pengguna atau memperpanjang masa aktif langganan mereka (diakumulasi jika belum jatuh tempo).
        </p>

        {activeUsers.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--glass-bg)', borderRadius: '8px' }}>
            Belum ada pengguna aktif.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeUsers.map((u, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {u.email}
                    {u.status === 'Blocked' && <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', background: 'var(--danger)', color: 'white', borderRadius: '4px' }}>Diblokir</span>}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div>Daftar: {new Date(u.date).toLocaleString('id-ID')}</div>
                    <div>Jatuh Tempo: <strong>{u.expiry ? new Date(u.expiry).toLocaleString('id-ID') : 'Tidak diketahui'}</strong></div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-outline" onClick={() => handleToggleBlock(u.email)} disabled={loading} style={{ borderColor: u.status === 'Blocked' ? 'var(--success)' : 'var(--warning)', color: u.status === 'Blocked' ? 'var(--success)' : 'var(--warning)' }}>
                    {u.status === 'Blocked' ? 'Buka Blokir' : 'Blokir'}
                  </button>
                  <button className="btn btn-primary" onClick={() => setExtendUser(u.email)} disabled={loading}>
                    Perpanjang
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {approveUserEmail && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, backdropFilter: 'blur(5px)' }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ marginTop: 0 }}>Setujui Pengguna</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Pilih masa aktif berlangganan untuk <strong>{approveUserEmail}</strong>.
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="radio" name="approveExtendType" value="1" checked={extendType === '1'} onChange={() => setExtendType('1')} />
                1 Tahun
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="radio" name="approveExtendType" value="custom" checked={extendType === 'custom'} onChange={() => setExtendType('custom')} />
                Custom (Tahun)
              </label>
              {extendType === 'custom' && (
                <input type="number" min="1" max="50" className="form-control" value={customYears} onChange={e => setCustomYears(e.target.value)} style={{ marginLeft: '1.5rem', width: '100px', padding: '0.25rem 0.5rem' }} />
              )}
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="radio" name="approveExtendType" value="lifetime" checked={extendType === 'lifetime'} onChange={() => setExtendType('lifetime')} />
                Seumur Hidup (Lifetime)
              </label>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setApproveUserEmail(null)}>Batal</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={executeApprove}>Konfirmasi Setujui</button>
            </div>
          </div>
        </div>
      )}

      {extendUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, backdropFilter: 'blur(5px)' }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ marginTop: 0 }}>Perpanjang Masa Aktif</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Pilih durasi perpanjangan berlangganan untuk <strong>{extendUser}</strong>.
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="radio" name="extendType" value="1" checked={extendType === '1'} onChange={() => setExtendType('1')} />
                1 Tahun
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="radio" name="extendType" value="custom" checked={extendType === 'custom'} onChange={() => setExtendType('custom')} />
                Custom (Tahun)
              </label>
              {extendType === 'custom' && (
                <input type="number" min="1" max="50" className="form-control" value={customYears} onChange={e => setCustomYears(e.target.value)} style={{ marginLeft: '1.5rem', width: '100px', padding: '0.25rem 0.5rem' }} />
              )}
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="radio" name="extendType" value="lifetime" checked={extendType === 'lifetime'} onChange={() => setExtendType('lifetime')} />
                Seumur Hidup (Lifetime)
              </label>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setExtendUser(null)}>Batal</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={executeExtend}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {confirmReject && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, backdropFilter: 'blur(5px)' }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ marginTop: 0 }}>Konfirmasi Penolakan</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Apakah Anda yakin ingin menolak dan menghapus pendaftaran <strong>{confirmReject}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setConfirmReject(null)}>Batal</button>
              <button className="btn btn-primary" style={{ flex: 1, background: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => {
                const email = confirmReject;
                setConfirmReject(null);
                executeReject(email);
              }}>Tolak Pendaftaran</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AuthScreen({ onLoginSuccess, apiUrl, onSaveApiUrl }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiUrl) {
      setMessage({ type: 'error', text: 'Mohon atur URL API terlebih dahulu melalui menu Pengaturan di pojok kanan atas.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      if (isLogin) {
        const res = await loginUser(email);
        if (res.success) {
          onLoginSuccess(res);
        } else {
          setMessage({ type: 'error', text: res.error });
        }
      } else {
        const res = await registerUser(email);
        if (res.success || res.error === "Email sudah terdaftar") {
          const conf = await getConfig();
          if (conf.adminWa) {
            const waText = encodeURIComponent(`Halo Admin, saya ingin mendaftar aplikasi FamilyFin dengan email: ${email}`);
            window.open(`https://wa.me/${conf.adminWa}?text=${waText}`, '_blank');
          }
          setMessage({ type: 'success', text: "Pendaftaran berhasil dikirim. Menunggu persetujuan admin." });
          setIsLogin(true);
        } else {
          setMessage({ type: 'error', text: res.error });
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Terjadi kesalahan jaringan." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '1rem' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>{isLogin ? 'Masuk' : 'Daftar Akun'}</h2>
        
        {message && (
          <div style={{ padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', background: message.type === 'error' ? 'var(--danger-bg)' : 'var(--success-bg)', color: message.type === 'error' ? 'var(--danger)' : 'var(--success)' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email</label>
            <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Budi@gmail.com" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Memproses...' : isLogin ? 'Masuk' : 'Kirim Pendaftaran ke WhatsApp'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
          <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => { setIsLogin(!isLogin); setMessage(null); }}>
            {isLogin ? "Daftar di sini" : "Masuk di sini"}
          </span>
        </p>
      </div>
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  
  const [activeTab, setActiveTab] = useState(currentUser ? (currentUser.spreadsheetId ? 'home' : 'admin') : 'login');
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('gas_api_url') || '');
  const [showSettings, setShowSettings] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [debts, setDebts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscriptionWarning, setSubscriptionWarning] = useState(null);

  const handleLoginSuccess = (data) => {
    localStorage.setItem('currentUser', JSON.stringify(data));
    setCurrentUser(data);
    if (data.spreadsheetId) {
      localStorage.setItem('gas_spreadsheet_id', data.spreadsheetId);
    }
    if (data.warning) {
      setSubscriptionWarning(data.warning);
    } else {
      setSubscriptionWarning(null);
    }
    setActiveTab(data.spreadsheetId ? 'home' : 'admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('gas_spreadsheet_id');
    setCurrentUser(null);
    setActiveTab('home');
    setTransactions([]);
    setCategories([]);
    setWallets([]);
    setDebts([]);
  };

  useEffect(() => {
    if (apiUrl && currentUser) {
      loadData();
    }
  }, [apiUrl, currentUser]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [txs, cats, wals, dbts] = await Promise.all([
        fetchTransactions(),
        fetchCategories(),
        fetchWallets(),
        fetchDebts()
      ]);
      setTransactions(txs.reverse());
      setCategories(cats);
      setWallets(wals);
      setDebts(dbts);
      setError(null);
    } catch (err) {
      setError("Gagal memuat data. Periksa URL API atau koneksi Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiUrl = (e) => {
    e.preventDefault();
    const url = e.target.elements.apiUrl.value;
    localStorage.setItem('gas_api_url', url);
    setApiUrl(url);
  };

  return (
    <div className="app-layout">
      {/* Top Header */}
      <header className="top-header">
        <div className="header-brand">
          <Wallet size={24} color="#6366f1" />
          <span>FamilyFin</span>
        </div>

        {currentUser ? (
          <div className="header-nav">
            {currentUser.spreadsheetId && (
              <>
                <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
                  <Home size={18} /> Beranda
                </div>
                <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                  <LayoutDashboard size={18} /> Statistik
                </div>
                <div className={`nav-item ${activeTab === 'wallets' ? 'active' : ''}`} onClick={() => setActiveTab('wallets')}>
                  <CreditCard size={18} /> Dompet
                </div>
                <div className={`nav-item ${activeTab === 'debts' ? 'active' : ''}`} onClick={() => setActiveTab('debts')}>
                  <Receipt size={18} /> Hutang
                </div>
                <div className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>
                  <ArrowRightLeft size={18} /> Transaksi
                </div>
                <div className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
                  <Tags size={18} /> Kategori
                </div>
                <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                  <Settings size={18} /> Pengaturan
                </div>
              </>
            )}
            {currentUser.role === 'admin' && (
              <div className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
                <Shield size={18} /> Admin
              </div>
            )}
          </div>
        ) : (
          <div 
            style={{ cursor: 'pointer', color: 'white', padding: '0.5rem', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowSettings(true)}
          >
            <Settings size={20} />
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="main-content">
        {subscriptionWarning && (
          <div style={{ background: 'var(--warning-bg)', color: 'var(--warning)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span><strong>Perhatian:</strong> {subscriptionWarning}</span>
            <button className="btn btn-outline" style={{ borderColor: 'var(--warning)', color: 'var(--warning)', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setSubscriptionWarning(null)}>Tutup</button>
          </div>
        )}
        {error && (
          <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {!currentUser ? (
          <AuthScreen onLoginSuccess={handleLoginSuccess} apiUrl={apiUrl} onSaveApiUrl={handleSaveApiUrl} />
        ) : (
          <>
            {activeTab === 'admin' && currentUser.role === 'admin' && <AdminDashboard currentUser={currentUser} onLogout={handleLogout} apiUrl={apiUrl} onSaveApiUrl={handleSaveApiUrl} />}
            {activeTab === 'home' && <HomeTab setActiveTab={setActiveTab} />}
            {activeTab === 'dashboard' && <DashboardTab transactions={transactions} wallets={wallets} isLoading={isLoading} />}
            {activeTab === 'transactions' && <TransactionsTab transactions={transactions} categories={categories} wallets={wallets} onRefresh={loadData} isLoading={isLoading} />}
            {activeTab === 'categories' && <CategoriesTab categories={categories} onRefresh={loadData} isLoading={isLoading} />}
            {activeTab === 'wallets' && <WalletsTab wallets={wallets} onRefresh={loadData} isLoading={isLoading} />}
            {activeTab === 'debts' && <DebtsTab debts={debts} transactions={transactions} wallets={wallets} onRefresh={loadData} isLoading={isLoading} />}
            {activeTab === 'settings' && (
              <div className="card">
                <h2>Pengaturan Profil</h2>
                <div style={{ marginTop: '1.5rem', marginBottom: '1rem', padding: '1rem', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>Akun Saat Ini</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>{currentUser.email} {currentUser.role === 'admin' ? '(Admin)' : ''}</p>
                  <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={handleLogout}>Keluar (Logout)</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      {currentUser && (
        <nav className="bottom-nav">
          <div className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
            <Home size={22} />
            <span>Beranda</span>
          </div>
          <div className={`bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={22} />
            <span>Statistik</span>
          </div>
          <div className={`bottom-nav-item ${activeTab === 'wallets' ? 'active' : ''}`} onClick={() => setActiveTab('wallets')}>
            <CreditCard size={22} />
            <span>Dompet</span>
          </div>

          {/* Center Add Button */}
          <div className="bottom-nav-item" onClick={() => setActiveTab('transactions')}>
            <div className="bottom-nav-add">
              <Plus size={24} />
            </div>
          </div>

          <div className={`bottom-nav-item ${activeTab === 'debts' ? 'active' : ''}`} onClick={() => setActiveTab('debts')}>
            <Receipt size={22} />
            <span>Hutang</span>
          </div>

          {currentUser.role === 'admin' ? (
            <div className={`bottom-nav-item ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
              <Shield size={22} />
              <span>Admin</span>
            </div>
          ) : (
            <div className={`bottom-nav-item ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
              <Tags size={22} />
              <span>Kategori</span>
            </div>
          )}
          
          <div className={`bottom-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <User size={22} />
            <span>Pengaturan</span>
          </div>
        </nav>
      )}
    </div>
  );
}

// --- Tabs Components ---

function HomeTab({ setActiveTab }) {
  const quotes = [
    "Kekayaan bukanlah tentang seberapa banyak uang yang Anda miliki, tetapi seberapa cerdas Anda mengelolanya.",
    "Jangan menabung apa yang tersisa setelah menghabiskan, tapi habiskan apa yang tersisa setelah menabung. - Warren Buffett",
    "Perencanaan keuangan adalah panduan terbaik untuk masa depan keluarga yang damai.",
    "Langkah kecil dalam berhemat hari ini adalah lompatan besar untuk kebebasan finansial esok hari."
  ];

  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  return (
    <div>
      <div className="home-hero">
        <div className="home-glass-card">
          <h1>FamilyFin</h1>
          <p className="subtitle">Membangun Masa Depan Keuangan Keluarga yang Lebih Baik</p>

          <div className="quote-container">
            <p className="quote-text">"{quote}"</p>
          </div>
        </div>
      </div>

      <div className="home-quick-actions">
        <div className="home-action-card" onClick={() => setActiveTab('transactions')}>
          <div className="home-action-icon">
            <Plus size={24} />
          </div>
          <div className="home-action-text">
            <h4>Catat Transaksi</h4>
            <p>Tambah pemasukan atau pengeluaran baru</p>
          </div>
        </div>

        <div className="home-action-card" onClick={() => setActiveTab('dashboard')}>
          <div className="home-action-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <LayoutDashboard size={24} />
          </div>
          <div className="home-action-text">
            <h4>Lihat Statistik</h4>
            <p>Pantau arus kas dan laporan bulan ini</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardTab({ transactions, wallets, isLoading }) {
  if (isLoading) return <div>Memuat dashboard...</div>;

  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  const expenseByCategory = transactions
    .filter(t => t.type === 'Expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

  const pieData = Object.keys(expenseByCategory).map(key => ({
    name: key,
    value: expenseByCategory[key]
  }));

  const lastDaysData = {};
  transactions.forEach(t => {
    const d = t.date;
    if (!lastDaysData[d]) lastDaysData[d] = { date: d, Income: 0, Expense: 0 };
    lastDaysData[d][t.type] += Number(t.amount);
  });
  const barData = Object.values(lastDaysData).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-7);

  const walletBalances = (wallets || []).map(w => {
    const wTxs = transactions.filter(t => t.wallet === w.name);
    const inc = wTxs.filter(t => t.type === 'Income').reduce((s, t) => s + Number(t.amount), 0);
    const exp = wTxs.filter(t => t.type === 'Expense').reduce((s, t) => s + Number(t.amount), 0);
    return { name: w.name, balance: inc - exp };
  });

  // Calculate transactions without wallet (assigned to Dompet Utama initially)
  const defaultWalletName = "Dompet Utama";
  if (!walletBalances.find(w => w.name === defaultWalletName)) {
    const defaultTxs = transactions.filter(t => !t.wallet || t.wallet === defaultWalletName);
    if (defaultTxs.length > 0) {
      const inc = defaultTxs.filter(t => t.type === 'Income').reduce((s, t) => s + Number(t.amount), 0);
      const exp = defaultTxs.filter(t => t.type === 'Expense').reduce((s, t) => s + Number(t.amount), 0);
      walletBalances.push({ name: defaultWalletName, balance: inc - exp, isDefault: true });
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Saldo per Dompet</h2>
      <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {walletBalances.map((w, idx) => (
          <div key={idx} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="feed-icon" style={{ background: 'var(--primary-bg)', color: 'var(--primary)', width: '48px', height: '48px' }}>
              <CreditCard size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{w.name}</p>
              <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Rp {w.balance.toLocaleString('id-ID')}</h4>
            </div>
          </div>
        ))}
        {walletBalances.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Belum ada data dompet.</p>}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Ringkasan Keuangan</h2>
        <div className="grid-3">
          <div className="card summary-card">
            <span className="summary-title">Total Saldo</span>
            <span className="summary-value">Rp {balance.toLocaleString('id-ID')}</span>
          </div>
          <div className="card summary-card">
            <span className="summary-title">Pemasukan</span>
            <span className="summary-value income">Rp {totalIncome.toLocaleString('id-ID')}</span>
          </div>
          <div className="card summary-card">
            <span className="summary-title">Pengeluaran</span>
            <span className="summary-value expense">Rp {totalExpense.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginTop: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Arus Kas (7 Hari Terakhir)</h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} width={50} tickFormatter={(value) => value >= 1000 ? (value / 1000) + 'k' : value} />
                <RechartsTooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Income" fill="var(--success)" name="Pemasukan" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="var(--danger)" name="Pengeluaran" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Pengeluaran per Kategori</h3>
          <div style={{ height: 250 }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>Belum ada data pengeluaran</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TransactionsTab({ transactions, categories, wallets, onRefresh, isLoading }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txType, setTxType] = useState(null);

  // Filter States
  const [filterType, setFilterType] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPeriod, setFilterPeriod] = useState('All');

  // Custom Date Range States
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target;
    const tx = {
      date: form.elements.date.value,
      type: txType,
      amount: form.elements.amount.value,
      category: form.elements.category.value,
      wallet: form.elements.wallet.value,
      note: form.elements.note.value
    };

    try {
      await addTransaction(tx);
      form.reset();
      form.elements.date.value = new Date().toISOString().split('T')[0];
      setTxType(null);
      onRefresh();
    } catch (err) {
      alert("Gagal menambahkan transaksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus transaksi ini?")) return;
    try {
      await deleteTransaction(id);
      onRefresh();
    } catch (err) {
      alert("Gagal menghapus transaksi");
    }
  }

  const filteredCategories = categories.filter(c => c.type === txType);

  const txCategoryOptions = [
    { label: 'Pilih Kategori...', value: '' },
    ...filteredCategories.map(c => ({ label: c.name, value: c.name }))
  ];

  const txWalletOptions = [
    { label: 'Pilih Dompet...', value: '' },
    ...wallets.map(w => ({ label: w.name, value: w.name }))
  ];

  // Apply filters
  const now = new Date();
  const displayTransactions = transactions.filter(t => {
    if (filterType !== 'All' && t.type !== filterType) return false;
    if (filterCategory !== 'All' && t.category !== filterCategory) return false;

    if (filterPeriod !== 'All') {
      const d = new Date(t.date);
      if (isNaN(d.getTime())) return true;

      if (filterPeriod === 'Daily' && !isSameDay(d, now)) return false;
      if (filterPeriod === 'Weekly' && !isSameWeek(d, now, { weekStartsOn: 1 })) return false;
      if (filterPeriod === 'Monthly' && !isSameMonth(d, now)) return false;
      if (filterPeriod === 'Yearly' && !isSameYear(d, now)) return false;
      if (filterPeriod === 'Custom') {
        const tTime = d.getTime();
        const start = customStart ? new Date(customStart).getTime() : 0;
        const end = customEnd ? new Date(customEnd).getTime() + 86399999 : Infinity;
        if (tTime < start || tTime > end) return false;
      }
    }
    return true;
  });

  const typeOptions = [
    { label: 'Semua Tipe', value: 'All' },
    { label: 'Pemasukan', value: 'Income' },
    { label: 'Pengeluaran', value: 'Expense' }
  ];

  const categoryOptions = [
    { label: 'Semua Kategori', value: 'All' },
    ...categories.filter(c => filterType === 'All' || c.type === filterType).map(c => ({ label: c.name, value: c.name }))
  ];

  const periodOptions = [
    { label: 'Semua Waktu', value: 'All' },
    { label: 'Hari Ini', value: 'Daily' },
    { label: 'Minggu Ini', value: 'Weekly' },
    { label: 'Bulan Ini', value: 'Monthly' },
    { label: 'Tahun Ini', value: 'Yearly' },
    { label: 'Kustom (Pilih Tanggal)', value: 'Custom' }
  ];

  return (
    <div>
      <div className="card" style={{ position: 'relative', zIndex: 30 }}>
        <h2 style={{ marginBottom: '1rem' }}>Transaksi Baru</h2>

        {!txType ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button className="btn btn-primary" style={{ background: 'var(--success)', padding: '1rem' }} onClick={() => setTxType('Income')}>
              <Plus size={20} /> Pemasukan
            </button>
            <button className="btn btn-primary" style={{ background: 'var(--danger)', padding: '1rem' }} onClick={() => setTxType('Expense')}>
              <Plus size={20} /> Pengeluaran
            </button>
          </div>
        ) : (
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Tanggal</label>
              <GlassDatePicker name="date" required style={{ width: '100%' }} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Kategori ({txType === 'Income' ? 'Pemasukan' : 'Pengeluaran'})</label>
              <GlassSelect name="category" required options={txCategoryOptions} style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Dompet</label>
                <GlassSelect name="wallet" required options={txWalletOptions} style={{ width: '100%' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Jumlah (Rp)</label>
                <CurrencyInput name="amount" className="form-control" required />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Catatan (Opsional)</label>
              <input type="text" name="note" className="form-control" />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, background: txType === 'Income' ? 'var(--success)' : 'var(--danger)', borderColor: 'transparent' }} disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setTxType(null)}>Batal</button>
            </div>
          </form>
        )}
      </div>

      <div className="card" style={{ position: 'relative', zIndex: 20, padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Riwayat Transaksi</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <GlassSelect
              value={filterType}
              onChange={val => { setFilterType(val); setFilterCategory('All'); }}
              options={typeOptions}
            />

            <GlassSelect
              value={filterCategory}
              onChange={setFilterCategory}
              options={categoryOptions}
            />

            <GlassSelect
              value={filterPeriod}
              onChange={setFilterPeriod}
              options={periodOptions}
            />
          </div>

          {filterPeriod === 'Custom' && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--glass-bg)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <GlassDatePicker value={customStart} onChange={e => setCustomStart(e.target.value)} style={{ width: '140px' }} />
              <span style={{ color: 'var(--text-muted)' }}>s/d</span>
              <GlassDatePicker value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={{ width: '140px' }} />
            </div>
          )}
        </div>
      </div>

      {isLoading ? <p style={{ color: 'var(--text-muted)' }}>Memuat...</p> : (
        <div className="feed-list">
          {displayTransactions.map(t => (
            <div className="feed-item" key={t.id}>
              <div className="feed-item-left">
                <div className={`feed-icon ${t.type === 'Income' ? 'income' : 'expense'}`}>
                  {t.type === 'Income' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                </div>
                <div className="feed-details">
                  <h4>{t.category}</h4>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
                    {formatDate(t.date)}
                    {t.note ? `• ${t.note}` : ''}
                    {t.wallet && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: 'var(--primary)', fontWeight: 500 }}>
                        • <CreditCard size={12} /> {t.wallet}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="feed-item-right">
                <span className={`feed-amount ${t.type === 'Income' ? 'income' : 'expense'}`}>
                  {t.type === 'Income' ? '+' : '-'}Rp {Number(t.amount).toLocaleString('id-ID')}
                </span>
                <button className="btn" style={{ padding: '0.25rem', color: 'var(--danger)', background: 'transparent' }} onClick={() => handleDelete(t.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {displayTransactions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Belum ada transaksi sesuai filter</div>
          )}
        </div>
      )}
    </div>
  );
}

function CategoriesTab({ categories, onRefresh, isLoading }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target;
    const cat = {
      type: form.elements.type.value,
      name: form.elements.name.value
    };
    try {
      await addCategory(cat);
      form.reset();
      onRefresh();
    } catch (err) {
      alert("Gagal menambah kategori");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus kategori ini?")) return;
    try {
      await deleteCategory(id);
      onRefresh();
    } catch (err) {
      alert("Gagal menghapus kategori");
    }
  }

  return (
    <div>
      <div className="card">
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Tambah Kategori Baru</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Tipe Kategori</label>
            <GlassSelect
              name="type"
              required
              options={[
                { label: 'Pemasukan', value: 'Income' },
                { label: 'Pengeluaran', value: 'Expense' }
              ]}
              style={{ width: '100%' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Nama Kategori</label>
            <input type="text" name="name" className="form-control" placeholder="Contoh: Bensin, Uang Jajan..." required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Tambah Kategori'}
          </button>
        </form>
      </div>

      <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Daftar Kategori</h3>
      {isLoading ? <p style={{ color: 'var(--text-muted)' }}>Memuat...</p> : (
        <div className="category-layout">
          {/* Left: Pengeluaran */}
          <div className="category-section">
            <h4 style={{ marginBottom: '1rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowDownCircle size={18} /> Pengeluaran
            </h4>
            <div className="category-grid">
              {categories.filter(c => c.type === 'Expense').map(c => (
                <div className="feed-item" key={c.id} style={{ padding: '0.75rem 1rem' }}>
                  <div className="feed-item-left">
                    <div className="feed-icon expense" style={{ width: '36px', height: '36px' }}>
                      <Tags size={16} />
                    </div>
                    <div className="feed-details">
                      <h4 style={{ fontSize: '0.95rem' }}>{c.name}</h4>
                    </div>
                  </div>
                  <div className="feed-item-right">
                    <button className="btn" style={{ padding: '0.25rem', color: 'var(--danger)', background: 'transparent' }} onClick={() => handleDelete(c.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {categories.filter(c => c.type === 'Expense').length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Belum ada kategori pengeluaran</p>
              )}
            </div>
          </div>

          {/* Right: Pemasukan */}
          <div className="category-section">
            <h4 style={{ marginBottom: '1rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowUpCircle size={18} /> Pemasukan
            </h4>
            <div className="category-grid">
              {(Array.isArray(categories) ? categories : []).filter(c => c.type === 'Income').map(c => (
                <div className="feed-item" key={c.id} style={{ padding: '0.75rem 1rem' }}>
                  <div className="feed-item-left">
                    <div className="feed-icon income" style={{ width: '36px', height: '36px' }}>
                      <Tags size={16} />
                    </div>
                    <div className="feed-details">
                      <h4 style={{ fontSize: '0.95rem' }}>{c.name}</h4>
                    </div>
                  </div>
                  <div className="feed-item-right">
                    <button className="btn" style={{ padding: '0.25rem', color: 'var(--danger)', background: 'transparent' }} onClick={() => handleDelete(c.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {categories.filter(c => c.type === 'Income').length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Belum ada kategori pemasukan</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WalletsTab({ wallets, onRefresh, isLoading }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target;
    const wallet = {
      name: form.elements.name.value
    };
    try {
      await addWallet(wallet);
      form.reset();
      onRefresh();
    } catch (err) {
      alert("Gagal menambah dompet");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus dompet ini?")) return;
    try {
      await deleteWallet(id);
      onRefresh();
    } catch (err) {
      alert("Gagal menghapus dompet");
    }
  }

  return (
    <div>
      <div className="card">
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Tambah Dompet Baru</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Nama Dompet</label>
            <input type="text" name="name" className="form-control" placeholder="Contoh: Tunai, Bank BCA, OVO..." required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ background: 'var(--primary)' }} disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Tambah Dompet'}
          </button>
        </form>
      </div>

      <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Daftar Dompet</h3>
      {isLoading ? <p style={{ color: 'var(--text-muted)' }}>Memuat...</p> : (
        <div className="category-layout" style={{ gridTemplateColumns: '1fr' }}>
          <div className="category-section">
            <div className="category-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {(Array.isArray(wallets) ? wallets : []).map(w => (
                <div className="feed-item" key={w.id} style={{ padding: '0.75rem 1rem' }}>
                  <div className="feed-item-left">
                    <div className="feed-icon" style={{ width: '36px', height: '36px', background: 'var(--primary-bg)', color: 'var(--primary)' }}>
                      <CreditCard size={16} />
                    </div>
                    <div className="feed-details">
                      <h4 style={{ fontSize: '0.95rem' }}>{w.name}</h4>
                    </div>
                  </div>
                  <div className="feed-item-right">
                    <button className="btn" style={{ padding: '0.25rem', color: 'var(--danger)', background: 'transparent' }} onClick={() => handleDelete(w.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {wallets.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Belum ada dompet terdaftar.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DebtsTab({ debts, transactions, wallets, onRefresh, isLoading }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payingDebt, setPayingDebt] = useState(null); // stores the debt object when paying

  const handleAddDebt = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target;
    const debt = {
      name: form.elements.name.value,
      amount: form.elements.amount.value
    };
    try {
      await addDebt(debt);
      form.reset();
      onRefresh();
    } catch (err) {
      alert("Gagal mencatat hutang baru");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handlePayDebt = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target;
    const amount = Number(form.elements.amount.value);
    const wallet = form.elements.wallet.value;
    const date = form.elements.date.value;

    // Auto-create Category if not exists? For now we just use "Bayar Hutang"
    // In code.gs it will just accept any category string
    const tx = {
      date: date,
      type: 'Expense',
      amount: amount,
      category: 'Bayar Hutang',
      wallet: wallet,
      debt_id: payingDebt.id,
      note: `Pelunasan: ${payingDebt.name}`
    };

    try {
      await addTransaction(tx);
      setPayingDebt(null);
      onRefresh();
    } catch (err) {
      alert("Gagal memproses pembayaran");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDeleteDebt = async (id) => {
    if (!window.confirm("Hapus catatan hutang ini? (Transaksi pembayaran tidak akan terhapus)")) return;
    try {
      await deleteDebt(id);
      onRefresh();
    } catch (err) {
      alert("Gagal menghapus hutang");
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Catat Hutang Baru</h3>
        <form onSubmit={handleAddDebt} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
            <label>Nama Tempat / Peminjam</label>
            <input type="text" name="name" className="form-control" placeholder="Contoh: Koperasi, Kartu Kredit..." required />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
            <label>Total Hutang (Rp)</label>
            <CurrencyInput name="amount" className="form-control" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ background: 'var(--danger)', height: '42px', flexShrink: 0 }} disabled={isSubmitting}>
            {isSubmitting ? '...' : 'Tambah Hutang'}
          </button>
        </form>
      </div>

      <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Daftar Hutang Anda</h3>
      {isLoading ? <p style={{ color: 'var(--text-muted)' }}>Memuat...</p> : (
        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {(Array.isArray(debts) ? debts : []).map(debt => {
            const total = Number(debt.amount);
            // Calculate how much has been paid for this debt
            const paid = transactions
              .filter(t => t.debt_id === debt.id && t.type === 'Expense')
              .reduce((sum, t) => sum + Number(t.amount), 0);

            const remaining = total - paid;
            const progress = total > 0 ? Math.min(100, Math.max(0, (paid / total) * 100)) : 0;
            const isPaidOff = remaining <= 0;

            return (
              <div className="card" key={debt.id} style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{debt.name}</h4>
                    <span className={`badge ${isPaidOff ? 'income' : 'expense'}`}>
                      {isPaidOff ? 'LUNAS' : 'BELUM LUNAS'}
                    </span>
                  </div>
                  <button className="btn" style={{ padding: '0.25rem', color: 'var(--text-muted)', background: 'transparent' }} onClick={() => handleDeleteDebt(debt.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>
                    <span>Terbayar: Rp {paid.toLocaleString('id-ID')}</span>
                    <span>Total: Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="progress-bar-bg" style={{ width: '100%', height: '8px', background: 'var(--glass-border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div className="progress-bar-fill" style={{ width: `${progress}%`, height: '100%', background: isPaidOff ? 'var(--success)' : 'var(--primary)', transition: 'width 0.3s' }}></div>
                  </div>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', fontWeight: 600, color: isPaidOff ? 'var(--success)' : 'var(--danger)' }}>
                    Sisa: Rp {Math.max(0, remaining).toLocaleString('id-ID')}
                  </p>
                </div>

                {!isPaidOff && payingDebt?.id !== debt.id && (
                  <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setPayingDebt(debt)}>
                    Bayar Hutang Ini
                  </button>
                )}

                {payingDebt?.id === debt.id && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <h5 style={{ margin: '0 0 1rem 0' }}>Form Pembayaran</h5>
                    <form onSubmit={handlePayDebt} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Tanggal</label>
                        <GlassDatePicker name="date" required style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Ambil dari Dompet</label>
                        <GlassSelect
                          name="wallet"
                          required
                          options={[
                            { label: 'Pilih Dompet...', value: '' },
                            ...wallets.map(w => ({ label: w.name, value: w.name }))
                          ]}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Nominal (Rp)</label>
                        <CurrencyInput name="amount" className="form-control" defaultValue={remaining} required style={{ padding: '0.5rem' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.5rem' }} disabled={isSubmitting}>
                          {isSubmitting ? '...' : 'Bayar'}
                        </button>
                        <button type="button" className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={() => setPayingDebt(null)}>
                          Batal
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
          {(Array.isArray(debts) ? debts : []).length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', gridColumn: '1 / -1' }}>Belum ada catatan hutang.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
