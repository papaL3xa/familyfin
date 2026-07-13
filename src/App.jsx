import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { QRCodeCanvas } from 'qrcode.react';
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
  Shield,
  Edit,
  Printer,
  Moon,
  Sun,
  CheckCircle2,
  Zap,
  Download,
  Upload,
  Heart,
  LogIn
} from 'lucide-react';
import {
  fetchTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction,
  fetchCategories,
  addCategory,
  deleteCategory,
  fetchWallets,
  addWallet,
  deleteWallet,
  updateWallet,
  fetchDebts,
  addDebt,
  deleteDebt,
  updateDebt,
  registerUser,
  loginUser,
  approveUser,
  rejectUser,
  getPendingUsers,
  fetchActiveUsers,
  extendSubscription,
  toggleBlockUser,
  getConfig,
  updateConfig,
  registerFreeTrial
} from './services/api';
import { DEFAULT_API_URL } from './config';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, Legend
} from 'recharts';
import {
  format, isSameDay, isSameWeek, isSameMonth, isSameYear,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths
} from 'date-fns';
import './index.css';

// --- Custom Global Modal (Glassmorphism) ---
export const showCustomAlert = (message) => {
  return new Promise((resolve) => {
    window.dispatchEvent(new CustomEvent('show-modal', {
      detail: { type: 'alert', message, resolve }
    }));
  });
};

export const showCustomConfirm = (message) => {
  return new Promise((resolve) => {
    window.dispatchEvent(new CustomEvent('show-modal', {
      detail: { type: 'confirm', message, resolve }
    }));
  });
};

function GlobalModal() {
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    const handler = (e) => setModalData(e.detail);
    window.addEventListener('show-modal', handler);
    return () => window.removeEventListener('show-modal', handler);
  }, []);

  if (!modalData) return null;

  const handleClose = (result) => {
    if (modalData.resolve) modalData.resolve(result);
    setModalData(null);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, backdropFilter: 'blur(10px)', padding: '1rem', animation: 'fadeUp 0.3s ease-out' }}>
       <div className="card" style={{ maxWidth: '360px', width: '100%', textAlign: 'center', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', padding: '2rem 1.5rem', color: '#f8fafc' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            {modalData.type === 'alert' ? (
              <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '1rem', borderRadius: '50%' }}>
                <CheckCircle2 size={32} color="#818cf8" />
              </div>
            ) : (
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '50%' }}>
                <Zap size={32} color="#f87171" />
              </div>
            )}
          </div>
          <p style={{ fontSize: '1.05rem', marginBottom: '2rem', lineHeight: '1.6', fontWeight: '500', whiteSpace: 'pre-wrap' }}>{modalData.message}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
             {modalData.type === 'confirm' && (
                <button className="btn btn-outline" onClick={() => handleClose(false)} style={{ flex: 1, padding: '0.7rem', borderRadius: '14px', fontWeight: '600', color: '#94a3b8', borderColor: 'rgba(255,255,255,0.1)' }}>Batal</button>
             )}
             <button className="btn btn-primary" onClick={() => handleClose(true)} style={{ flex: 1, padding: '0.7rem', borderRadius: '14px', fontWeight: '600', background: 'var(--primary)', border: 'none', color: '#fff' }}>OK</button>
          </div>
       </div>
    </div>
  );
}
// -------------------------------------------

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const getQrisImgSrc = (url) => {
  if (url && url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/d\/(.*?)\//);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
    }
  }
  if (url && !url.startsWith('http')) {
    return `https://drive.google.com/thumbnail?id=${url}&sz=w1000`;
  }
  return url;
};

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
  const [promoConfig, setPromoConfig] = useState({ Promo_Message: '', Price_1Year: '', Price_Bundle: '', Price_Lifetime: '', Promo_FreeTest: 'true', Payment_QRIS_Data: '', Payment_AdminFee: '' });

  const [editMode, setEditMode] = useState({
    googleDrive: false,
    webAppUrl: false,
    promo: false,
    payment: false,
    activeUsers: false,
  });

  const toggleEdit = (section) => {
    setEditMode(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const [pending, active, configData] = await Promise.all([
        getPendingUsers(),
        fetchActiveUsers(),
        getConfig()
      ]);
      setPendingUsers(pending || []);
      setActiveUsers(active || []);
      if (configData && !configData.error) {
        setPromoConfig(configData);
        if (configData.Admin_Folder_ID) {
          setFolderId(configData.Admin_Folder_ID);
          localStorage.setItem('gas_folder_id', configData.Admin_Folder_ID);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveFolderId = async (e) => {
    e.preventDefault();
    setLoading(true);
    localStorage.setItem('gas_folder_id', folderId);
    try {
      await updateConfig({ Admin_Folder_ID: folderId });
      setMessage({ type: 'success', text: "Folder ID berhasil disimpan di sistem." });
    } catch (err) {
      setMessage({ type: 'error', text: "Gagal menyimpan Folder ID di server." });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
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
      setConfirmReject(null);
    }
  };

  const handleToggleBlock = async (email) => {
    if (!await showCustomConfirm(`Apakah Anda yakin ingin mengubah status blokir akun ${email}?`)) return;
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

  const handleSavePromo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await updateConfig(promoConfig);
      if (res.success) {
        setMessage({ type: 'success', text: "Pengaturan promosi berhasil disimpan!" });
        // Optionally reload config
      } else {
        setMessage({ type: 'error', text: res.error || "Gagal menyimpan promosi." });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Terjadi kesalahan saat menyimpan promosi." });
    } finally {
      setLoading(false);
    }
  };

  let daysLeft = null;
  if (currentUser?.expiry) {
    const expD = new Date(currentUser.expiry);
    const today = new Date();
    const diffTime = expD.getTime() - today.getTime();
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  const isExpiringSoon = (daysLeft !== null && daysLeft <= 5) || !!currentUser?.warning;
  const infoColor = isExpiringSoon ? '#dc2626' : 'var(--success)';

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Dasbor Admin</h2>
      
      {/* Account Info Box */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: isExpiringSoon ? 'rgba(239, 68, 68, 0.05)' : 'var(--glass-bg)', borderRadius: '12px', border: `1px solid ${isExpiringSoon ? '#dc2626' : 'var(--glass-border)'}` }}>
        <h3 style={{ margin: '0 0 1rem 0', color: infoColor }}>Akun Saat Ini</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
          <div style={{ color: infoColor }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{currentUser.email} (Admin)</p>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Masa Aktif: {currentUser.expiry ? new Date(currentUser.expiry).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Selamanya'}
              {daysLeft !== null && (
                <span style={{ display: 'block', marginTop: '0.25rem', fontWeight: 'bold' }}>
                  (Sisa {daysLeft} hari)
                </span>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={onLogout}>Keluar (Logout)</button>
          </div>
        </div>
      </div>

      {message && (
        <div style={{ padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', background: message.type === 'error' ? 'var(--danger-bg)' : 'var(--success-bg)', color: message.type === 'error' ? 'var(--danger)' : 'var(--success)' }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', alignItems: 'start', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Pengaturan Google Drive</h3>
          <button type="button" className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => toggleEdit('googleDrive')}>
            {editMode.googleDrive ? 'Batal' : 'Edit'}
          </button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Masukkan Folder ID tempat spreadsheet baru akan dibuat secara otomatis saat menyetujui pengguna.
        </p>
        <form onSubmit={handleSaveFolderId} style={{ display: 'flex', gap: '1rem' }}>
          <input type="text" className="form-control" value={folderId} onChange={e => setFolderId(e.target.value)} placeholder="Contoh: 1BxiMVs0XRY..." required style={{ flex: 1 }} disabled={!editMode.googleDrive} />
          {editMode.googleDrive && <button type="submit" className="btn btn-primary">Simpan</button>}
        </form>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Pengaturan Web App URL</h3>
          <button type="button" className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => toggleEdit('webAppUrl')}>
            {editMode.webAppUrl ? 'Batal' : 'Edit'}
          </button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Tautan Google Apps Script Anda. Ubah hanya jika Anda mendeploy ulang script dengan URL baru.
        </p>
        <form onSubmit={onSaveApiUrl} style={{ display: 'flex', gap: '1rem' }}>
          <input type="url" name="apiUrl" defaultValue={apiUrl} className="form-control" placeholder="https://script.google.com/macros/s/.../exec" required style={{ flex: 1 }} disabled={!editMode.webAppUrl} />
          {editMode.webAppUrl && (
            <button type="submit" className="btn btn-primary" onClick={() => {
              setMessage({ type: 'success', text: "Web App URL berhasil diperbarui." });
              setTimeout(() => setMessage(null), 3000);
            }}>Perbarui URL</button>
          )}
        </form>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Pengaturan Promosi & Harga</h3>
          <button type="button" className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => toggleEdit('promo')}>
            {editMode.promo ? 'Batal' : 'Edit'}
          </button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Ubah pesan sambutan dan daftar harga berlangganan yang akan muncul di layar awal.
        </p>
        <form onSubmit={handleSavePromo} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Pesan Sambutan Promosi</label>
            <textarea
              className="form-control"
              rows="3"
              value={promoConfig.Promo_Message || ''}
              onChange={e => setPromoConfig({ ...promoConfig, Promo_Message: e.target.value })}
              placeholder="Misal: Catat pengeluaran Anda dengan cerdas..."
              disabled={!editMode.promo}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Harga 1 Tahun</label>
              <input type="text" className="form-control" value={promoConfig.Price_1Year || ''} onChange={e => setPromoConfig({ ...promoConfig, Price_1Year: e.target.value })} placeholder="Rp 50.000" disabled={!editMode.promo} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Harga Bundling 2 Tahun</label>
              <input type="text" className="form-control" value={promoConfig.Price_Bundle || ''} onChange={e => setPromoConfig({ ...promoConfig, Price_Bundle: e.target.value })} placeholder="Rp 90.000 / 2 Tahun" disabled={!editMode.promo} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Harga Seumur Hidup</label>
              <input type="text" className="form-control" value={promoConfig.Price_Lifetime || ''} onChange={e => setPromoConfig({ ...promoConfig, Price_Lifetime: e.target.value })} placeholder="Rp 250.000" disabled={!editMode.promo} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              id="promoFreeTest"
              checked={promoConfig.Promo_FreeTest === 'true' || promoConfig.Promo_FreeTest === true}
              onChange={e => setPromoConfig({ ...promoConfig, Promo_FreeTest: e.target.checked ? 'true' : 'false' })}
              style={{ width: '1.2rem', height: '1.2rem' }}
              disabled={!editMode.promo}
            />
            <label htmlFor="promoFreeTest" style={{ cursor: 'pointer', userSelect: 'none', color: !editMode.promo ? 'var(--text-muted)' : 'inherit' }}>Tampilkan tombol "Coba Gratis 5 Hari"</label>
          </div>
          {editMode.promo && <button type="submit" className="btn btn-primary" disabled={loading}>Simpan Promosi</button>}
        </form>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Pengaturan Metode Pembayaran</h3>
          <button type="button" className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => toggleEdit('payment')}>
            {editMode.payment ? 'Batal' : 'Edit'}
          </button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Atur nomor rekening, e-wallet, dan QRIS yang akan ditampilkan saat pengguna membeli paket langganan.
        </p>
        <form onSubmit={handleSavePromo} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>No. DANA</label>
              <input type="text" className="form-control" value={promoConfig.Payment_DANA || ''} onChange={e => setPromoConfig({ ...promoConfig, Payment_DANA: e.target.value })} placeholder="0812xxxx" disabled={!editMode.payment} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>No. ShopeePay</label>
              <input type="text" className="form-control" value={promoConfig.Payment_SPay || ''} onChange={e => setPromoConfig({ ...promoConfig, Payment_SPay: e.target.value })} placeholder="0812xxxx" disabled={!editMode.payment} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>No. Rekening Mandiri</label>
              <input type="text" className="form-control" value={promoConfig.Payment_Mandiri || ''} onChange={e => setPromoConfig({ ...promoConfig, Payment_Mandiri: e.target.value })} placeholder="112xxxx" disabled={!editMode.payment} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>URL Gambar QRIS (Statis)</label>
              <input type="url" className="form-control" value={promoConfig.Payment_QRIS || ''} onChange={e => setPromoConfig({ ...promoConfig, Payment_QRIS: e.target.value })} placeholder="https://..." disabled={!editMode.payment} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Data Teks QRIS (Opsional untuk Dinamis)</label>
              <input type="text" className="form-control" value={promoConfig.Payment_QRIS_Data || ''} onChange={e => setPromoConfig({ ...promoConfig, Payment_QRIS_Data: e.target.value })} placeholder="000201010211..." disabled={!editMode.payment} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Biaya Admin (Opsional)</label>
              <input type="number" className="form-control" value={promoConfig.Payment_AdminFee || ''} onChange={e => setPromoConfig({ ...promoConfig, Payment_AdminFee: e.target.value })} placeholder="Contoh: 2500" disabled={!editMode.payment} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Link Saweria (Support Developer)</label>
              <input type="url" className="form-control" value={promoConfig.Support_Saweria || ''} onChange={e => setPromoConfig({ ...promoConfig, Support_Saweria: e.target.value })} placeholder="https://saweria.co/username" disabled={!editMode.payment} />
            </div>
          </div>
          {editMode.payment && <button type="submit" className="btn btn-primary" disabled={loading}>Simpan Metode Pembayaran</button>}
        </form>
      </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ margin: 0 }}>
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
                <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
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

        <div className="card" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Daftar Pengguna Aktif</h3>
            <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => toggleEdit('activeUsers')}>
              {editMode.activeUsers ? 'Selesai' : 'Edit'}
            </button>
          </div>
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
                <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
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
                  {editMode.activeUsers && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-outline" onClick={() => handleToggleBlock(u.email)} disabled={loading} style={{ borderColor: u.status === 'Blocked' ? 'var(--success)' : 'var(--warning)', color: u.status === 'Blocked' ? 'var(--success)' : 'var(--warning)' }}>
                        {u.status === 'Blocked' ? 'Buka Blokir' : 'Blokir'}
                      </button>
                      <button className="btn btn-primary" onClick={() => setExtendUser(u.email)} disabled={loading}>
                        Perpanjang
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

      {approveUserEmail && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, backdropFilter: 'blur(5px)', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: 'none' }}>
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

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', flexDirection: 'column' }}>
              {loading ? (
                <div style={{ padding: '1rem 0' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.5rem', textAlign: 'center', fontWeight: 'bold' }}>Sedang Membuat Spreadsheet & Sinkronisasi...</div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--glass-border)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      top: 0, bottom: 0,
                      background: 'var(--primary)',
                      width: '50%',
                      animation: 'progress-indeterminate 1.5s infinite linear',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setApproveUserEmail(null)}>Batal</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={executeApprove}>
                    Konfirmasi Setujui
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {extendUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, backdropFilter: 'blur(5px)', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: 'none' }}>
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
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setExtendUser(null)} disabled={loading}>Batal</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={executeExtend} disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmReject && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, backdropFilter: 'blur(5px)', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: 'none' }}>
            <h3 style={{ marginTop: 0 }}>Konfirmasi Penolakan</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Apakah Anda yakin ingin menolak dan menghapus pendaftaran <strong>{confirmReject}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setConfirmReject(null)} disabled={loading}>Batal</button>
              <button className="btn btn-primary" style={{ flex: 1, background: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => executeReject(confirmReject)} disabled={loading}>
                {loading ? 'Menolak...' : 'Tolak Pendaftaran'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AuthScreen({ onLoginSuccess, apiUrl, onSaveApiUrl, appConfig }) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [automationFee] = useState(Math.floor(Math.random() * 900) + 100);

  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    const num = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  const adminFee = appConfig?.Payment_AdminFee ? parseInt(appConfig.Payment_AdminFee, 10) : 0;
  
  let basePrice = 0;
  if (selectedPackage === '1 Tahun') basePrice = parsePrice(appConfig?.Price_1Year);
  else if (selectedPackage === 'Bundling (2 Tahun)') basePrice = parsePrice(appConfig?.Price_Bundle);
  else if (selectedPackage === 'Seumur Hidup') basePrice = parsePrice(appConfig?.Price_Lifetime);
  
  const totalPrice = basePrice + adminFee + automationFee;

  const handlePackageClick = (pkgName) => {
    setSelectedPackage(pkgName);
    setMessage(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!apiUrl) {
      setMessage({ type: 'error', text: 'Mohon atur URL API terlebih dahulu melalui menu Pengaturan di pojok kanan atas.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await loginUser(email);
      if (res.success) {
        onLoginSuccess(res);
      } else {
        setMessage({ type: 'error', text: res.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Terjadi kesalahan jaringan." });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!apiUrl) {
      setMessage({ type: 'error', text: 'Mohon atur URL API terlebih dahulu melalui menu Pengaturan di pojok kanan atas.' });
      return;
    }
    if (!agreed) {
      setMessage({ type: 'error', text: 'Anda harus menyetujui syarat & ketentuan untuk melanjutkan.' });
      return;
    }
    
    setLoading(true);
    setMessage(null);

    if (selectedPackage === 'Coba Gratis 5 Hari') {
      try {
        const res = await registerFreeTrial(email);
        if (res.success) {
          setMessage({ type: 'success', text: "Pendaftaran berhasil! Spreadsheet Free Test Anda telah dibuat. Silakan masuk." });
          setTimeout(() => { setIsLogin(true); setMessage(null); }, 3000);
        } else {
          setMessage({ type: 'error', text: res.error });
        }
      } catch (err) {
        setMessage({ type: 'error', text: "Terjadi kesalahan jaringan." });
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await registerUser(email, phone, selectedPackage);
      if (res.success) {
        setShowPayment(true);
      } else {
        setMessage({ type: 'error', text: res.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Terjadi kesalahan jaringan." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page" style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
      
      <div className="landing-split">
        {/* Left Side: Promotional Copywriting */}
        <div className="animate-fade-up">
          <div style={{ display: 'inline-block', padding: '0.5rem 1.25rem', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '100px', color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem', marginBottom: '1.5rem', letterSpacing: '0.5px' }}>
            🚀 #1 Aplikasi Keuangan Keluarga Indonesia
          </div>
          <h1 className="hero-title">Kelola Keuangan Keluarga Lebih Cerdas & Terkontrol</h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.7' }}>
            Catat pemasukan, pengeluaran, mutasi antar dompet, dan hutang-piutang keluarga Anda — semua <strong style={{ color: 'var(--text-main)' }}>otomatis tersimpan ke Google Sheets</strong> pribadi Anda. Aman, transparan, dan bisa diakses kapan saja.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
            <div className="feature-pill animate-fade-up delay-100">
              <div style={{ padding: '0.75rem', background: 'var(--success-bg)', borderRadius: '50%', color: 'var(--success)' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: '600' }}>Pencatatan Cepat & Akurat</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Input transaksi hanya dalam hitungan detik</div>
              </div>
            </div>
            <div className="feature-pill animate-fade-up delay-200">
              <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '50%', color: 'var(--primary)' }}>
                <Zap size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: '600' }}>Sinkronisasi Google Sheets</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Data langsung masuk ke spreadsheet pribadi Anda</div>
              </div>
            </div>
            <div className="feature-pill animate-fade-up delay-300">
              <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', borderRadius: '50%', color: 'var(--danger)' }}>
                <Shield size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: '600' }}>100% Aman & Transparan</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Data hanya di akun Google Anda, bukan di server kami</div>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', backdropFilter: 'var(--glass-blur)' }} className="animate-fade-up delay-300">
            <div style={{ display: 'flex' }}>
              {['😊','🤩','🥳'].map((e, i) => (
                <div key={i} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginLeft: i > 0 ? '-8px' : '0', border: '2px solid var(--glass-border)' }}>{e}</div>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Dipercaya oleh banyak keluarga</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ribuan transaksi tercatat setiap bulan</div>
            </div>
          </div>
        </div>
        
        {/* Right Side: Auth Form */}
        <div className="auth-box animate-fade-up delay-200" style={{ width: '100%', maxWidth: isLogin ? '450px' : '600px', margin: '0 auto', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '2.5rem', boxShadow: 'var(--glass-shadow)' }}>
          {message && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(5px)', padding: '1rem' }}>
              <div className="card" style={{ maxWidth: '350px', width: '100%', background: 'var(--glass-bg)', padding: '2rem', borderRadius: '16px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {message.type === 'error' ? '❌' : '✅'}
                </div>
                <h3 style={{ color: message.type === 'error' ? 'var(--danger)' : 'var(--success)', marginBottom: '1rem' }}>
                  {message.type === 'error' ? 'Terjadi Kesalahan' : 'Berhasil'}
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                  {message.text}
                </p>
                <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} onClick={() => setMessage(null)}>
                  Tutup
                </button>
              </div>
            </div>
          )}

          {isLogin ? (
            <>
              {appConfig?.Promo_Message && (
                <div style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '8px', color: 'var(--primary)', fontWeight: '600', fontSize: '0.95rem', lineHeight: '1.4' }}>
                  ✨ {appConfig.Promo_Message}
                </div>
              )}
              <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Masuk Akun</h2>
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: '500' }}>Email</label>
                  <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Budi@gmail.com" style={{ padding: '0.85rem' }} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem', padding: '0.85rem', fontSize: '1.05rem', fontWeight: '600' }}>
                  {loading ? 'Memproses...' : 'Masuk'}
                </button>
              </form>
              <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                Belum punya akun? <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => { setIsLogin(false); setMessage(null); }}>Daftar di sini</span>
              </p>
            </>
          ) : (
            <>
              <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Pilih Paket</h2>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                Sudah punya akun? <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => { setIsLogin(true); setMessage(null); setShowPayment(false); setSelectedPackage(null); }}>Masuk di sini</span>
              </p>

              {/* REGISTER CHECKOUT */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* PACKAGES SELECTOR */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  {appConfig && appConfig.Price_1Year && (
                    <div onClick={() => handlePackageClick('1 Tahun')} style={{ padding: '1rem', border: selectedPackage === '1 Tahun' ? '2px solid var(--primary)' : '1px solid var(--glass-border)', borderRadius: '12px', background: selectedPackage === '1 Tahun' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.05)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>1 Tahun</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{appConfig.Price_1Year}</div>
                    </div>
                  )}
                  {appConfig && appConfig.Price_Bundle && (
                    <div onClick={() => handlePackageClick('Bundling (2 Tahun)')} style={{ padding: '1rem', border: selectedPackage === 'Bundling (2 Tahun)' ? '2px solid var(--success)' : '1px solid var(--glass-border)', borderRadius: '12px', background: selectedPackage === 'Bundling (2 Tahun)' ? 'var(--success-bg)' : 'rgba(255, 255, 255, 0.05)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 'bold', color: 'var(--success)' }}>Bundle 2 Thn</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--success)' }}>{appConfig.Price_Bundle}</div>
                    </div>
                  )}
                  {appConfig && appConfig.Price_Lifetime && (
                    <div onClick={() => handlePackageClick('Seumur Hidup')} style={{ padding: '1rem', border: selectedPackage === 'Seumur Hidup' ? '2px solid var(--warning)' : '1px solid var(--glass-border)', borderRadius: '12px', background: selectedPackage === 'Seumur Hidup' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: '0', right: '0', background: 'var(--warning)', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold', padding: '0.15rem 0.6rem', borderRadius: '0 12px 0 8px' }}>BEST VALUE</div>
                      <div style={{ fontWeight: 'bold', color: 'var(--warning)' }}>Seumur Hidup</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--warning)' }}>{appConfig.Price_Lifetime}</div>
                    </div>
                  )}
                  {appConfig && (appConfig.Promo_FreeTest === 'true' || appConfig.Promo_FreeTest === true || appConfig.Promo_FreeTest === undefined) && (
                    <div onClick={() => handlePackageClick('Coba Gratis 5 Hari')} style={{ padding: '1rem', border: selectedPackage === 'Coba Gratis 5 Hari' ? '2px solid #8b5cf6' : '1px solid var(--glass-border)', borderRadius: '12px', background: selectedPackage === 'Coba Gratis 5 Hari' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 'bold', color: '#8b5cf6' }}>Trial</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#8b5cf6' }}>Gratis 5 Hari</div>
                    </div>
                  )}
                </div>

                {/* CHECKOUT DETAILS */}
                {selectedPackage && (
                  <form onSubmit={handleCheckoutSubmit} style={{ marginTop: '1rem' }}>
                    {selectedPackage !== 'Coba Gratis 5 Hari' && (
                      <div style={{ background: 'rgba(0,0,0,0.1)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Harga Dasar</span>
                          <span>Rp {basePrice.toLocaleString('id-ID')}</span>
                        </div>
                        {adminFee > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Biaya Admin</span>
                            <span>Rp {adminFee.toLocaleString('id-ID')}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Kode Unik</span>
                          <span>Rp {automationFee.toLocaleString('id-ID')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px dashed var(--glass-border)' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Total</span>
                          <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>Rp {totalPrice.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    )}

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email Pendaftaran</label>
                      <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Budi@gmail.com" />
                    </div>

                    {selectedPackage !== 'Coba Gratis 5 Hari' && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>No Handphone (WhatsApp)</label>
                        <input type="tel" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="08123456789" />
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '2rem' }}>
                      <input type="checkbox" id="agree" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: '0.25rem' }} />
                      <label htmlFor="agree" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', lineHeight: '1.4' }}>
                        Saya setuju dengan syarat dan ketentuan layanan FamilyFin, dan mengonfirmasi bahwa data yang saya masukkan adalah benar.
                      </label>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', fontWeight: '600' }} disabled={loading}>
                      {loading ? 'Memproses...' : (selectedPackage === 'Coba Gratis 5 Hari' ? 'Daftar Sekarang' : 'Lanjutkan Pembayaran')}
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Support Developer Section on Landing Page */}
      <div id="support-section" style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1a1a2e 100%)', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Header */}
          <div style={{ padding: '2.5rem 1.5rem 1.5rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', padding: '0.35rem 1rem', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '100px', color: '#818cf8', fontWeight: '600', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
              Support Developer
            </div>
            <h2 style={{ color: '#f8fafc', marginBottom: '0.75rem', fontSize: '1.6rem', fontWeight: '700', lineHeight: '1.3', fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
              Traktir Kopi Biar<br />Makin Semangat ☕
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6', maxWidth: '380px', margin: '0 auto' }}>
              Jika FamilyFin membantumu mengatur keuangan, dukunganmu sangat berarti untuk biaya operasional server kami.
            </p>
          </div>

          {/* Cards */}
          <div style={{ padding: '1rem 1.5rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem' }}>
            {/* Transfer Bank */}
            <div style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(52, 211, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={18} color="#34d399" />
                </div>
                <div>
                  <h4 style={{ color: '#f8fafc', margin: 0, fontSize: '0.95rem' }}>Transfer Bank</h4>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.7rem' }}>{appConfig?.Payment_Mandiri ? 'Bank Mandiri' : 'Bank Transfer'}</p>
                </div>
              </div>
              {appConfig?.Payment_Mandiri && (
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: '#64748b', margin: '0 0 0.2rem 0', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px' }}>NO. REKENING</p>
                    <p style={{ color: '#f8fafc', margin: 0, fontSize: '1rem', fontWeight: '700', letterSpacing: '2px', fontFamily: 'monospace' }}>{appConfig.Payment_Mandiri}</p>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(appConfig.Payment_Mandiri); showCustomAlert('Nomor rekening disalin!'); }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: '#94a3b8' }}>
                    <Edit size={14} />
                  </button>
                </div>
              )}
              {appConfig?.Payment_DANA && (
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: '#118ee9', margin: '0 0 0.2rem 0', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>DANA</p>
                    <p style={{ color: '#f8fafc', margin: 0, fontSize: '1rem', fontWeight: '700', letterSpacing: '2px', fontFamily: 'monospace' }}>{appConfig.Payment_DANA}</p>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(appConfig.Payment_DANA); showCustomAlert('Nomor DANA disalin!'); }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: '#94a3b8' }}>
                    <Edit size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* QRIS */}
            {appConfig?.Payment_QRIS && (
              <div style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Receipt size={18} color="#818cf8" />
                  </div>
                  <div>
                    <h4 style={{ color: '#f8fafc', margin: 0, fontSize: '0.95rem' }}>QRIS</h4>
                    <p style={{ color: '#64748b', margin: 0, fontSize: '0.7rem' }}>Scan untuk donasi</p>
                  </div>
                </div>
                <div style={{ background: '#fff', borderRadius: '12px', padding: '0.5rem', width: '100%', maxWidth: '180px' }}>
                  <img src={getQrisImgSrc(appConfig.Payment_QRIS)} alt="QRIS" style={{ width: '100%', borderRadius: '8px', display: 'block' }} />
                </div>
              </div>
            )}

            {/* Saweria */}
            <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', position: 'relative', overflow: 'hidden', minHeight: '180px' }}>
              <div style={{ position: 'absolute', top: '-25px', right: '-25px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ position: 'absolute', bottom: '-15px', right: '30px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <Receipt size={18} color="#fff" />
                </div>
                <h4 style={{ color: '#fff', margin: '0 0 0.35rem 0', fontSize: '0.95rem' }}>Saweria</h4>
                <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.8rem', lineHeight: '1.4' }}>Dukung lewat GoPay, OVO, Dana, atau QRIS.</p>
              </div>
              <a href={appConfig?.Support_Saweria || 'https://saweria.co/familyfin'} target="_blank" rel="noopener noreferrer" style={{ position: 'relative', zIndex: 1, display: 'block', textAlign: 'center', padding: '0.65rem', background: 'rgba(255,255,255,0.95)', color: '#ef4444', borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem', textDecoration: 'none', transition: 'transform 0.2s' }}>
                Buka Saweria ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      {showPayment && selectedPackage !== 'Coba Gratis 5 Hari' && (
        <PaymentModal 
          pkgName={selectedPackage} 
          appConfig={appConfig} 
          currentUser={{ email, phone }} 
          precalcAutomationFee={automationFee}
          onClose={() => setShowPayment(false)} 
        />
      )}
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
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('gas_api_url') || DEFAULT_API_URL);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [debts, setDebts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscriptionWarning, setSubscriptionWarning] = useState(null);
  const [appConfig, setAppConfig] = useState(null);

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

  useEffect(() => {
    if (apiUrl) {
      getConfig().then(data => {
        if (!data.error) setAppConfig(data);
      });
    }
  }, [apiUrl]);

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

  const handleBackup = () => {
    try {
      const wb = XLSX.utils.book_new();

      const wsTransactions = XLSX.utils.json_to_sheet(transactions.length ? transactions : [{ Catatan: "Belum ada transaksi" }]);
      XLSX.utils.book_append_sheet(wb, wsTransactions, "Transaksi");

      const wsWallets = XLSX.utils.json_to_sheet(wallets.length ? wallets : [{ Catatan: "Belum ada dompet" }]);
      XLSX.utils.book_append_sheet(wb, wsWallets, "Dompet");

      const wsDebts = XLSX.utils.json_to_sheet(debts.length ? debts : [{ Catatan: "Belum ada hutang" }]);
      XLSX.utils.book_append_sheet(wb, wsDebts, "Hutang");

      const wsCategories = XLSX.utils.json_to_sheet(categories.length ? categories : [{ Catatan: "Belum ada kategori" }]);
      XLSX.utils.book_append_sheet(wb, wsCategories, "Kategori");

      const dateStr = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `FamilyFin_Backup_${dateStr}.xlsx`);
    } catch (err) {
      console.error("Backup failed", err);
      showCustomAlert("Gagal melakukan backup data.");
    }
  };

  const handleBackupJSON = () => {
    try {
      const backupData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        email: currentUser?.email || 'unknown',
        data: {
          transactions,
          categories,
          wallets,
          debts
        }
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `FamilyFin_Backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('JSON Backup failed', err);
      showCustomAlert('Gagal melakukan backup JSON.');
    }
  };

  const handleRestoreJSON = async (file) => {
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      if (!backupData.data) {
        showCustomAlert('Format file backup tidak valid. Pastikan file berasal dari FamilyFin.');
        return;
      }

      const { transactions: txs, categories: cats, wallets: wals, debts: dbts } = backupData.data;
      let restored = { transactions: 0, categories: 0, wallets: 0, debts: 0 };
      let errors = [];

      // Restore categories first
      if (cats && cats.length > 0) {
        for (const cat of cats) {
          try {
            const existing = categories.find(c => c.name === cat.name && c.type === cat.type);
            if (!existing) {
              await addCategory({ name: cat.name, type: cat.type });
              restored.categories++;
            }
          } catch (e) { errors.push(`Kategori ${cat.name}: ${e.message}`); }
        }
      }

      // Restore wallets
      if (wals && wals.length > 0) {
        for (const wal of wals) {
          try {
            const existing = wallets.find(w => w.name === wal.name);
            if (!existing) {
              await addWallet({ name: wal.name, icon: wal.icon || '' });
              restored.wallets++;
            }
          } catch (e) { errors.push(`Dompet ${wal.name}: ${e.message}`); }
        }
      }

      // Restore transactions
      if (txs && txs.length > 0) {
        for (const tx of txs) {
          try {
            const existing = transactions.find(t => t.date === tx.date && t.type === tx.type && t.amount === tx.amount && t.note === tx.note);
            if (!existing) {
              await addTransaction({ date: tx.date, type: tx.type, amount: tx.amount, category: tx.category, wallet: tx.wallet, note: tx.note || '' });
              restored.transactions++;
            }
          } catch (e) { errors.push(`Transaksi: ${e.message}`); }
        }
      }

      // Restore debts
      if (dbts && dbts.length > 0) {
        for (const debt of dbts) {
          try {
            const existing = debts.find(d => d.name === debt.name && d.amount === debt.amount);
            if (!existing) {
              await addDebt({ name: debt.name, amount: debt.amount, type: debt.type, note: debt.note || '', dueDate: debt.dueDate || '' });
              restored.debts++;
            }
          } catch (e) { errors.push(`Hutang ${debt.name}: ${e.message}`); }
        }
      }

      await loadData();

      let msg = `✅ Restore selesai!\n\n`;
      msg += `📦 ${restored.transactions} transaksi dipulihkan\n`;
      msg += `📂 ${restored.categories} kategori dipulihkan\n`;
      msg += `💰 ${restored.wallets} dompet dipulihkan\n`;
      msg += `📝 ${restored.debts} hutang dipulihkan`;
      if (errors.length > 0) {
        msg += `\n\n⚠️ ${errors.length} item gagal dipulihkan.`;
      }
      showCustomAlert(msg);
    } catch (err) {
      console.error('Restore failed', err);
      showCustomAlert('Gagal restore data. Pastikan format file JSON benar.');
    }
  };

  return (
    <div className="app-layout">
      <GlobalModal />
      {/* Top Header */}
      <header className="top-header" style={!currentUser ? { justifyContent: 'center' } : {}}>
        <div style={!currentUser ? { maxWidth: '1200px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } : { display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          
          <div className={!currentUser ? '' : 'header-brand'} style={!currentUser ? { display: 'flex', alignItems: 'center', gap: '0.75rem' } : {}}>
            {currentUser ? (
              <>
                <Wallet size={24} color="#6366f1" />
                <span>FamilyFin</span>
              </>
            ) : (
              <>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={18} color="#a3e635" />
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>FamilyFin</span>
              </>
            )}
          </div>

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="header-nav">
                {currentUser.spreadsheetId && (
                  <>
                    <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
                      <Home size={18} /> Beranda
                    </div>
                    <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                      <LayoutDashboard size={18} /> Statistik
                    </div>
                    <div className={`nav-item ${activeTab === 'debts' ? 'active' : ''}`} onClick={() => setActiveTab('debts')}>
                      <Receipt size={18} /> Hutang
                    </div>
                    <div className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>
                      <ArrowRightLeft size={18} /> Transaksi
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
              <div className="theme-switch-header" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </div>
            </div>
          ) : (
            <div className="header-actions">
              <button className="btn btn-outline header-btn btn-support" onClick={() => { document.getElementById('support-section')?.scrollIntoView({ behavior: 'smooth' }); }}>
                <Heart size={18} color="#ef4444" /> <span className="btn-text">Dukung Dev</span>
              </button>
              <button className="btn btn-outline header-btn" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); document.querySelector('input[type="email"]')?.focus(); }}>
                <LogIn size={18} color="#6366f1" /> <span className="btn-text">Masuk</span>
              </button>
              <button className="btn btn-primary header-btn" style={{ background: '#1e293b', border: 'none', color: '#fff' }} onClick={() => showCustomAlert("Panduan Install WebApp (PWA):\n\n🍏 iOS (Safari):\n1. Tap icon Share (Bagikan) di bawah layar\n2. Scroll ke bawah, pilih 'Add to Home Screen'\n\n🤖 Android (Chrome):\n1. Tap menu titik tiga di pojok kanan atas\n2. Pilih 'Install app' atau 'Add to Home screen'")}>
                <Download size={18} color="#a3e635" /> <span className="btn-text">App (PWA)</span>
              </button>
              <div className="theme-switch-header" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </div>
              {!apiUrl && (
                <div className="settings-btn-header" onClick={() => setShowSettings(true)}>
                  <Settings size={18} />
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content" style={!currentUser ? { padding: 0, maxWidth: 'none' } : {}}>
        {subscriptionWarning && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: '2px solid #dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.2)', gap: '1rem' }}>
            <span style={{ fontSize: '1rem', flex: 1 }}><strong>Perhatian:</strong> {subscriptionWarning}</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" style={{ background: '#dc2626', borderColor: '#dc2626', padding: '0.25rem 0.5rem', fontSize: '0.8rem', fontWeight: 'bold' }} onClick={() => setActiveTab('settings')}>Perpanjang Sekarang</button>
              <button className="btn btn-outline" style={{ borderColor: '#dc2626', color: '#dc2626', background: 'transparent', padding: '0.25rem 0.5rem', fontSize: '0.8rem', fontWeight: 'bold' }} onClick={handleBackup} onMouseEnter={e => { e.target.style.background = '#dc2626'; e.target.style.color = 'white'; }} onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#dc2626'; }}>Backup Data</button>
            </div>
          </div>
        )}
        {error && (
          <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {!currentUser ? (
          <AuthScreen onLoginSuccess={handleLoginSuccess} apiUrl={apiUrl} onSaveApiUrl={handleSaveApiUrl} appConfig={appConfig} />
        ) : (
          <>
            {activeTab === 'admin' && currentUser.role === 'admin' && <AdminDashboard currentUser={currentUser} onLogout={handleLogout} apiUrl={apiUrl} onSaveApiUrl={handleSaveApiUrl} />}
            {activeTab === 'home' && <HomeTab setActiveTab={setActiveTab} appConfig={appConfig} />}
            {activeTab === 'dashboard' && <DashboardTab transactions={transactions} wallets={wallets} isLoading={isLoading} />}
            {activeTab === 'transactions' && <TransactionsTab transactions={transactions} categories={categories} wallets={wallets} onRefresh={loadData} isLoading={isLoading} />}
            {activeTab === 'debts' && <DebtsTab debts={debts} transactions={transactions} wallets={wallets} onRefresh={loadData} isLoading={isLoading} />}
            {activeTab === 'settings' && (
              <SettingsTab
                currentUser={currentUser}
                appConfig={appConfig}
                handleLogout={handleLogout}
                categories={categories}
                wallets={wallets}
                loadData={loadData}
                isLoading={isLoading}
                handleBackup={handleBackup}
                handleBackupJSON={handleBackupJSON}
                handleRestoreJSON={handleRestoreJSON}
              />
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      {currentUser && (
        <nav className="bottom-nav">
          {currentUser.spreadsheetId && (
            <>
              <div className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
                <Home size={22} />
                <span>Beranda</span>
              </div>
              <div className={`bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                <LayoutDashboard size={22} />
                <span>Statistik</span>
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
            </>
          )}

          {currentUser.role === 'admin' && (
            <div className={`bottom-nav-item ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
              <Shield size={22} />
              <span>Admin</span>
            </div>
          )}

          {currentUser.spreadsheetId && (
            <div className={`bottom-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
              <User size={22} />
              <span>Pengaturan</span>
            </div>
          )}
        </nav>
      )}

      {showSettings && !currentUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ marginTop: 0 }}>Pengaturan Admin</h3>
            <form onSubmit={(e) => { handleSaveApiUrl(e); setShowSettings(false); }}>
              <div className="form-group">
                <label>Web App URL</label>
                <input type="url" name="apiUrl" defaultValue={apiUrl} className="form-control" required placeholder="https://script.google.com/macros/s/.../exec" />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Simpan</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowSettings(false)}>Tutup</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Tabs Components ---

function HomeTab({ setActiveTab, appConfig }) {
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

      {/* Support Developer Section */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1a1a2e 100%)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)', marginTop: '2rem' }}>
        <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', padding: '0.35rem 1rem', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '100px', color: '#818cf8', fontWeight: '600', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
            Support Developer
          </div>
          <h2 style={{ color: '#f8fafc', marginBottom: '0.75rem', fontSize: '1.6rem', fontWeight: '700', lineHeight: '1.3', fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
            Traktir Kopi Biar<br />Makin Semangat ☕
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '380px', margin: '0 auto' }}>
            Jika FamilyFin membantumu mengatur keuangan, dukunganmu sangat berarti untuk biaya operasional server kami.
          </p>
        </div>

        <div style={{ padding: '1rem 1.5rem 2rem', background: 'linear-gradient(135deg, #111827 0%, #1e1e2f 100%)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem' }}>
          {/* Transfer Bank */}
          <div style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(52, 211, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={20} color="#34d399" />
              </div>
              <div>
                <h4 style={{ color: '#f8fafc', margin: 0, fontSize: '1.1rem' }}>Transfer Bank</h4>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.8rem' }}>{appConfig?.Payment_Mandiri ? 'Bank Mandiri' : 'Bank Transfer'}</p>
              </div>
            </div>
            {appConfig?.Payment_Mandiri && (
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#64748b', margin: '0 0 0.35rem 0', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>NO. REKENING</p>
                  <p style={{ color: '#f8fafc', margin: 0, fontSize: '1.2rem', fontWeight: '700', letterSpacing: '2px', fontFamily: 'monospace' }}>{appConfig.Payment_Mandiri}</p>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(appConfig.Payment_Mandiri); showCustomAlert('Nomor rekening disalin!'); }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', color: '#94a3b8' }}>
                  <Edit size={16} />
                </button>
              </div>
            )}
            {appConfig?.Payment_DANA && (
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#118ee9', margin: '0 0 0.35rem 0', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>DANA</p>
                  <p style={{ color: '#f8fafc', margin: 0, fontSize: '1.1rem', fontWeight: '700', letterSpacing: '2px', fontFamily: 'monospace' }}>{appConfig.Payment_DANA}</p>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(appConfig.Payment_DANA); showCustomAlert('Nomor DANA disalin!'); }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', color: '#94a3b8' }}>
                  <Edit size={16} />
                </button>
              </div>
            )}
            {appConfig?.Payment_SPay && (
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#ee4d2d', margin: '0 0 0.35rem 0', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>SHOPEEPAY</p>
                  <p style={{ color: '#f8fafc', margin: 0, fontSize: '1.1rem', fontWeight: '700', letterSpacing: '2px', fontFamily: 'monospace' }}>{appConfig.Payment_SPay}</p>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(appConfig.Payment_SPay); showCustomAlert('Nomor ShopeePay disalin!'); }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', color: '#94a3b8' }}>
                  <Edit size={16} />
                </button>
              </div>
            )}
          </div>

          {/* QRIS */}
          {appConfig?.Payment_QRIS && (
            <div style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Receipt size={20} color="#818cf8" />
                </div>
                <div>
                  <h4 style={{ color: '#f8fafc', margin: '0 0 0.15rem 0', fontSize: '1rem' }}>QRIS</h4>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.75rem' }}>Scan untuk donasi via e-wallet</p>
                </div>
              </div>
              <div style={{ background: '#fff', borderRadius: '12px', padding: '0.75rem', width: '100%', maxWidth: '220px' }}>
                <img src={getQrisImgSrc(appConfig.Payment_QRIS)} alt="QRIS" style={{ width: '100%', borderRadius: '8px', display: 'block' }} />
              </div>
              <p style={{ color: '#64748b', fontSize: '0.75rem', textAlign: 'center', margin: 0 }}>Scan QR di atas dengan aplikasi e-wallet favorit Anda</p>
            </div>
          )}

          {/* Saweria */}
          <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', position: 'relative', overflow: 'hidden', minHeight: '200px' }}>
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ position: 'absolute', bottom: '-20px', right: '40px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Receipt size={20} color="#fff" />
              </div>
              <h4 style={{ color: '#fff', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Saweria / QRIS</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.85rem', lineHeight: '1.5' }}>Dukung dengan mudah lewat GoPay, OVO, Dana, atau QRIS. Mulai dari Rp 10.000 saja.</p>
            </div>
            <a href={appConfig?.Support_Saweria || 'https://saweria.co/familyfin'} target="_blank" rel="noopener noreferrer" style={{ position: 'relative', zIndex: 1, display: 'block', textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.95)', color: '#ef4444', borderRadius: '12px', fontWeight: '700', fontSize: '0.95rem', textDecoration: 'none', transition: 'transform 0.2s' }}>
              Buka Saweria ↗
            </a>
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
    return { name: w.name, balance: inc - exp, icon: w.icon };
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
            <div className="feed-icon" style={{ background: 'var(--primary-bg)', color: 'var(--primary)', width: '48px', height: '48px', overflow: 'hidden' }}>
              {w.icon ? (
                <img src={w.icon} alt={w.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <CreditCard size={24} />
              )}
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


function generateSerialNumber(transaction) {
  const type = transaction.type;
  let prefix = 'TRX';
  if (type === 'Income') prefix = 'INC';
  else if (type === 'Expense') prefix = 'EXP';
  else if (type === 'Transfer' || type === 'Mutasi') prefix = 'MUT';
  else if (type === 'Debt' || type === 'Hutang') prefix = 'HUT';
  
  return `${prefix}-${transaction.id}`;
}

function ReceiptModal({ transaction, onClose }) {
  if (!transaction) return null;
  const serialNumber = generateSerialNumber(transaction);
  
  return (
    <>
      <div className="modal-overlay no-print" style={{ zIndex: 9999 }}>
        <div className="modal-content" style={{ maxWidth: '400px', width: '90%' }}>
        <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Cetak Bukti Transaksi</h3>
        
        <div className="receipt-container" style={{ padding: '1.5rem', background: '#fff', border: '1px dashed #ccc', borderRadius: '8px', marginBottom: '1.5rem', color: '#1A1A1A' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: '2px dashed #eee', paddingBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>FamilyFin</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>BUKTI TRANSAKSI</p>
          </div>
          
          <div style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#666' }}>No. Seri:</span>
              <span style={{ fontWeight: 'bold' }}>{serialNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#666' }}>Tanggal:</span>
              <span>{transaction.date}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#666' }}>Jenis:</span>
              <span>{transaction.type === 'Income' ? 'Pemasukan' : transaction.type === 'Expense' ? 'Pengeluaran' : transaction.type}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#666' }}>Kategori:</span>
              <span>{transaction.category}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#666' }}>Dompet:</span>
              <span>{transaction.wallet}</span>
            </div>
            {transaction.notes && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#666' }}>Keterangan:</span>
                <span style={{ textAlign: 'right', maxWidth: '60%' }}>{transaction.notes}</span>
              </div>
            )}
          </div>
          
          <div style={{ borderTop: '2px dashed #eee', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>Total:</span>
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Rp {parseInt(transaction.amount).toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="modal-actions" style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={onClose} style={{ flex: 1 }}>Tutup</button>
          <button className="btn btn-primary" onClick={() => window.print()} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Printer size={18} /> Cetak
          </button>
        </div>
      </div>
      
      <div id="print-root" className="print-only">
        <div style={{ padding: '2rem', color: 'black', fontFamily: 'monospace', maxWidth: '80mm', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: '1px dashed black', paddingBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '24px' }}>FamilyFin</h2>
            <p style={{ margin: 0, fontSize: '14px' }}>BUKTI TRANSAKSI</p>
          </div>
          
          <div style={{ marginBottom: '1rem', fontSize: '14px', lineHeight: '1.5' }}>
            <div><strong>No. Seri:</strong> {serialNumber}</div>
            <div><strong>Tanggal:</strong> {transaction.date}</div>
            <div><strong>Jenis:</strong> {transaction.type === 'Income' ? 'Pemasukan' : transaction.type === 'Expense' ? 'Pengeluaran' : transaction.type}</div>
            <div><strong>Kategori:</strong> {transaction.category}</div>
            <div><strong>Dompet:</strong> {transaction.wallet}</div>
            {transaction.notes && <div><strong>Ket:</strong> {transaction.notes}</div>}
          </div>
          
          <div style={{ borderTop: '1px dashed black', paddingTop: '1rem', fontSize: '16px' }}>
            <div><strong>Total:</strong> Rp {parseInt(transaction.amount).toLocaleString('id-ID')}</div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '12px' }}>
            Terima kasih telah menggunakan FamilyFin.
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

function TransactionsTab({ transactions, categories, wallets, onRefresh, isLoading }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txType, setTxType] = useState(null);
  const [editingTx, setEditingTx] = useState(null);
  const [printingTransaction, setPrintingTransaction] = useState(null);
  const [receiptData, setReceiptData] = useState(null);

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

    try {
      if (txType === 'Transfer') {
        const amount = form.elements.amount.value;
        const fromWallet = form.elements.fromWallet.value;
        const toWallet = form.elements.toWallet.value;
        const note = form.elements.note.value;
        const date = form.elements.date.value;
        
        if (fromWallet === toWallet) {
          showCustomAlert("Dompet asal dan tujuan tidak boleh sama");
          setIsSubmitting(false);
          return;
        }

        const trxId = 'MUT-' + Date.now().toString().slice(-6);
        const fullNote = note ? `[${trxId}] ${note}` : `[${trxId}] Mutasi`;

        await addTransaction({ date, type: 'Expense', amount, category: 'Mutasi Keluar', wallet: fromWallet, note: `${fullNote} ke ${toWallet}` });
        await addTransaction({ date, type: 'Income', amount, category: 'Mutasi Masuk', wallet: toWallet, note: `${fullNote} dari ${fromWallet}` });

        setReceiptData({ trxId, date, fromWallet, toWallet, amount, note: note || 'Mutasi Dompet' });
        
      } else {
        const tx = {
          date: form.elements.date.value,
          type: txType,
          amount: form.elements.amount.value,
          category: form.elements.category.value,
          wallet: form.elements.wallet.value,
          note: form.elements.note.value
        };
        await addTransaction(tx);
      }
      
      form.reset();
      form.elements.date.value = new Date().toISOString().split('T')[0];
      setTxType(null);
      onRefresh();
    } catch (err) {
      showCustomAlert("Gagal menambahkan transaksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTx = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target;
    const tx = {
      id: editingTx.id,
      date: form.elements.date.value,
      type: editingTx.type,
      amount: form.elements.amount.value,
      category: form.elements.category.value,
      wallet: form.elements.wallet.value,
      note: form.elements.note.value
    };

    try {
      await updateTransaction(tx);
      setEditingTx(null);
      onRefresh();
    } catch (err) {
      showCustomAlert("Gagal memperbarui transaksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!await showCustomConfirm("Hapus transaksi ini?")) return;
    try {
      await deleteTransaction(id);
      onRefresh();
    } catch (err) {
      showCustomAlert("Gagal menghapus transaksi");
    }
  }

  const filteredCategories = categories.filter(c => c.type === txType);

  const getWalletBalance = (walletName) => {
    let balance = 0;
    if (transactions && transactions.length > 0) {
      transactions.forEach(t => {
        if (t.wallet === walletName) {
          if (t.type === 'Income') balance += Number(t.amount || 0);
          else if (t.type === 'Expense') balance -= Number(t.amount || 0);
        }
      });
    }
    return balance;
  };

  const txCategoryOptions = [
    { label: 'Pilih Kategori...', value: '' },
    ...filteredCategories.map(c => ({ label: c.name, value: c.name }))
  ];

  const txWalletOptions = [
    { label: 'Pilih Dompet...', value: '' },
    ...wallets.map(w => {
      const bal = getWalletBalance(w.name);
      return { label: `${w.name} (Rp ${bal.toLocaleString('id-ID')})`, value: w.name };
    })
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
            <button className="btn btn-primary" style={{ background: 'var(--success)', padding: '1rem' }} onClick={() => setTxType('Income')}>
              <Plus size={20} /> Pemasukan
            </button>
            <button className="btn btn-primary" style={{ background: 'var(--danger)', padding: '1rem' }} onClick={() => setTxType('Expense')}>
              <Plus size={20} /> Pengeluaran
            </button>
            <button className="btn btn-primary" style={{ background: '#0ea5e9', padding: '1rem', borderColor: '#0ea5e9' }} onClick={() => setTxType('Transfer')}>
              <ArrowRightLeft size={20} /> Mutasi
            </button>
          </div>
        ) : txType === 'Transfer' ? (
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Tanggal</label>
              <GlassDatePicker name="date" required style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Dari Dompet</label>
                <GlassSelect name="fromWallet" required options={txWalletOptions} style={{ width: '100%' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Ke Dompet</label>
                <GlassSelect name="toWallet" required options={txWalletOptions} style={{ width: '100%' }} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Jumlah (Rp)</label>
              <CurrencyInput name="amount" className="form-control" required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Catatan (Opsional)</label>
              <input type="text" name="note" className="form-control" placeholder="Contoh: Pindah dana darurat" />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, background: '#0ea5e9', borderColor: 'transparent' }} disabled={isSubmitting}>
                {isSubmitting ? 'Memproses...' : 'Proses Mutasi'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setTxType(null)}>Batal</button>
            </div>
          </form>
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
              <div className="feed-item-right" style={{ flexDirection: 'row', gap: '0.25rem', alignItems: 'center' }}>
                <span className={`feed-amount ${t.type === 'Income' ? 'income' : 'expense'}`} style={{ marginRight: '0.5rem' }}>
                  {t.type === 'Income' ? '+' : '-'}Rp {Number(t.amount).toLocaleString('id-ID')}
                </span>
                <button className="btn" style={{ padding: '0.25rem', color: '#10b981', background: 'transparent' }} onClick={() => setPrintingTransaction(t)}>
                  <Printer size={16} />
                </button>
                <button className="btn" style={{ padding: '0.25rem', color: 'var(--primary)', background: 'transparent' }} onClick={() => setEditingTx(t)}>
                  <Edit size={16} />
                </button>
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

      {editingTx && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Edit Transaksi</h3>
            <form onSubmit={handleUpdateTx} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Tanggal</label>
                <GlassDatePicker name="date" required style={{ width: '100%' }} defaultValue={editingTx.date} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Kategori</label>
                <GlassSelect name="category" required defaultValue={editingTx.category} options={
                  categories.filter(c => c.type === editingTx.type).map(c => ({ label: c.name, value: c.name }))
                } style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Dompet</label>
                  <GlassSelect name="wallet" required defaultValue={editingTx.wallet} options={
                    (wallets && wallets.length > 0) ? wallets.map(w => ({ label: w.name, value: w.name })) : [{ label: 'Dompet Utama', value: 'Dompet Utama' }]
                  } style={{ width: '100%' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Jumlah (Rp)</label>
                  <CurrencyInput name="amount" className="form-control" required defaultValue={editingTx.amount} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Catatan (Opsional)</label>
                <input type="text" name="note" className="form-control" defaultValue={editingTx.note} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: editingTx.type === 'Income' ? 'var(--success)' : 'var(--danger)', borderColor: 'transparent' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setEditingTx(null)} style={{ flex: 1 }}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {receiptData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(5px)', padding: '1rem' }} className="receipt-overlay">
          <div className="card receipt-card" style={{ maxWidth: '400px', width: '100%', background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: 'none' }}>
            
            {/* The Print Area */}
            <div className="receipt-print-area" style={{ fontFamily: 'monospace', color: '#000', marginBottom: '1.5rem', border: '1px dashed #ccc', padding: '1rem', background: '#fff' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', textTransform: 'uppercase' }}>FamilyFin</h2>
                <div style={{ fontSize: '0.8rem' }}>Tanda Terima Mutasi</div>
              </div>
              
              <div style={{ borderBottom: '1px dashed #000', margin: '0.5rem 0' }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span>ID:</span>
                <span>{receiptData.trxId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span>Tanggal:</span>
                <span>{receiptData.date}</span>
              </div>
              
              <div style={{ borderBottom: '1px dashed #000', margin: '0.5rem 0' }}></div>
              
              <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <strong>Dari:</strong> {receiptData.fromWallet}
              </div>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <strong>Ke:</strong> {receiptData.toWallet}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 'bold', margin: '1rem 0' }}>
                <span>TOTAL:</span>
                <span>Rp {parseInt(receiptData.amount.replace(/\\D/g, '') || '0').toLocaleString('id-ID')}</span>
              </div>
              
              <div style={{ fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                Catatan: {receiptData.note}
              </div>
              
              <div style={{ borderBottom: '1px dashed #000', margin: '0.5rem 0' }}></div>
              <div style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '1rem' }}>
                Terima kasih
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }} className="no-print">
              <button className="btn btn-primary" onClick={() => window.print()} style={{ flex: 1 }}>
                Cetak Struk
              </button>
              <button className="btn btn-outline" onClick={() => setReceiptData(null)} style={{ flex: 1 }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generic Transaction Receipt Modal */}
      <ReceiptModal transaction={printingTransaction} onClose={() => setPrintingTransaction(null)} />
    </div>
  );
}

function CategoriesTab({ categories, onRefresh, isLoading }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target;
    const cat = {
      type: form.elements.type.value,
      name: form.elements.name.value
    };
    try {
      if (editingCategory) {
        await deleteCategory(editingCategory.id);
        await addCategory(cat);
        setEditingCategory(null);
      } else {
        await addCategory(cat);
      }
      form.reset();
      onRefresh();
    } catch (err) {
      showCustomAlert(editingCategory ? "Gagal memperbarui kategori" : "Gagal menambah kategori");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDelete = async (id) => {
    if (!await showCustomConfirm("Hapus kategori ini?")) return;
    try {
      await deleteCategory(id);
      onRefresh();
    } catch (err) {
      showCustomAlert("Gagal menghapus kategori");
    }
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', margin: 0 }}>{editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h3>
          {editingCategory && (
            <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => { setEditingCategory(null); document.getElementById('category-form').reset(); }}>
              Batal Edit
            </button>
          )}
        </div>
        <form id="category-form" onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
            {isSubmitting ? 'Menyimpan...' : (editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori')}
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
                  <div className="feed-item-right" style={{ flexDirection: 'row' }}>
                    <button className="btn" style={{ padding: '0.25rem', color: 'var(--primary)', background: 'transparent' }} onClick={() => { setEditingCategory(c); const form = document.getElementById('category-form'); form.elements.type.value = c.type; form.elements.name.value = c.name; window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                      <Edit size={16} />
                    </button>
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
                  <div className="feed-item-right" style={{ flexDirection: 'row' }}>
                    <button className="btn" style={{ padding: '0.25rem', color: 'var(--primary)', background: 'transparent' }} onClick={() => { setEditingCategory(c); const form = document.getElementById('category-form'); form.elements.type.value = c.type; form.elements.name.value = c.name; window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                      <Edit size={16} />
                    </button>
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
  const [iconBase64, setIconBase64] = useState("");
  const [editingWallet, setEditingWallet] = useState(null);
  const [editIconBase64, setEditIconBase64] = useState("");

  const handleImageChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) {
      isEdit ? setEditIconBase64("") : setIconBase64("");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        // Max dimensions 100x100
        const MAX_SIZE = 100;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height *= MAX_SIZE / width));
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width *= MAX_SIZE / height));
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        // Compress heavily as it's just a tiny icon
        const dataUrl = canvas.toDataURL("image/webp", 0.7);
        isEdit ? setEditIconBase64(dataUrl) : setIconBase64(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target;
    const wallet = {
      name: form.elements.name.value,
      icon: iconBase64
    };
    try {
      await addWallet(wallet);
      form.reset();
      setIconBase64("");
      onRefresh();
    } catch (err) {
      showCustomAlert("Gagal menambah dompet");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target;
    const wallet = {
      id: editingWallet.id,
      name: form.elements.name.value,
      icon: editIconBase64 || editingWallet.icon || ""
    };
    try {
      await updateWallet(wallet);
      setEditingWallet(null);
      setEditIconBase64("");
      onRefresh();
    } catch (err) {
      showCustomAlert("Gagal memperbarui dompet");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDelete = async (id) => {
    if (!await showCustomConfirm("Hapus dompet ini?")) return;
    try {
      await deleteWallet(id);
      onRefresh();
    } catch (err) {
      showCustomAlert("Gagal menghapus dompet");
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
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Logo / Gambar (Opsional)</label>
            <input type="file" accept="image/*" className="form-control" onChange={handleImageChange} style={{ padding: '0.5rem' }} />
            {iconBase64 && (
              <div style={{ marginTop: '0.5rem' }}>
                <img src={iconBase64} alt="Preview" style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />
              </div>
            )}
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
                    <div className="feed-icon" style={{ width: '36px', height: '36px', background: 'var(--primary-bg)', color: 'var(--primary)', overflow: 'hidden' }}>
                      {w.icon ? (
                        <img src={w.icon} alt={w.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <CreditCard size={16} />
                      )}
                    </div>
                    <div className="feed-details">
                      <h4 style={{ fontSize: '0.95rem' }}>{w.name}</h4>
                    </div>
                  </div>
                  <div className="feed-item-right" style={{ flexDirection: 'row', gap: '0.25rem' }}>
                    <button className="btn" style={{ padding: '0.25rem', color: 'var(--primary)', background: 'transparent' }} onClick={() => {
                      setEditingWallet(w);
                      setEditIconBase64(w.icon || "");
                    }}>
                      <Edit size={16} />
                    </button>
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

      {editingWallet && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Edit Dompet</h3>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Nama Dompet</label>
                <input type="text" name="name" className="form-control" defaultValue={editingWallet.name} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Logo / Gambar (Opsional)</label>
                <input type="file" accept="image/*" className="form-control" onChange={(e) => handleImageChange(e, true)} style={{ padding: '0.5rem' }} />
                {editIconBase64 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img src={editIconBase64} alt="Preview" style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => {
                  setEditingWallet(null);
                  setEditIconBase64("");
                }}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DebtsTab({ debts, transactions, wallets, onRefresh, isLoading }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payingDebt, setPayingDebt] = useState(null); // stores the debt object when paying
  const [managingDebt, setManagingDebt] = useState(null);
  const [filterStatus, setFilterStatus] = useState('Belum Lunas');

  const getWalletBalance = (walletName) => {
    let balance = 0;
    if (transactions && transactions.length > 0) {
      transactions.forEach(t => {
        if (t.wallet === walletName) {
          if (t.type === 'Income') balance += Number(t.amount || 0);
          else if (t.type === 'Expense') balance -= Number(t.amount || 0);
        }
      });
    }
    return balance;
  };

  const handleAddDebt = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target;
    let baseName = form.elements.name.value;
    const dueDate = form.elements.dueDate ? form.elements.dueDate.value : null;

    if (dueDate) {
      const d = new Date(dueDate);
      if (!isNaN(d.getTime())) {
        const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        baseName = `${baseName} - Jatuh tempo ${dateStr}`;
      }
    }

    const debt = {
      name: baseName,
      amount: form.elements.amount.value
    };
    try {
      await addDebt(debt);
      form.reset();
      onRefresh();
    } catch (err) {
      showCustomAlert("Gagal mencatat hutang baru");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleUpdateDebt = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target;
    let baseName = form.elements.name.value;
    const dueDate = form.elements.dueDate ? form.elements.dueDate.value : null;

    if (dueDate) {
      const d = new Date(dueDate);
      if (!isNaN(d.getTime())) {
        const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        // clean up existing Jatuh tempo if any
        baseName = baseName.replace(/ - Jatuh tempo .*$/i, '');
        baseName = `${baseName} - Jatuh tempo ${dateStr}`;
      }
    }

    const debt = {
      id: managingDebt.id,
      name: baseName,
      amount: form.elements.amount.value
    };
    try {
      await updateDebt(debt);
      setManagingDebt(null);
      onRefresh();
    } catch (err) {
      showCustomAlert("Gagal mengupdate hutang");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handlePayDebt = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target;
    const amount = Number(form.elements.amount.value);
    const fee = Number(form.elements.fee.value || 0);
    const wallet = form.elements.wallet.value;
    const date = form.elements.date.value;

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
      
      if (fee > 0) {
        const feeTx = {
          date: date,
          type: 'Expense',
          amount: fee,
          category: 'Biaya Admin',
          wallet: wallet,
          debt_id: payingDebt.id,
          note: `Biaya pembayaran hutang: ${payingDebt.name}`
        };
        await addTransaction(feeTx);
      }

      setPayingDebt(null);
      onRefresh();
    } catch (err) {
      showCustomAlert("Gagal memproses pembayaran");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDeleteDebt = async (id) => {
    if (!await showCustomConfirm("Hapus catatan hutang ini? (Transaksi pembayaran tidak akan terhapus)")) return;
    try {
      await deleteDebt(id);
      onRefresh();
    } catch (err) {
      showCustomAlert("Gagal menghapus hutang");
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
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '150px' }}>
            <label>Jatuh Tempo (Opsional)</label>
            <GlassDatePicker name="dueDate" style={{ width: '100%' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ background: 'var(--danger)', height: '42px', flexShrink: 0 }} disabled={isSubmitting}>
            {isSubmitting ? '...' : 'Tambah Hutang'}
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Daftar Hutang Anda</h3>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {['Belum Lunas', 'Lunas', 'Semua'].map(status => (
          <button
            key={status}
            className={`btn ${filterStatus === status ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterStatus(status)}
            style={{ flexShrink: 0, padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem' }}
          >
            {status}
          </button>
        ))}
      </div>

      {isLoading ? <p style={{ color: 'var(--text-muted)' }}>Memuat...</p> : (
        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {(()=>{
            const debtsWithStatus = (Array.isArray(debts) ? debts : []).map(debt => {
              const total = Number(debt.amount);
              const paid = transactions
                .filter(t => t.debt_id === debt.id && t.type === 'Expense')
                .reduce((sum, t) => sum + Number(t.amount), 0);
              const remaining = total - paid;
              const isPaidOff = remaining <= 0;
              return { ...debt, total, paid, remaining, isPaidOff };
            });

            const filteredDebts = debtsWithStatus.filter(d => {
              if (filterStatus === 'Lunas') return d.isPaidOff;
              if (filterStatus === 'Belum Lunas') return !d.isPaidOff;
              return true;
            });

            if (filteredDebts.length === 0) {
              return <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', gridColumn: '1 / -1' }}>Belum ada catatan hutang sesuai filter.</p>;
            }

            return filteredDebts.map(d => (
              <div className="card" key={d.id} style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{d.name}</h4>
                    <span className={`badge ${d.isPaidOff ? 'income' : 'expense'}`}>
                      {d.isPaidOff ? 'LUNAS' : 'BELUM LUNAS'}
                    </span>
                  </div>
                  {!d.isPaidOff && (
                    <button className="btn" style={{ padding: '0.25rem', color: 'var(--text-muted)', background: 'transparent' }} onClick={() => setManagingDebt(d)}>
                      <Edit size={16} />
                    </button>
                  )}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>
                    <span>Terbayar: Rp {d.paid.toLocaleString('id-ID')}</span>
                    <span>Total: Rp {d.total.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="progress-bar-bg" style={{ width: '100%', height: '8px', background: 'var(--glass-border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div className="progress-bar-fill" style={{ width: `${d.total > 0 ? Math.min(100, Math.max(0, (d.paid / d.total) * 100)) : 0}%`, height: '100%', background: d.isPaidOff ? 'var(--success)' : 'var(--primary)', transition: 'width 0.3s' }}></div>
                  </div>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', fontWeight: 600, color: d.isPaidOff ? 'var(--success)' : 'var(--danger)' }}>
                    Sisa: Rp {Math.max(0, d.remaining).toLocaleString('id-ID')}
                  </p>
                </div>

                {!d.isPaidOff && (
                  <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setPayingDebt(d)}>
                    Bayar Hutang Ini
                  </button>
                )}
              </div>
            ));
          })()}
        </div>
      )}

      {/* Popup Modal Form Pembayaran Hutang */}
      {payingDebt && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(5px)', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Form Pembayaran</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Pelunasan: <strong>{payingDebt.name}</strong></p>
            <form onSubmit={handlePayDebt} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                    ...wallets.map(w => {
                      const bal = getWalletBalance(w.name);
                      return { label: `${w.name} (Rp ${bal.toLocaleString('id-ID')})`, value: w.name };
                    })
                  ]}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Nominal (Rp)</label>
                <CurrencyInput 
                  name="amount" 
                  className="form-control" 
                  defaultValue={
                    Number(payingDebt.amount) - transactions.filter(t => t.debt_id === payingDebt.id && t.type === 'Expense').reduce((sum, t) => sum + Number(t.amount), 0)
                  } 
                  required 
                  style={{ padding: '0.5rem' }} 
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Biaya Admin / Lainnya (Rp) - Opsional</label>
                <CurrencyInput 
                  name="fee" 
                  className="form-control" 
                  defaultValue={0}
                  style={{ padding: '0.5rem' }} 
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', borderRadius: '8px' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Memproses...' : 'Bayar'}
                </button>
                <button type="button" className="btn btn-outline" style={{ flex: 1, padding: '0.75rem', borderRadius: '8px' }} onClick={() => setPayingDebt(null)}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup Modal Kelola Hutang */}
      {managingDebt && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(5px)', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Kelola Hutang</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Silakan ubah rincian di bawah ini.</p>
            
            <form onSubmit={handleUpdateDebt} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Nama Tempat / Peminjam</label>
                <input type="text" name="name" className="form-control" defaultValue={managingDebt.name} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Total Hutang (Rp)</label>
                <CurrencyInput name="amount" className="form-control" defaultValue={managingDebt.amount} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Jatuh Tempo Baru (Opsional)</label>
                <GlassDatePicker name="dueDate" style={{ width: '100%' }} />
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>Kosongkan jika tidak ingin mengubah tanggal jatuh tempo.</small>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', borderRadius: '8px' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} 
                  onClick={() => {
                    handleDeleteDebt(managingDebt.id);
                    setManagingDebt(null);
                  }}
                >
                  <Trash2 size={16} /> Hapus Hutang Ini
                </button>
                <button type="button" className="btn btn-outline" style={{ padding: '0.75rem', borderRadius: '8px' }} onClick={() => setManagingDebt(null)}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentModal({ pkgName, appConfig, currentUser, onClose, precalcAutomationFee }) {
  const [invoiceNumber] = useState(Math.floor(Math.random() * 9000000) + 1000000);
  const [automationFee] = useState(precalcAutomationFee || Math.floor(Math.random() * 900) + 100);
  const [showSummary, setShowSummary] = useState(true);

  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    const num = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  let basePrice = 0;
  if (pkgName.includes('1 Tahun')) basePrice = parsePrice(appConfig?.Price_1Year);
  else if (pkgName.includes('Bundling')) basePrice = parsePrice(appConfig?.Price_Bundle);
  else if (pkgName.includes('Seumur Hidup')) basePrice = parsePrice(appConfig?.Price_Lifetime);

  const adminFee = appConfig?.Payment_AdminFee ? parseInt(appConfig.Payment_AdminFee, 10) : 0;
  const totalPrice = basePrice + adminFee + automationFee;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    showCustomAlert("Berhasil disalin!");
  };

  const handleConfirm = () => {
    const waNumber = appConfig?.Admin_WA || currentUser?.adminWa || '';
    if (!waNumber) {
      showCustomAlert("Nomor WhatsApp Admin belum diatur.");
      return;
    }
    const email = currentUser?.email ? `Email: ${currentUser.email}` : '';
    const phone = currentUser?.phone ? `No HP: ${currentUser.phone}` : '';
    const text = encodeURIComponent(`Halo Admin, saya ingin mendaftar/memperpanjang langganan dengan paket ${pkgName}.\n\n*Data Pendaftar:*\n${email}\n${phone}\n\n*Invoice:* ${invoiceNumber}\n*Total Transfer:* Rp ${totalPrice.toLocaleString('id-ID')}\n\nSaya telah melakukan pembayaran.`);
    window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
  };

  const getQrisImgSrc = (url) => {
    if (url && url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/d\/(.*?)\//);
      if (match && match[1]) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
      }
    }
    return url;
  };
  const staticQrisImgSrc = appConfig?.Payment_QRIS ? getQrisImgSrc(appConfig.Payment_QRIS) : null;

  const generateDynamicQRIS = (qrisStr, nominal) => {
    if (!qrisStr || !nominal) return qrisStr;
    const crc16 = (s) => {
      let crc = 0xFFFF;
      for (let i = 0; i < s.length; i++) {
        crc ^= (s.charCodeAt(i) << 8);
        for (let j = 0; j < 8; j++) {
          if ((crc & 0x8000) !== 0) crc = (crc << 1) ^ 0x1021;
          else crc = crc << 1;
        }
      }
      return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    };
  
    let baseStr = qrisStr;
    const crcIndex = qrisStr.lastIndexOf('6304');
    if (crcIndex !== -1) {
      baseStr = qrisStr.substring(0, crcIndex);
    } else return qrisStr; 
  
    try {
      const tags = {};
      let i = 0;
      while (i < baseStr.length) {
        const id = baseStr.substring(i, i + 2);
        const length = parseInt(baseStr.substring(i + 2, i + 4), 10);
        const value = baseStr.substring(i + 4, i + 4 + length);
        tags[id] = value;
        i += 4 + length;
      }
      
      tags['54'] = nominal.toString();
      
      let newPayload = '';
      for (let k = 0; k <= 62; k++) {
        const key = k.toString().padStart(2, '0');
        if (tags[key]) {
          const v = tags[key];
          const l = v.length.toString().padStart(2, '0');
          newPayload += `${key}${l}${v}`;
        }
      }
      newPayload += '6304';
      return newPayload + crc16(newPayload);
    } catch (e) {
      return qrisStr;
    }
  };

  const dynamicQrisPayload = appConfig?.Payment_QRIS_Data ? generateDynamicQRIS(appConfig.Payment_QRIS_Data, totalPrice) : null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '0.5rem', paddingBottom: '90px', backdropFilter: 'blur(5px)' }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', border: 'none', borderRadius: '16px', maxHeight: '98vh', overflowY: 'auto', padding: '1rem', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        
        {/* Header Invoice */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
          <div>
            <h2 style={{ margin: 0, color: '#1f2937', fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Receipt size={24} /> QRIS
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>Otomatis Terdeteksi</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Status</div>
            <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '0.9rem' }}>Dalam Proses</div>
          </div>
        </div>

        {/* Invoice Body */}
        <div style={{ textAlign: 'center', marginBottom: '0.75rem', color: '#374151' }}>
          <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: '#6b7280' }}>
            Invoice: <strong style={{ color: '#374151' }}>{invoiceNumber}</strong>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '12px' }}>
            {dynamicQrisPayload ? (
              <div style={{ background: '#fff', padding: '0.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <QRCodeCanvas value={dynamicQrisPayload} size={180} level={"M"} />
              </div>
            ) : staticQrisImgSrc ? (
              <img src={staticQrisImgSrc} alt="QRIS" style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            ) : (
              <div style={{ padding: '2rem', color: '#9ca3af' }}>QRIS Belum Diatur</div>
            )}
          </div>
          
          {(!dynamicQrisPayload && staticQrisImgSrc) && (
            <button className="btn" style={{ background: 'transparent', color: '#0ea5e9', fontSize: '0.9rem', fontWeight: '600', padding: 0 }} onClick={() => window.open(staticQrisImgSrc || '#', '_blank')}>
              Download QR Code
            </button>
          )}
        </div>

        {/* Payment Summary */}
        <div style={{ borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', paddingTop: '0.75rem', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
          <div 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: '600', color: '#4b5563' }}
            onClick={() => setShowSummary(!showSummary)}
          >
            <span>Ringkasan Pembayaran</span>
            <ChevronDown style={{ transform: showSummary ? 'rotate(180deg)' : 'none', transition: '0.3s' }} size={20} />
          </div>
          
          {showSummary && (
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Harga Paket ({pkgName})</span>
                <span>{basePrice.toLocaleString('id-ID')}</span>
              </div>
              {adminFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Biaya Admin</span>
                  <span>{adminFee.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px dashed #e5e7eb' }}>
                <span>Kode Unik / Automation Fee</span>
                <span>{automationFee.toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#1f2937', fontSize: '1.15rem' }}>
                <span>Total Bayar</span>
                <span style={{ color: '#f59e0b' }}>Rp {totalPrice.toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}
        </div>

        {/* E-Wallets Fallback */}
        {(appConfig?.Payment_DANA || appConfig?.Payment_SPay || appConfig?.Payment_Mandiri) && (
          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.5rem', textAlign: 'center' }}>Atau transfer manual ke:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {appConfig?.Payment_DANA && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: '600', color: '#118ee9', fontSize: '0.85rem' }}>DANA</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: '#475569', fontSize: '0.85rem' }}>{appConfig.Payment_DANA}</span>
                    <button onClick={() => handleCopy(appConfig.Payment_DANA)} style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>Copy</button>
                  </div>
                </div>
              )}
              {appConfig?.Payment_SPay && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: '600', color: '#ee4d2d', fontSize: '0.85rem' }}>ShopeePay</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: '#475569', fontSize: '0.85rem' }}>{appConfig.Payment_SPay}</span>
                    <button onClick={() => handleCopy(appConfig.Payment_SPay)} style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>Copy</button>
                  </div>
                </div>
              )}
              {appConfig?.Payment_Mandiri && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: '600', color: '#003d79', fontSize: '0.85rem' }}>Mandiri</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: '#475569', fontSize: '0.85rem' }}>{appConfig.Payment_Mandiri}</span>
                    <button onClick={() => handleCopy(appConfig.Payment_Mandiri)} style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>Copy</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', background: '#0ea5e9', borderColor: '#0ea5e9', fontSize: '0.95rem', fontWeight: 'bold', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.4)' }} onClick={handleConfirm}>
            Check Status Pembayaran
          </button>
          <button className="btn btn-outline" style={{ width: '100%', padding: '0.6rem', border: 'none', color: '#9ca3af', fontWeight: '600' }} onClick={onClose}>
            Batal
          </button>
        </div>

      </div>
    </div>
  );
}
function SettingsTab({ currentUser, appConfig, handleLogout, categories, wallets, loadData, isLoading, handleBackup, handleBackupJSON, handleRestoreJSON }) {
  const [restoring, setRestoring] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [openAccordion, setOpenAccordion] = useState(null); // 'wallets' or 'categories'

  const handleExtend = (pkgName) => {
    setSelectedPackage(pkgName);
  };

  let daysLeft = null;
  if (currentUser?.expiry) {
    const expD = new Date(currentUser.expiry);
    const today = new Date();
    const diffTime = expD.getTime() - today.getTime();
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  // Also check if warning is present just in case, but daysLeft is more accurate for UI here
  const isExpiringSoon = (daysLeft !== null && daysLeft <= 5) || !!currentUser?.warning;
  const infoColor = isExpiringSoon ? '#dc2626' : 'var(--success)';

  return (
    <>
      <div className="card">
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Pengaturan Profil</h2>

      {/* Account Info Box */}
      <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: isExpiringSoon ? 'rgba(239, 68, 68, 0.05)' : 'var(--glass-bg)', borderRadius: '12px', border: `1px solid ${isExpiringSoon ? '#dc2626' : 'var(--glass-border)'}` }}>
        <h3 style={{ margin: '0 0 1rem 0', color: infoColor }}>Akun Saat Ini</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
          <div style={{ color: infoColor }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{currentUser.email} {currentUser.role === 'admin' ? '(Admin)' : ''}</p>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Masa Aktif: {currentUser.expiry ? new Date(currentUser.expiry).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Selamanya'}
              {daysLeft !== null && (
                <span style={{ display: 'block', marginTop: '0.25rem', fontWeight: 'bold' }}>
                  (Sisa {daysLeft} hari)
                </span>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
            {isExpiringSoon && (
              <button className="btn btn-primary" style={{ background: 'var(--warning)', borderColor: 'var(--warning)', width: '100%' }} onClick={() => setShowExtendModal(true)}>
                Perpanjang
              </button>
            )}
          </div>
        </div>
        <button className="btn btn-outline" style={{ marginTop: '1.5rem' }} onClick={handleLogout}>Keluar (Logout)</button>
      </div>

      {/* Accordions for Dompet and Kategori */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Accordion Dompet */}
        <div style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div
            style={{ padding: '1rem 1.5rem', background: 'var(--glass-bg)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}
            onClick={() => setOpenAccordion(openAccordion === 'wallets' ? null : 'wallets')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={20} color="var(--primary)" /> Manajemen Dompet
            </div>
            <span>{openAccordion === 'wallets' ? '▲' : '▼'}</span>
          </div>
          {openAccordion === 'wallets' && (
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.3)', borderTop: '1px solid var(--glass-border)' }}>
              <WalletsTab wallets={wallets} onRefresh={loadData} isLoading={isLoading} />
            </div>
          )}
        </div>

        {/* Accordion Kategori */}
        <div style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div
            style={{ padding: '1rem 1.5rem', background: 'var(--glass-bg)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}
            onClick={() => setOpenAccordion(openAccordion === 'categories' ? null : 'categories')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tags size={20} color="var(--primary)" /> Manajemen Kategori
            </div>
            <span>{openAccordion === 'categories' ? '▲' : '▼'}</span>
          </div>
          {openAccordion === 'categories' && (
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.3)', borderTop: '1px solid var(--glass-border)' }}>
              <CategoriesTab categories={categories} onRefresh={loadData} isLoading={isLoading} />
            </div>
          )}
        </div>

      {/* Accordion Backup & Restore */}
      <div style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div
            style={{ padding: '1rem 1.5rem', background: 'var(--glass-bg)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}
            onClick={() => setOpenAccordion(openAccordion === 'backup' ? null : 'backup')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Download size={20} color="var(--primary)" /> Backup & Restore
            </div>
            <span>{openAccordion === 'backup' ? '▲' : '▼'}</span>
          </div>
          {openAccordion === 'backup' && (
            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.3)', borderTop: '1px solid var(--glass-border)' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Backup semua data (transaksi, kategori, dompet, hutang) ke file lokal. Anda juga bisa memulihkan data dari file backup sebelumnya.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Backup Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" style={{ flex: 1, minWidth: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem' }} onClick={handleBackupJSON}>
                    <Download size={18} /> Backup JSON
                  </button>
                  <button className="btn btn-outline" style={{ flex: 1, minWidth: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem' }} onClick={handleBackup}>
                    <Download size={18} /> Backup XLSX
                  </button>
                </div>

                {/* Restore Section */}
                <div style={{ padding: '1.25rem', background: 'var(--glass-bg)', border: '1px dashed var(--glass-border)', borderRadius: '12px', textAlign: 'center' }}>
                  <Upload size={32} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Restore dari File JSON</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Pilih file <code>.json</code> backup FamilyFin untuk memulihkan data. Data yang sudah ada tidak akan diduplikat.
                  </p>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', borderRadius: '8px', cursor: restoring ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: restoring ? 0.7 : 1 }}>
                    <Upload size={18} />
                    {restoring ? 'Memproses...' : 'Pilih File Backup'}
                    <input type="file" accept=".json" style={{ display: 'none' }} disabled={restoring} onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      if (!(await showCustomConfirm(`Anda akan memulihkan data dari file "${file.name}".\n\nData yang sudah ada tidak akan diduplikat.\n\nLanjutkan?`))) {
                        e.target.value = '';
                        return;
                      }
                      setRestoring(true);
                      await handleRestoreJSON(file);
                      setRestoring(false);
                      e.target.value = '';
                    }} />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Extend Modal */}
      {showExtendModal && !selectedPackage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(5px)', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: 'none' }}>
            <h3 style={{ marginTop: 0, color: 'var(--primary)', marginBottom: '1rem' }}>Pilih Paket Perpanjangan</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {appConfig?.Price_1Year && (
                <button className="btn btn-outline" style={{ display: 'flex', justifyContent: 'space-between' }} onClick={() => handleExtend('1 Tahun')}>
                  <span>1 Tahun</span> <strong>{appConfig.Price_1Year}</strong>
                </button>
              )}
              {appConfig?.Price_Bundle && (
                <button className="btn btn-outline" style={{ display: 'flex', justifyContent: 'space-between', borderColor: 'var(--success)', color: 'var(--success)' }} onClick={() => handleExtend('Bundling (2 Tahun)')}>
                  <span>Bundling 2 Tahun</span> <strong>{appConfig.Price_Bundle}</strong>
                </button>
              )}
              {appConfig?.Price_Lifetime && (
                <button className="btn btn-outline" style={{ display: 'flex', justifyContent: 'space-between', borderColor: 'var(--warning)', color: 'var(--warning)' }} onClick={() => handleExtend('Seumur Hidup')}>
                  <span>Seumur Hidup</span> <strong>{appConfig.Price_Lifetime}</strong>
                </button>
              )}
            </div>
            <button className="btn btn-outline" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => setShowExtendModal(false)}>Batal</button>
          </div>
        </div>
      )}
      
      {/* Payment Modal for Extend */}
      {selectedPackage && (
        <PaymentModal 
          pkgName={selectedPackage} 
          appConfig={appConfig} 
          currentUser={currentUser} 
          onClose={() => { setSelectedPackage(null); setShowExtendModal(false); }} 
        />
      )}
    </>
  );
}

export default App;
