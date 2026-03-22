const mongoose = require('mongoose');
const ClientSubscription = require('../models/ClientSubscription');
const ActivityLog = require('../models/ActivityLog');
const subscriptionService = require('./subscriptionService');
const categoryService = require('./categoryService');
const { resolveCategory } = require('./aiContextService');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function cleanEmail(raw) {
  if (!raw) return '';
  const s = String(raw).trim();
  const mailto = /mailto:([^)\s>]+)/i.exec(s);
  if (mailto) return mailto[1].trim().toLowerCase();
  const plain = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/.exec(s);
  return plain ? plain[1].toLowerCase() : s.toLowerCase();
}

function cleanPhone(raw) {
  if (!raw) return '';
  return String(raw).replace(/[^\d+]/g, '').slice(0, 20);
}

function clampNumber(n, min, max, fallback = 0) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.min(max, Math.max(min, x));
}

function validateCreateSaleData(data) {
  const name = String(data.customerName || '').trim().slice(0, 120);
  const subName = String(data.subscriptionName || data.categoryName || '').trim().slice(0, 120);
  const sellPrice = clampNumber(data.sellPrice ?? data.sellingPrice, 0, 1e9, NaN);
  if (!subName) return { ok: false, error: 'subscriptionName required' };
  if (!Number.isFinite(sellPrice)) return { ok: false, error: 'sellPrice required' };
  const costPrice = clampNumber(data.costPrice ?? data.purchasePrice, 0, 1e9, 0);
  let durationType = data.durationType;
  if (!['monthly', 'yearly', 'custom'].includes(durationType)) {
    durationType = 'monthly';
  }
  let customDays = clampNumber(data.customDays, 1, 3650, 30);
  if (durationType !== 'custom') customDays = 0;
  const paymentStatus = ['pending', 'paid', 'partially_paid'].includes(data.paymentStatus)
    ? data.paymentStatus
    : 'pending';
  return {
    ok: true,
    payload: {
      clientName: name,
      categoryHint: subName,
      sellingPrice: sellPrice,
      purchasePrice: costPrice,
      durationType,
      customDays: durationType === 'custom' ? customDays : undefined,
      clientPhone: cleanPhone(data.whatsapp || data.phone || data.clientPhone),
      clientEmail: cleanEmail(data.email || data.clientEmail).slice(0, 160),
      paymentStatus,
      notes: String(data.notes || '').slice(0, 2000),
    },
  };
}

async function ensureCategory(userId, hint, defaultCost) {
  const existing = await resolveCategory(userId, hint);
  if (existing) return existing;
  const cost = clampNumber(defaultCost, 0, 1e9, 0);
  try {
    return await categoryService.create(userId, {
      name: String(hint).trim().slice(0, 80),
      defaultPurchasePrice: cost,
      description: 'Auto-created by AI assistant',
    });
  } catch (e) {
    if (e?.code === 11000 || /duplicate/i.test(String(e.message))) {
      const again = await resolveCategory(userId, hint);
      if (again) return again;
    }
    throw e;
  }
}

async function findClientSubscriptions(userId, data) {
  const name = String(data.customerName || '').trim();
  const email = cleanEmail(data.email || data.clientEmail);
  const phone = cleanPhone(data.whatsapp || data.phone || data.clientPhone);
  const filter = { userId, isArchived: false };
  const or = [];
  if (name) or.push({ clientName: new RegExp(escapeRegex(name), 'i') });
  if (email) or.push({ clientEmail: new RegExp(escapeRegex(email), 'i') });
  if (phone) or.push({ clientPhone: new RegExp(escapeRegex(phone), 'i') });
  if (!or.length) return [];
  filter.$or = or;
  return ClientSubscription.find(filter)
    .populate('categoryId', 'name')
    .sort({ createdAt: -1 })
    .limit(12)
    .lean();
}

function formatContactLine(s) {
  const name = (s.clientName || '').trim();
  const phone = (s.clientPhone || '').trim();
  const email = (s.clientEmail || '').trim();
  if (!name && !phone && !email) {
    return 'customer: (naam/number save nahi — subscription edit karke add karein)';
  }
  const parts = [];
  if (name) parts.push(`naam: ${name}`);
  if (phone) parts.push(`number: ${phone}`);
  if (email) parts.push(`email: ${email}`);
  return `customer: ${parts.join(' | ')}`;
}

function formatSubscriptionLine(s) {
  const cat = s.categoryId?.name || '—';
  const pay = s.paymentStatus || '—';
  const end = s.currentEndDate ? new Date(s.currentEndDate).toLocaleDateString() : '—';
  return `• ${cat} — ${formatContactLine(s)} — sale ₹${s.sellingPrice ?? 0} — payment ${pay} — ends ${end} — id ${s._id}`;
}

async function executeAction(userId, action, data) {
  const safe = data && typeof data === 'object' && !Array.isArray(data) ? data : {};

  switch (action) {
    case 'create_sale': {
      const v = validateCreateSaleData(safe);
      if (!v.ok) return { executed: false, message: v.error };
      const cat = await ensureCategory(userId, v.payload.categoryHint, v.payload.purchasePrice);
      const purchasePrice =
        v.payload.purchasePrice > 0 ? v.payload.purchasePrice : cat.defaultPurchasePrice ?? 0;
      const createPayload = {
        categoryId: cat._id.toString(),
        clientName: v.payload.clientName,
        clientPhone: v.payload.clientPhone,
        clientEmail: v.payload.clientEmail,
        sellingPrice: v.payload.sellingPrice,
        purchasePrice,
        durationType: v.payload.durationType,
        customDays: v.payload.durationType === 'custom' ? v.payload.customDays : undefined,
        paymentStatus: v.payload.paymentStatus,
        notes: v.payload.notes || 'Created via AI assistant',
        tags: [],
      };
      const sub = await subscriptionService.create(userId, createPayload);
      const profit = (sub.sellingPrice || 0) - (sub.purchasePrice || 0);
      return {
        executed: true,
        message: `Sale save ho gayi. ${v.payload.clientName || 'Customer'} — ${cat.name} — sale ₹${sub.sellingPrice}, cost ₹${sub.purchasePrice}, profit ₹${profit}. Subscription id: ${sub._id}`,
        subscriptionId: sub._id,
      };
    }

    case 'create_customer': {
      const name = String(safe.customerName || '').trim();
      const phone = cleanPhone(safe.whatsapp || safe.phone);
      const email = cleanEmail(safe.email);
      if (!name && !phone && !email) {
        return {
          executed: false,
          message: 'Naam, number ya email mein se kuch likhein taake customer dhoondh saken.',
        };
      }
      const found = await findClientSubscriptions(userId, safe);
      if (found.length) {
        return {
          executed: true,
          message: `Pehle se ${found.length} subscription(s) milti hain is contact par:\n${found.slice(0, 5).map(formatSubscriptionLine).join('\n')}`,
        };
      }
      return {
        executed: true,
        message:
          'Is app mein customer alag se save nahi hota — jab aap sale likhen ge (service + price + duration) tab poora record ban jaye ga. Example: "Ali ko Netflix 600 me 1 month, number 03xx"',
      };
    }

    case 'find_customer': {
      const rows = await findClientSubscriptions(userId, safe);
      if (!rows.length) {
        return { executed: true, message: 'Koi matching subscription nahi mili. Spelling / number check karein.' };
      }
      return {
        executed: true,
        message: `Mil gaye ${rows.length} record(s):\n${rows.map(formatSubscriptionLine).join('\n')}`,
      };
    }

    case 'get_customer_history': {
      const rows = await findClientSubscriptions(userId, safe);
      if (!rows.length) {
        return { executed: true, message: 'Koi record nahi mila.' };
      }
      const lines = [];
      for (const s of rows.slice(0, 5)) {
        const logs = await ActivityLog.find({
          userId,
          clientSubscriptionId: s._id,
        })
          .sort({ createdAt: -1 })
          .limit(6)
          .lean();
        const logBits = logs.map((l) => `${l.actionType} @ ${new Date(l.createdAt).toLocaleString()}`).join('; ');
        lines.push(`${formatSubscriptionLine(s)}\n  History: ${logBits || '—'}`);
      }
      return {
        executed: true,
        message: lines.join('\n\n'),
      };
    }

    case 'lookup_subscription': {
      const rawId = String(safe.subscriptionId || safe.id || '').trim();
      if (!rawId || !mongoose.Types.ObjectId.isValid(rawId)) {
        return {
          executed: false,
          message:
            'Theek se subscription id chahiye (pehli reply mein "id ..." ke baad wala code).',
        };
      }
      const s = await ClientSubscription.findOne({ _id: rawId, userId })
        .populate('categoryId', 'name')
        .lean();
      if (!s) {
        return { executed: true, message: 'Is id par aapki koi subscription nahi mili.' };
      }
      return {
        executed: true,
        message: `Detail:\n${formatSubscriptionLine(s)}`,
      };
    }

    case 'list_pending_payments': {
      const rows = await ClientSubscription.find({
        userId,
        isArchived: false,
        paymentStatus: { $in: ['pending', 'partially_paid'] },
      })
        .select('clientName clientPhone clientEmail sellingPrice paymentStatus currentEndDate categoryId')
        .populate('categoryId', 'name')
        .sort({ currentEndDate: 1 })
        .limit(25)
        .lean();
      if (!rows.length) {
        return { executed: true, message: 'Koi pending / partial payment subscription nahi mili.' };
      }
      return {
        executed: true,
        message: `Pending / partial (${rows.length}):\n${rows.map(formatSubscriptionLine).join('\n')}`,
      };
    }

    case 'none':
      return { executed: false, message: '', skipExecution: true };

    default:
      return { executed: false, message: `Unknown action: ${action}` };
  }
}

module.exports = { executeAction, cleanEmail, cleanPhone };
