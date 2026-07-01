// Ported from the old front-end db.js: default progress stages per service type,
// and the payment-status -> kanban-status routing the old UI promised but never applied.

export function getStageTemplate(serviceType) {
  switch (serviceType) {
    case 'legal-pt':
    case 'legal-cv':
      return [
        { name: 'Pengecekan Nama', progress: 0 },
        { name: 'Draft Akta', progress: 0 },
        { name: 'Tanda Tangan', progress: 0 },
        { name: 'SK Kemenkumham', progress: 0 },
        { name: 'NIB & Izin Dasar', progress: 0 },
      ];
    case 'legal-haki':
      return [
        { name: 'Pengecekan Merek', progress: 0 },
        { name: 'Pembuatan Akun', progress: 0 },
        { name: 'Pembayaran PNBP', progress: 0 },
        { name: 'Submit Permohonan', progress: 0 },
      ];
    default:
      return [
        { name: 'Setup Awal', progress: 0 },
        { name: 'Pengerjaan', progress: 0 },
        { name: 'Selesai', progress: 0 },
      ];
  }
}

// unpaid -> Leads, dp -> Drafting, paid -> On Process (as labelled on the input form).
export function paymentToStatus(paymentStatus) {
  switch (paymentStatus) {
    case 'dp':
      return 'drafting';
    case 'paid':
      return 'process';
    case 'unpaid':
    default:
      return 'leads';
  }
}
