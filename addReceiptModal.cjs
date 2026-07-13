const fs = require('fs');

let jsx = fs.readFileSync('src/App.jsx', 'utf8');

const modalCode = `
function generateSerialNumber(transaction) {
  const type = transaction.type;
  let prefix = 'TRX';
  if (type === 'Income') prefix = 'INC';
  else if (type === 'Expense') prefix = 'EXP';
  else if (type === 'Transfer' || type === 'Mutasi') prefix = 'MUT';
  else if (type === 'Debt' || type === 'Hutang') prefix = 'HUT';
  
  return \`\${prefix}-\${transaction.id}\`;
}

function ReceiptModal({ transaction, onClose }) {
  if (!transaction) return null;
  const serialNumber = generateSerialNumber(transaction);
  
  return (
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
  );
}

function TransactionsTab`;

if (jsx.includes('function generateSerialNumber')) {
  console.log("Already inserted");
} else {
  jsx = jsx.replace('function TransactionsTab', modalCode);
  fs.writeFileSync('src/App.jsx', jsx);
}
