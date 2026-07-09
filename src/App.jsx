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
  Edit
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
  const [promoConfig, setPromoConfig] = useState({ Promo_Message: '', Price_1Year: '', Price_Bundle: '', Price_Lifetime: '', Promo_FreeTest: 'true', Payment_QRIS_Data: '', Payment_AdminFee: '' });

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

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Pengaturan Promosi & Harga</h3>
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
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Harga 1 Tahun</label>
              <input type="text" className="form-control" value={promoConfig.Price_1Year || ''} onChange={e => setPromoConfig({ ...promoConfig, Price_1Year: e.target.value })} placeholder="Rp 50.000" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Harga Bundling 2 Tahun</label>
              <input type="text" className="form-control" value={promoConfig.Price_Bundle || ''} onChange={e => setPromoConfig({ ...promoConfig, Price_Bundle: e.target.value })} placeholder="Rp 90.000 / 2 Tahun" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Harga Seumur Hidup</label>
              <input type="text" className="form-control" value={promoConfig.Price_Lifetime || ''} onChange={e => setPromoConfig({ ...promoConfig, Price_Lifetime: e.target.value })} placeholder="Rp 250.000" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              id="promoFreeTest"
              checked={promoConfig.Promo_FreeTest === 'true' || promoConfig.Promo_FreeTest === true}
              onChange={e => setPromoConfig({ ...promoConfig, Promo_FreeTest: e.target.checked ? 'true' : 'false' })}
              style={{ width: '1.2rem', height: '1.2rem' }}
            />
            <label htmlFor="promoFreeTest" style={{ cursor: 'pointer', userSelect: 'none' }}>Tampilkan tombol "Coba Gratis 5 Hari"</label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>Simpan Promosi</button>
        </form>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Pengaturan Metode Pembayaran</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Atur nomor rekening, e-wallet, dan QRIS yang akan ditampilkan saat pengguna membeli paket langganan.
        </p>
        <form onSubmit={handleSavePromo} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>No. DANA</label>
              <input type="text" className="form-control" value={promoConfig.Payment_DANA || ''} onChange={e => setPromoConfig({ ...promoConfig, Payment_DANA: e.target.value })} placeholder="0812xxxx" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>No. ShopeePay</label>
              <input type="text" className="form-control" value={promoConfig.Payment_SPay || ''} onChange={e => setPromoConfig({ ...promoConfig, Payment_SPay: e.target.value })} placeholder="0812xxxx" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>No. Rekening Mandiri</label>
              <input type="text" className="form-control" value={promoConfig.Payment_Mandiri || ''} onChange={e => setPromoConfig({ ...promoConfig, Payment_Mandiri: e.target.value })} placeholder="112xxxx" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>URL Gambar QRIS (Statis)</label>
              <input type="url" className="form-control" value={promoConfig.Payment_QRIS || ''} onChange={e => setPromoConfig({ ...promoConfig, Payment_QRIS: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Data Teks QRIS (Opsional untuk Dinamis)</label>
              <input type="text" className="form-control" value={promoConfig.Payment_QRIS_Data || ''} onChange={e => setPromoConfig({ ...promoConfig, Payment_QRIS_Data: e.target.value })} placeholder="000201010211..." />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Biaya Admin (Opsional)</label>
              <input type="number" className="form-control" value={promoConfig.Payment_AdminFee || ''} onChange={e => setPromoConfig({ ...promoConfig, Payment_AdminFee: e.target.value })} placeholder="Contoh: 2500" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>Simpan Metode Pembayaran</button>
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

function AuthScreen({ onLoginSuccess, apiUrl, onSaveApiUrl, appConfig }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const handlePackageClick = (pkgName) => {
    setSelectedPackage(pkgName);
  };

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

  const handleFreeTrial = async () => {
    if (!apiUrl) {
      setMessage({ type: 'error', text: 'Mohon atur URL API terlebih dahulu melalui menu Pengaturan di pojok kanan atas.' });
      return;
    }
    if (!email) {
      setMessage({ type: 'error', text: 'Silakan isi email di kotak masuk di atas sebelum mencoba Free Trial.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await registerFreeTrial(email);
      if (res.success) {
        setMessage({ type: 'success', text: "Pendaftaran berhasil! Spreadsheet Free Test Anda telah dibuat. Silakan klik tombol 'Masuk' di atas untuk masuk." });
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem 1rem', gap: '2rem' }}>

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

      {appConfig && appConfig.Promo_Message && (
        <div className="card" style={{ maxWidth: '700px', width: '100%', textAlign: 'center', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--primary)' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Selamat Datang di FamilyFin!</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6' }}>{appConfig.Promo_Message}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {appConfig.Price_1Year && (
              <div onClick={() => handlePackageClick('1 Tahun')} style={{ padding: '1.5rem', border: '1px solid var(--primary)', borderRadius: '12px', background: 'rgba(255,255,255,0.5)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                <div style={{ fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Paket 1 Tahun</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{appConfig.Price_1Year}</div>
              </div>
            )}
            {appConfig.Price_Bundle && (
              <div onClick={() => handlePackageClick('Bundling (2 Tahun)')} style={{ padding: '1.5rem', border: '1px solid var(--success)', borderRadius: '12px', background: 'var(--success-bg)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                <div style={{ fontWeight: 'bold', color: 'var(--success)', marginBottom: '0.5rem' }}>Paket Bundling</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{appConfig.Price_Bundle}</div>
              </div>
            )}
            {appConfig.Price_Lifetime && (
              <div onClick={() => handlePackageClick('Seumur Hidup')} style={{ padding: '1.5rem', border: '1px solid var(--warning)', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                <div style={{ fontWeight: 'bold', color: 'var(--warning)', marginBottom: '0.5rem' }}>Seumur Hidup</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--warning)' }}>{appConfig.Price_Lifetime}</div>
              </div>
            )}
          </div>

          {(appConfig.Promo_FreeTest === 'true' || appConfig.Promo_FreeTest === true || appConfig.Promo_FreeTest === undefined) && (
            <div style={{ marginTop: '2rem' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', maxWidth: '300px', fontSize: '1.1rem', padding: '0.75rem', background: 'var(--primary)', borderColor: 'var(--primary)' }}
                onClick={handleFreeTrial}
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Coba Gratis 5 Hari'}
              </button>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                *Masukkan email Anda di kotak atas lalu klik tombol ini untuk langsung mencoba!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Payment Modal for New Subscription */}
      {selectedPackage && (
        <PaymentModal 
          pkgName={selectedPackage} 
          appConfig={appConfig} 
          currentUser={{ email: email }} 
          onClose={() => setSelectedPackage(null)} 
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
      alert("Gagal melakukan backup data.");
    }
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
        ) : (
          !apiUrl && (
            <div
              style={{ cursor: 'pointer', color: 'white', padding: '0.5rem', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setShowSettings(true)}
            >
              <Settings size={20} />
            </div>
          )
        )}
      </header>

      {/* Main Content */}
      <div className="main-content">
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
            {activeTab === 'home' && <HomeTab setActiveTab={setActiveTab} />}
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
              />
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

          {currentUser.role === 'admin' && (
            <div className={`bottom-nav-item ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
              <Shield size={22} />
              <span>Admin</span>
            </div>
          )}

          <div className={`bottom-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <User size={22} />
            <span>Pengaturan</span>
          </div>
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

function TransactionsTab({ transactions, categories, wallets, onRefresh, isLoading }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txType, setTxType] = useState(null);
  const [editingTx, setEditingTx] = useState(null);

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
      alert("Gagal memperbarui transaksi");
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
              <div className="feed-item-right" style={{ flexDirection: 'row', gap: '0.25rem', alignItems: 'center' }}>
                <span className={`feed-amount ${t.type === 'Income' ? 'income' : 'expense'}`} style={{ marginRight: '0.5rem' }}>
                  {t.type === 'Income' ? '+' : '-'}Rp {Number(t.amount).toLocaleString('id-ID')}
                </span>
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
      alert("Gagal menambah dompet");
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
      alert("Gagal memperbarui dompet");
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

function PaymentModal({ pkgName, appConfig, currentUser, onClose }) {
  const [invoiceNumber] = useState(Math.floor(Math.random() * 9000000) + 1000000);
  const [automationFee] = useState(Math.floor(Math.random() * 900) + 100);
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
    alert("Berhasil disalin!");
  };

  const handleConfirm = () => {
    const waNumber = appConfig?.Admin_WA || currentUser?.adminWa || '';
    if (!waNumber) {
      alert("Nomor WhatsApp Admin belum diatur.");
      return;
    }
    const email = currentUser?.email ? `(${currentUser.email})` : '';
    const text = encodeURIComponent(`Halo Admin, saya ingin berlangganan/memperpanjang akun saya ${email} dengan paket ${pkgName}.\n\n*Invoice:* ${invoiceNumber}\n*Total Transfer:* Rp ${totalPrice.toLocaleString('id-ID')}\n\nSaya telah melakukan pembayaran.`);
    window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
    onClose();
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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '1rem', backdropFilter: 'blur(5px)' }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', background: '#ffffff', border: 'none', borderRadius: '16px', maxHeight: '95vh', overflowY: 'auto', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        
        {/* Header Invoice */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
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
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#374151' }}>
          <div style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#6b7280' }}>
            Invoice: <strong style={{ color: '#374151' }}>{invoiceNumber}</strong>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '12px' }}>
            {dynamicQrisPayload ? (
              <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <QRCodeCanvas value={dynamicQrisPayload} size={220} level={"M"} />
              </div>
            ) : staticQrisImgSrc ? (
              <img src={staticQrisImgSrc} alt="QRIS" style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
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
        <div style={{ borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', paddingTop: '1rem', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: '600', color: '#4b5563' }}
            onClick={() => setShowSummary(!showSummary)}
          >
            <span>Ringkasan Pembayaran</span>
            <ChevronDown style={{ transform: showSummary ? 'rotate(180deg)' : 'none', transition: '0.3s' }} size={20} />
          </div>
          
          {showSummary && (
            <div style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '1rem' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed #e5e7eb' }}>
                <span>Kode Unik / Automation Fee</span>
                <span>{automationFee.toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#1f2937', fontSize: '1.25rem' }}>
                <span>Total Bayar</span>
                <span style={{ color: '#f59e0b' }}>Rp {totalPrice.toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}
        </div>

        {/* E-Wallets Fallback */}
        {(appConfig?.Payment_DANA || appConfig?.Payment_SPay || appConfig?.Payment_Mandiri) && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.75rem', textAlign: 'center' }}>Atau transfer manual ke:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {appConfig?.Payment_DANA && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: '600', color: '#118ee9' }}>DANA</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: '#475569', fontSize: '0.9rem' }}>{appConfig.Payment_DANA}</span>
                    <button onClick={() => handleCopy(appConfig.Payment_DANA)} style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>Copy</button>
                  </div>
                </div>
              )}
              {appConfig?.Payment_SPay && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: '600', color: '#ee4d2d' }}>ShopeePay</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: '#475569', fontSize: '0.9rem' }}>{appConfig.Payment_SPay}</span>
                    <button onClick={() => handleCopy(appConfig.Payment_SPay)} style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>Copy</button>
                  </div>
                </div>
              )}
              {appConfig?.Payment_Mandiri && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: '600', color: '#003d79' }}>Mandiri</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: '#475569', fontSize: '0.9rem' }}>{appConfig.Payment_Mandiri}</span>
                    <button onClick={() => handleCopy(appConfig.Payment_Mandiri)} style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>Copy</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', background: '#0ea5e9', borderColor: '#0ea5e9', fontSize: '1rem', fontWeight: 'bold', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.4)' }} onClick={handleConfirm}>
            Check Status Pembayaran
          </button>
          <button className="btn btn-outline" style={{ width: '100%', padding: '0.875rem', border: 'none', color: '#9ca3af', fontWeight: '600' }} onClick={onClose}>
            Batal
          </button>
        </div>

      </div>
    </div>
  );
}
function SettingsTab({ currentUser, appConfig, handleLogout, categories, wallets, loadData, isLoading, handleBackup }) {
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
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={handleBackup}>
              Backup Data
            </button>
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
      </div>

      {/* Extend Modal */}
      {showExtendModal && !selectedPackage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
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
    </div>
  );
}

export default App;
