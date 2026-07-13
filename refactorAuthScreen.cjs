const fs = require('fs');

const appFile = 'src/App.jsx';
let appCode = fs.readFileSync(appFile, 'utf8');

const newAuthScreen = `function AuthScreen({ onLoginSuccess, apiUrl, onSaveApiUrl, appConfig }) {
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
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Pre-calculated fees
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
      <div className="theme-switch" onClick={toggleTheme}>
        {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
      </div>
      
      <div className="landing-split">
        {/* Left Side: Copywriting */}
        <div className="animate-fade-up">
          <h1 className="hero-title">Kelola Keuangan Keluarga Lebih Cerdas & Terkontrol</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            FamilyFin membantu Anda mencatat setiap pengeluaran, pemasukan, mutasi, dan hutang-piutang keluarga dengan mudah dan otomatis tersinkronisasi ke Google Sheets.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="feature-pill animate-fade-up delay-100">
              <div style={{ padding: '0.75rem', background: 'var(--success-bg)', borderRadius: '50%', color: 'var(--success)' }}>
                <CheckCircle2 size={24} />
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>Pencatatan Cepat & Akurat</div>
            </div>
            <div className="feature-pill animate-fade-up delay-200">
              <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '50%', color: 'var(--primary)' }}>
                <Zap size={24} />
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>Otomatis ke Google Sheets</div>
            </div>
            <div className="feature-pill animate-fade-up delay-300">
              <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', borderRadius: '50%', color: 'var(--danger)' }}>
                <Shield size={24} />
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>100% Aman & Transparan</div>
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
}`;

const startRegex = /^function AuthScreen\(\{.*?\) \{/m;
const endRegex = /^function App\(\) \{/m;

const startIndex = appCode.search(startRegex);
const endIndex = appCode.search(endRegex);

if (startIndex !== -1 && endIndex !== -1) {
  const newAppCode = appCode.substring(0, startIndex) + newAuthScreen + "\n\n" + appCode.substring(endIndex);
  fs.writeFileSync(appFile, newAppCode);
  console.log('Successfully replaced AuthScreen component');
} else {
  console.log('Could not find AuthScreen or App function signatures');
}
