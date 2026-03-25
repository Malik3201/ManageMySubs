const ClientSubscription = require('../models/ClientSubscription');
const pdfService = require('./pdf.service');
const { uploadPdfPublic } = require('./googleDrive.service');
const settingsService = require('./settingsService');

const realizedProfit = (sub) => {
  const sale = sub.sellingPrice || 0;
  const purchase = sub.purchasePrice || 0;
  const profit = sale - purchase;

  if (sub.paymentStatus === 'pending') return 0;
  if (sub.paymentStatus === 'paid') return profit;

  if (sub.paymentStatus === 'partially_paid') {
    const ratio = sale > 0 ? (sub.amountReceived || 0) / sale : 0;
    return profit * ratio;
  }

  return profit;
};

const booly = (v) => v === '1' || /^true$/i.test(String(v || ''));

const generateReceiptNow = async (userId, subscriptionId, { overwrite = false } = {}) => {
  const receiptEnabled =
    booly(process.env.RECEIPT_PDF_ENABLED) ||
    !!process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON ||
    !!process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON_PATH;
  if (!receiptEnabled) {
    throw new Error('Receipt generation is disabled by configuration');
  }

  const sub = await ClientSubscription.findOne({ _id: subscriptionId, userId })
    .populate('categoryId', 'name')
    .lean();
  if (!sub) throw new Error('Subscription not found');
  if (sub.receiptUrl && !overwrite) return sub.receiptUrl;

  const settings = await settingsService.getOrCreate(userId);
  const subscriptionName = sub.categoryId?.name || 'Subscription';
  const dt = String(sub.durationType || '').toLowerCase();
  const durationLabel =
    dt === 'yearly'
      ? `Yearly (${Number(sub.totalDays || 0)} days)`
      : dt === 'custom'
        ? `Custom (${Number(sub.totalDays || 0)} days)`
        : `Monthly (${Number(sub.totalDays || 0)} days)`;

  const businessName = settings.businessName || 'Your Business';

  const pdfBuffer = await pdfService.generateReceiptPdf({
    businessName,
    receiptId: String(sub._id).slice(-8).toUpperCase(),
    clientName: sub.clientName || '',
    clientWhatsApp: sub.clientPhone || '',
    clientEmail: sub.clientEmail || '',
    subscriptionName,
    durationLabel,
    startDate: sub.startDate || sub.purchaseDate,
    endDate: sub.currentEndDate,
    sellingPrice: sub.sellingPrice,
    paymentStatus: sub.paymentStatus,
    profit: realizedProfit(sub),
  });

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const fileName = `receipt-${subscriptionId}.pdf`;
  const { receiptUrl } = await uploadPdfPublic({ fileName, pdfBuffer, folderId });

  if (!receiptUrl) {
    throw new Error('Receipt uploaded but public URL was not returned');
  }

  await ClientSubscription.findOneAndUpdate(
    { _id: subscriptionId, userId },
    { $set: { receiptUrl } },
    { new: true }
  );

  return receiptUrl;
};

const attachReceiptIfEnabled = async (userId, subscriptionId) => {
  try {
    await generateReceiptNow(userId, subscriptionId);
  } catch (err) {
    // Never break sale creation.
    console.error('[receiptService] failed to generate/upload receipt', {
      userId,
      subscriptionId,
      message: err?.message,
    });
  }
};

module.exports = { attachReceiptIfEnabled, generateReceiptNow };

