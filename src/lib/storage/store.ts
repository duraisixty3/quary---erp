'use client';

import {
  BusinessSettings,
  Material,
  Supplier,
  Customer,
  Quotation,
  SalesOrder,
  PurchaseOrder,
  LorryTrip,
  LoadProfitCalculation,
  StockLedgerEntry,
  BusinessExpense,
  PaymentTransaction,
  QuarrySite,
  QuarryProductionLog,
  HeavyMachinery,
  MaintenanceRecord,
  DocumentItem,
  NotificationItem,
  AuditLogItem,
  UserProfile,
  BusinessMode
} from '@/types';

import {
  INITIAL_USER,
  INITIAL_SETTINGS,
  INITIAL_MATERIALS,
  INITIAL_SUPPLIERS,
  INITIAL_CUSTOMERS,
  INITIAL_QUOTATIONS,
  INITIAL_ORDERS,
  INITIAL_PURCHASES,
  INITIAL_LORRY_TRIPS,
  INITIAL_LOAD_PROFITS,
  INITIAL_STOCK_LEDGER,
  INITIAL_EXPENSES,
  INITIAL_PAYMENTS,
  INITIAL_QUARRY_SITES,
  INITIAL_PRODUCTION_LOGS,
  INITIAL_MACHINERY,
  INITIAL_MAINTENANCE,
  INITIAL_DOCUMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS
} from './initialData';

export interface AppState {
  currentUser: UserProfile;
  settings: BusinessSettings;
  materials: Material[];
  suppliers: Supplier[];
  customers: Customer[];
  quotations: Quotation[];
  orders: SalesOrder[];
  purchases: PurchaseOrder[];
  lorryTrips: LorryTrip[];
  loadProfits: LoadProfitCalculation[];
  stockLedger: StockLedgerEntry[];
  expenses: BusinessExpense[];
  payments: PaymentTransaction[];
  quarrySites: QuarrySite[];
  productionLogs: QuarryProductionLog[];
  machinery: HeavyMachinery[];
  maintenanceRecords: MaintenanceRecord[];
  documents: DocumentItem[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];
}

const STORAGE_KEY = 'vajra_stone_erp_state_v1';

// In-memory fallback for SSR or initial load
let cachedState: AppState = {
  currentUser: INITIAL_USER,
  settings: INITIAL_SETTINGS,
  materials: INITIAL_MATERIALS,
  suppliers: INITIAL_SUPPLIERS,
  customers: INITIAL_CUSTOMERS,
  quotations: INITIAL_QUOTATIONS,
  orders: INITIAL_ORDERS,
  purchases: INITIAL_PURCHASES,
  lorryTrips: INITIAL_LORRY_TRIPS,
  loadProfits: INITIAL_LOAD_PROFITS,
  stockLedger: INITIAL_STOCK_LEDGER,
  expenses: INITIAL_EXPENSES,
  payments: INITIAL_PAYMENTS,
  quarrySites: INITIAL_QUARRY_SITES,
  productionLogs: INITIAL_PRODUCTION_LOGS,
  machinery: INITIAL_MACHINERY,
  maintenanceRecords: INITIAL_MAINTENANCE,
  documents: INITIAL_DOCUMENTS,
  notifications: INITIAL_NOTIFICATIONS,
  auditLogs: INITIAL_AUDIT_LOGS
};

type Listener = (state: AppState) => void;
const listeners = new Set<Listener>();

function loadStateFromStorage(): AppState {
  if (typeof window === 'undefined') return cachedState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveStateToStorage(cachedState);
      return cachedState;
    }
    const parsed = JSON.parse(raw);
    // Ensure nested arrays and settings default gracefully
    return {
      currentUser: parsed.currentUser || INITIAL_USER,
      settings: parsed.settings || INITIAL_SETTINGS,
      materials: parsed.materials || INITIAL_MATERIALS,
      suppliers: parsed.suppliers || INITIAL_SUPPLIERS,
      customers: parsed.customers || INITIAL_CUSTOMERS,
      quotations: parsed.quotations || INITIAL_QUOTATIONS,
      orders: parsed.orders || INITIAL_ORDERS,
      purchases: parsed.purchases || INITIAL_PURCHASES,
      lorryTrips: parsed.lorryTrips || INITIAL_LORRY_TRIPS,
      loadProfits: parsed.loadProfits || INITIAL_LOAD_PROFITS,
      stockLedger: parsed.stockLedger || INITIAL_STOCK_LEDGER,
      expenses: parsed.expenses || INITIAL_EXPENSES,
      payments: parsed.payments || INITIAL_PAYMENTS,
      quarrySites: parsed.quarrySites || INITIAL_QUARRY_SITES,
      productionLogs: parsed.productionLogs || INITIAL_PRODUCTION_LOGS,
      machinery: parsed.machinery || INITIAL_MACHINERY,
      maintenanceRecords: parsed.maintenanceRecords || INITIAL_MAINTENANCE,
      documents: parsed.documents || INITIAL_DOCUMENTS,
      notifications: parsed.notifications || INITIAL_NOTIFICATIONS,
      auditLogs: parsed.auditLogs || INITIAL_AUDIT_LOGS
    };
  } catch (e) {
    console.error('Failed to load state from localStorage:', e);
    return cachedState;
  }
}

function saveStateToStorage(state: AppState) {
  cachedState = state;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist to localStorage:', e);
    }
  }
  listeners.forEach((fn) => fn(cachedState));
}

// Global accessor
export function getStoreState(): AppState {
  if (typeof window !== 'undefined') {
    cachedState = loadStateFromStorage();
  }
  return cachedState;
}

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Helper to log audit actions automatically
export function recordAudit(action: string, module: string, details: string) {
  const state = getStoreState();
  const newAudit: AuditLogItem = {
    id: `aud_${Date.now()}`,
    timestamp: new Date().toISOString(),
    userName: state.currentUser.name,
    userRole: state.currentUser.role,
    action,
    module,
    details
  };
  saveStateToStorage({
    ...state,
    auditLogs: [newAudit, ...state.auditLogs]
  });
}

// ----------------- MUTATIONS -----------------

export function setBusinessMode(mode: BusinessMode) {
  const state = getStoreState();
  const newSettings = { ...state.settings, businessMode: mode };
  saveStateToStorage({ ...state, settings: newSettings });
  recordAudit('Mode Switch', 'Settings', `Switched application business mode to ${mode.toUpperCase()} MODE.`);
}

export function updateSettings(newSettings: Partial<BusinessSettings>) {
  const state = getStoreState();
  const updated = { ...state.settings, ...newSettings };
  saveStateToStorage({ ...state, settings: updated });
  recordAudit('Update Settings', 'Settings', 'Updated company profile and taxation settings.');
}

export function setCurrentUser(user: UserProfile) {
  const state = getStoreState();
  saveStateToStorage({ ...state, currentUser: user });
  recordAudit('User Switch', 'Authentication', `Logged in as ${user.name} (${user.role.toUpperCase()}).`);
}

// --- Materials ---
export function saveMaterial(mat: Material) {
  const state = getStoreState();
  const exists = state.materials.some((m) => m.id === mat.id);
  let updatedMaterials: Material[];

  if (exists) {
    updatedMaterials = state.materials.map((m) => (m.id === mat.id ? { ...mat, updatedAt: new Date().toISOString() } : m));
    recordAudit('Update Material', 'Material Catalogue', `Updated specifications for material ${mat.name} (${mat.code}).`);
  } else {
    updatedMaterials = [{ ...mat, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...state.materials];
    recordAudit('Create Material', 'Material Catalogue', `Added new material ${mat.name} (${mat.code}) to catalogue.`);
  }

  saveStateToStorage({ ...state, materials: updatedMaterials });
}

export function deleteMaterial(id: string) {
  const state = getStoreState();
  const mat = state.materials.find((m) => m.id === id);
  const updated = state.materials.filter((m) => m.id !== id);
  saveStateToStorage({ ...state, materials: updated });
  recordAudit('Delete Material', 'Material Catalogue', `Removed material ${mat?.name || id}.`);
}

// --- Suppliers ---
export function saveSupplier(sup: Supplier) {
  const state = getStoreState();
  const exists = state.suppliers.some((s) => s.id === sup.id);
  let updatedSuppliers: Supplier[];

  if (exists) {
    updatedSuppliers = state.suppliers.map((s) => (s.id === sup.id ? sup : s));
    recordAudit('Update Supplier', 'Suppliers Directory', `Updated details for supplier ${sup.name}.`);
  } else {
    updatedSuppliers = [{ ...sup, createdAt: new Date().toISOString() }, ...state.suppliers];
    recordAudit('Create Supplier', 'Suppliers Directory', `Added new supplier/quarry owner ${sup.name}.`);
  }

  saveStateToStorage({ ...state, suppliers: updatedSuppliers });
}

export function deleteSupplier(id: string) {
  const state = getStoreState();
  const sup = state.suppliers.find((s) => s.id === id);
  saveStateToStorage({
    ...state,
    suppliers: state.suppliers.filter((s) => s.id !== id)
  });
  recordAudit('Delete Supplier', 'Suppliers Directory', `Deleted supplier record ${sup?.name || id}.`);
}

// --- Customers ---
export function saveCustomer(cust: Customer) {
  const state = getStoreState();
  const exists = state.customers.some((c) => c.id === cust.id);
  let updatedCustomers: Customer[];

  if (exists) {
    updatedCustomers = state.customers.map((c) => (c.id === cust.id ? cust : c));
    recordAudit('Update Customer', 'Customer CRM', `Updated profile for customer ${cust.companyName}.`);
  } else {
    updatedCustomers = [{ ...cust, createdAt: new Date().toISOString() }, ...state.customers];
    recordAudit('Create Customer', 'Customer CRM', `Added new B2B customer ${cust.companyName}.`);
  }

  saveStateToStorage({ ...state, customers: updatedCustomers });
}

export function deleteCustomer(id: string) {
  const state = getStoreState();
  const cust = state.customers.find((c) => c.id === id);
  saveStateToStorage({
    ...state,
    customers: state.customers.filter((c) => c.id !== id)
  });
  recordAudit('Delete Customer', 'Customer CRM', `Deleted customer ${cust?.companyName || id}.`);
}

// --- Quotations ---
export function saveQuotation(quotation: Quotation) {
  const state = getStoreState();
  const exists = state.quotations.some((q) => q.id === quotation.id);
  const updated = exists
    ? state.quotations.map((q) => (q.id === quotation.id ? quotation : q))
    : [quotation, ...state.quotations];
  saveStateToStorage({ ...state, quotations: updated });
  recordAudit('Save Quotation', 'Quotations', `Quotation ${quotation.quotationNumber} saved for ${quotation.customerName}.`);
}

export function convertQuotationToOrder(quotationId: string): SalesOrder | null {
  const state = getStoreState();
  const quote = state.quotations.find((q) => q.id === quotationId);
  if (!quote) return null;

  const customer = state.customers.find((c) => c.id === quote.customerId);
  const orderNumber = `VS-ORD-${new Date().getFullYear()}-${String(state.orders.length + 1).padStart(4, '0')}`;
  
  const newOrder: SalesOrder = {
    id: `ord_${Date.now()}`,
    orderNumber,
    quotationId: quote.id,
    customerId: quote.customerId,
    customerName: quote.customerName,
    customerPhone: customer?.phone || '',
    customerGstin: customer?.gstin || '',
    deliveryAddress: customer?.deliveryAddress || customer?.billingAddress || '',
    destinationCity: customer?.district || 'Bangalore',
    destinationState: customer?.state || 'Karnataka',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    status: 'confirmed',
    paymentStatus: 'pending',
    items: quote.items.map((qi) => ({
      id: `soi_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      materialId: qi.materialId,
      materialName: qi.materialName,
      quantity: qi.quantity,
      unit: qi.unit,
      unitPrice: qi.unitPrice,
      discount: qi.discount,
      taxRatePercent: qi.taxRatePercent,
      taxAmount: qi.taxAmount,
      lineTotal: qi.lineTotal
    })),
    subtotal: quote.subtotal,
    taxAmount: quote.totalTax,
    deliveryCharges: quote.deliveryCharges,
    grandTotal: quote.grandTotal,
    advancePaid: 0,
    balanceDue: quote.grandTotal,
    createdAt: new Date().toISOString()
  };

  const updatedQuotations = state.quotations.map((q) =>
    q.id === quotationId ? { ...q, status: 'converted' as const } : q
  );

  saveStateToStorage({
    ...state,
    quotations: updatedQuotations,
    orders: [newOrder, ...state.orders]
  });

  recordAudit('Convert Quotation', 'Sales Orders', `Converted Quotation ${quote.quotationNumber} into Sales Order ${orderNumber}.`);
  return newOrder;
}

// --- Sales Orders ---
export function saveSalesOrder(order: SalesOrder) {
  const state = getStoreState();
  const exists = state.orders.some((o) => o.id === order.id);
  const updated = exists
    ? state.orders.map((o) => (o.id === order.id ? order : o))
    : [order, ...state.orders];
  saveStateToStorage({ ...state, orders: updated });
  recordAudit('Save Order', 'Sales Orders', `Saved Order ${order.orderNumber} for ${order.customerName} (₹ ${order.grandTotal}).`);
}

export function confirmOrderDelivery(orderId: string, weighbridgeRef: string, confirmedBy: string) {
  const state = getStoreState();
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return;

  const updatedOrders = state.orders.map((o) => {
    if (o.id === orderId) {
      return {
        ...o,
        status: 'delivered' as const,
        weighbridgeRef,
        deliveryConfirmedBy: confirmedBy,
        deliveryConfirmedAt: new Date().toISOString(),
        invoiceNumber: o.invoiceNumber || `VS-INV-${new Date().getFullYear()}-${String(state.orders.length).padStart(4, '0')}`,
        invoiceDate: o.invoiceDate || new Date().toISOString().split('T')[0]
      };
    }
    return o;
  });

  // Deduct stock for delivered order items
  let updatedMaterials = [...state.materials];
  const newLedgerEntries: StockLedgerEntry[] = [];

  for (const item of order.items) {
    const matIndex = updatedMaterials.findIndex((m) => m.id === item.materialId);
    if (matIndex >= 0) {
      const current = updatedMaterials[matIndex];
      const newStock = Math.max(0, current.currentStock - item.quantity);
      updatedMaterials[matIndex] = { ...current, currentStock: newStock };

      newLedgerEntries.push({
        id: `stk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        date: new Date().toISOString().split('T')[0],
        materialId: item.materialId,
        materialName: item.materialName,
        movementType: 'sales_out',
        quantityChange: -item.quantity,
        unit: item.unit,
        balanceAfter: newStock,
        location: current.stockLocation || 'Stockyard',
        referenceType: 'sales_order',
        referenceId: order.id,
        performedBy: confirmedBy,
        reason: `Dispatched against confirmed Order ${order.orderNumber}`
      });
    }
  }

  saveStateToStorage({
    ...state,
    orders: updatedOrders,
    materials: updatedMaterials,
    stockLedger: [...newLedgerEntries, ...state.stockLedger]
  });

  recordAudit('Confirm Delivery', 'Sales Orders', `Confirmed delivery for Order ${order.orderNumber} with weighbridge slip ${weighbridgeRef}.`);
}

// --- Purchase Orders ---
export function savePurchaseOrder(po: PurchaseOrder) {
  const state = getStoreState();
  const exists = state.purchases.some((p) => p.id === po.id);
  const updated = exists
    ? state.purchases.map((p) => (p.id === po.id ? po : p))
    : [po, ...state.purchases];
  saveStateToStorage({ ...state, purchases: updated });
  recordAudit('Save PO', 'Purchases', `Purchase Order ${po.poNumber} saved for ${po.supplierName}.`);
}

export function confirmPurchaseReceipt(
  poId: string,
  receivedItems: { materialId: string; receivedQty: number }[],
  confirmedBy: string,
  stockLocation: string,
  supplierInvoiceNo: string
) {
  const state = getStoreState();
  const po = state.purchases.find((p) => p.id === poId);
  if (!po) return;

  let totalShortage = 0;
  const updatedItems = po.items.map((item) => {
    const rec = receivedItems.find((r) => r.materialId === item.materialId);
    const recQty = rec ? rec.receivedQty : item.orderedQuantity;
    if (recQty < item.orderedQuantity) {
      totalShortage += (item.orderedQuantity - recQty);
    }
    return {
      ...item,
      receivedQuantity: recQty
    };
  });

  const updatedPurchases = state.purchases.map((p) => {
    if (p.id === poId) {
      return {
        ...p,
        items: updatedItems,
        status: 'received' as const,
        receivedConfirmedBy: confirmedBy,
        receivedAt: new Date().toISOString(),
        stockLocationReceived: stockLocation,
        supplierInvoiceNo,
        shortageDamageQty: totalShortage
      };
    }
    return p;
  });

  // Inward stock into inventory
  let updatedMaterials = [...state.materials];
  const newLedgerEntries: StockLedgerEntry[] = [];

  for (const item of updatedItems) {
    const matIndex = updatedMaterials.findIndex((m) => m.id === item.materialId);
    if (matIndex >= 0) {
      const current = updatedMaterials[matIndex];
      const newStock = current.currentStock + item.receivedQuantity;
      updatedMaterials[matIndex] = { ...current, currentStock: newStock, stockLocation };

      newLedgerEntries.push({
        id: `stk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        date: new Date().toISOString().split('T')[0],
        materialId: item.materialId,
        materialName: item.materialName,
        movementType: 'purchase_in',
        quantityChange: item.receivedQuantity,
        unit: item.unit,
        balanceAfter: newStock,
        location: stockLocation,
        referenceType: 'purchase_order',
        referenceId: po.id,
        performedBy: confirmedBy,
        reason: `Goods receipt from supplier ${po.supplierName} (Inv: ${supplierInvoiceNo})`
      });
    }
  }

  saveStateToStorage({
    ...state,
    purchases: updatedPurchases,
    materials: updatedMaterials,
    stockLedger: [...newLedgerEntries, ...state.stockLedger]
  });

  recordAudit('Confirm Goods Receipt', 'Purchases', `Received stock for PO ${po.poNumber} at ${stockLocation}.`);
}

// --- Lorry Trips & Load Profit Calculations ---
export function saveLorryTrip(trip: LorryTrip) {
  const state = getStoreState();
  const exists = state.lorryTrips.some((t) => t.id === trip.id);
  const updatedTrips = exists
    ? state.lorryTrips.map((t) => (t.id === trip.id ? trip : t))
    : [trip, ...state.lorryTrips];

  // Auto-calculate load-wise profit record
  const salesOrder = state.orders.find((o) => o.id === trip.salesOrderId);
  const purchaseOrder = state.purchases.find((p) => p.id === trip.purchaseOrderId);

  const matchedSalesItem = salesOrder?.items.find((i) => i.materialId === trip.materialId);
  const matchedPurchaseItem = purchaseOrder?.items.find((i) => i.materialId === trip.materialId);

  const sellingRate = matchedSalesItem?.unitPrice || 12500;
  const purchaseRate = matchedPurchaseItem?.negotiatedRate || 8000;
  const qty = trip.netWeightMT > 0 ? trip.netWeightMT : trip.orderedQuantityMT;

  const totalSalesRevenue = Number((sellingRate * qty).toFixed(2));
  const totalSupplierCost = Number((purchaseRate * qty).toFixed(2));
  const freightCost = trip.totalFreight;
  const loadingUnloadingCost = trip.loadingCharges + trip.unloadingCharges;
  const tollPermitCost = trip.tollsAndPermits;
  const totalDirectCosts = totalSupplierCost + freightCost + loadingUnloadingCost + tollPermitCost;
  const grossProfit = Number((totalSalesRevenue - totalDirectCosts).toFixed(2));
  const grossProfitPerMT = qty > 0 ? Number((grossProfit / qty).toFixed(2)) : 0;
  const grossMarginPercent = totalSalesRevenue > 0 ? Number(((grossProfit / totalSalesRevenue) * 100).toFixed(2)) : 0;

  const existingProfitIndex = state.loadProfits.findIndex((lp) => lp.tripId === trip.id);
  const profitRecord: LoadProfitCalculation = {
    id: existingProfitIndex >= 0 ? state.loadProfits[existingProfitIndex].id : `lp_${Date.now()}`,
    tripId: trip.id,
    tripNumber: trip.tripNumber,
    customerName: trip.customerName,
    supplierName: trip.supplierName,
    materialName: trip.materialName,
    quantityMT: qty,
    customerSellingRatePerMT: sellingRate,
    totalSalesRevenue,
    supplierPurchaseRatePerMT: purchaseRate,
    totalSupplierCost,
    freightCost,
    loadingUnloadingCost,
    tollPermitCost,
    otherDirectCosts: 0,
    totalDirectCosts,
    grossProfit,
    grossProfitPerMT,
    grossMarginPercent,
    customerPaymentStatus: 'pending',
    transporterPaymentStatus: trip.status === 'settled' ? 'settled' : 'pending',
    supplierPaymentStatus: 'pending',
    date: trip.dispatchDate,
    notes: `Calculated from Trip ${trip.tripNumber} (${trip.lorryNumber})`
  };

  let updatedLoadProfits: LoadProfitCalculation[];
  if (existingProfitIndex >= 0) {
    updatedLoadProfits = state.loadProfits.map((lp, idx) => (idx === existingProfitIndex ? profitRecord : lp));
  } else {
    updatedLoadProfits = [profitRecord, ...state.loadProfits];
  }

  saveStateToStorage({
    ...state,
    lorryTrips: updatedTrips,
    loadProfits: updatedLoadProfits
  });

  recordAudit('Save Lorry Trip', 'Transport Logistics', `Recorded Trip ${trip.tripNumber} with Lorry ${trip.lorryNumber} (${qty} MT).`);
}

// --- Payments & Receivables / Payables ---
export function recordPayment(payment: PaymentTransaction) {
  const state = getStoreState();
  const updatedPayments = [payment, ...state.payments];

  let updatedOrders = [...state.orders];
  let updatedPurchases = [...state.purchases];
  let updatedCustomers = [...state.customers];
  let updatedSuppliers = [...state.suppliers];

  // If customer receipt with allocated invoice
  if (payment.paymentType === 'customer_receipt' && payment.allocatedInvoiceId) {
    updatedOrders = updatedOrders.map((o) => {
      if (o.id === payment.allocatedInvoiceId) {
        const newPaid = o.advancePaid + payment.amount;
        const newBalance = Math.max(0, o.grandTotal - newPaid);
        const newPaymentStatus = newBalance === 0 ? ('paid' as const) : ('partial' as const);
        return {
          ...o,
          advancePaid: newPaid,
          balanceDue: newBalance,
          paymentStatus: newPaymentStatus
        };
      }
      return o;
    });

    // Update customer outstanding balance
    updatedCustomers = updatedCustomers.map((c) => {
      if (c.id === payment.partyId) {
        return {
          ...c,
          outstandingBalance: Math.max(0, c.outstandingBalance - payment.amount)
        };
      }
      return c;
    });
  }

  // If supplier payment with allocated PO
  if (payment.paymentType === 'supplier_payment' && payment.allocatedInvoiceId) {
    updatedPurchases = updatedPurchases.map((p) => {
      if (p.id === payment.allocatedInvoiceId) {
        const newPaid = p.amountPaid + payment.amount;
        const newBalance = Math.max(0, p.landedCost - newPaid);
        const newPaymentStatus = newBalance === 0 ? ('paid' as const) : ('partial' as const);
        return {
          ...p,
          amountPaid: newPaid,
          balancePayable: newBalance,
          paymentStatus: newPaymentStatus
        };
      }
      return p;
    });

    updatedSuppliers = updatedSuppliers.map((s) => {
      if (s.id === payment.partyId) {
        return {
          ...s,
          outstandingBalance: Math.max(0, s.outstandingBalance - payment.amount)
        };
      }
      return s;
    });
  }

  saveStateToStorage({
    ...state,
    payments: updatedPayments,
    orders: updatedOrders,
    purchases: updatedPurchases,
    customers: updatedCustomers,
    suppliers: updatedSuppliers
  });

  recordAudit('Record Payment', 'Payments', `Recorded ${payment.paymentType} of ₹ ${payment.amount} for ${payment.partyName} (Ref: ${payment.referenceNumber}).`);
}

// --- Expenses ---
export function saveExpense(expense: BusinessExpense) {
  const state = getStoreState();
  const exists = state.expenses.some((e) => e.id === expense.id);
  const updated = exists
    ? state.expenses.map((e) => (e.id === expense.id ? expense : e))
    : [expense, ...state.expenses];
  saveStateToStorage({ ...state, expenses: updated });
  recordAudit('Save Expense', 'Expenses', `Logged expense of ₹ ${expense.amount} under ${expense.category}.`);
}

// --- Stock Ledger Manual Adjustment ---
export function addStockAdjustment(materialId: string, quantityChange: number, reason: string, location: string) {
  const state = getStoreState();
  const matIndex = state.materials.findIndex((m) => m.id === materialId);
  if (matIndex === -1) return;

  const mat = state.materials[matIndex];
  const newStock = Math.max(0, mat.currentStock + quantityChange);
  const updatedMaterials = [...state.materials];
  updatedMaterials[matIndex] = { ...mat, currentStock: newStock };

  const entry: StockLedgerEntry = {
    id: `stk_${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    materialId: mat.id,
    materialName: mat.name,
    movementType: 'adjustment',
    quantityChange,
    unit: mat.defaultUnit,
    balanceAfter: newStock,
    location: location || mat.stockLocation,
    referenceType: 'manual_adjustment',
    referenceId: `ADJ-${Date.now()}`,
    performedBy: state.currentUser.name,
    reason
  };

  saveStateToStorage({
    ...state,
    materials: updatedMaterials,
    stockLedger: [entry, ...state.stockLedger]
  });

  recordAudit('Stock Adjustment', 'Inventory', `Adjusted stock for ${mat.name} by ${quantityChange > 0 ? '+' : ''}${quantityChange} ${mat.defaultUnit} (${reason}).`);
}

// --- Quarry Operations ---
export function saveQuarrySite(site: QuarrySite) {
  const state = getStoreState();
  const exists = state.quarrySites.some((s) => s.id === site.id);
  const updated = exists
    ? state.quarrySites.map((s) => (s.id === site.id ? site : s))
    : [site, ...state.quarrySites];
  saveStateToStorage({ ...state, quarrySites: updated });
  recordAudit('Save Quarry Site', 'Quarry Operations', `Registered quarry location ${site.name} (${site.siteCode}).`);
}

export function saveProductionLog(log: QuarryProductionLog) {
  const state = getStoreState();
  const totalCost = log.fuelConsumedLitres * 95 + log.labourWagesPaid + log.crushingScreeningExpense;
  const calculatedCostPerTon = log.producedQuantityMT > 0 ? Number((totalCost / log.producedQuantityMT).toFixed(2)) : 0;
  const fullLog = { ...log, calculatedCostPerTon };

  const exists = state.productionLogs.some((l) => l.id === log.id);
  const updated = exists
    ? state.productionLogs.map((l) => (l.id === log.id ? fullLog : l))
    : [fullLog, ...state.productionLogs];

  saveStateToStorage({ ...state, productionLogs: updated });
  recordAudit('Log Quarry Production', 'Quarry Operations', `Logged ${log.producedQuantityMT} MT extraction at ${log.quarrySiteName} (Cost: ₹ ${calculatedCostPerTon}/MT).`);
}

// --- Machinery ---
export function saveMachinery(machine: HeavyMachinery) {
  const state = getStoreState();
  const exists = state.machinery.some((m) => m.id === machine.id);
  const updated = exists
    ? state.machinery.map((m) => (m.id === machine.id ? machine : m))
    : [machine, ...state.machinery];
  saveStateToStorage({ ...state, machinery: updated });
  recordAudit('Save Machinery', 'Equipment Register', `Saved equipment record ${machine.name} (${machine.serialNumber}).`);
}

export function saveMaintenanceRecord(record: MaintenanceRecord) {
  const state = getStoreState();
  const updatedRecords = [record, ...state.maintenanceRecords];
  
  // Update total maintenance cost on machine
  const updatedMachinery = state.machinery.map((m) => {
    if (m.id === record.machineId) {
      return {
        ...m,
        lastServiceDate: record.date,
        totalMaintenanceExpense: m.totalMaintenanceExpense + record.cost
      };
    }
    return m;
  });

  saveStateToStorage({
    ...state,
    machinery: updatedMachinery,
    maintenanceRecords: updatedRecords
  });

  recordAudit('Log Maintenance', 'Equipment Register', `Completed ${record.serviceType} on ${record.machineName} (Cost: ₹ ${record.cost}).`);
}

// --- Notifications ---
export function markNotificationRead(id: string) {
  const state = getStoreState();
  const updated = state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  saveStateToStorage({ ...state, notifications: updated });
}

export function markAllNotificationsRead() {
  const state = getStoreState();
  const updated = state.notifications.map((n) => ({ ...n, isRead: true }));
  saveStateToStorage({ ...state, notifications: updated });
}

// --- Reset / Clear Demo Data ---
export function resetToDemoData() {
  const initialFreshState: AppState = {
    currentUser: INITIAL_USER,
    settings: { ...INITIAL_SETTINGS, demoMode: true },
    materials: INITIAL_MATERIALS,
    suppliers: INITIAL_SUPPLIERS,
    customers: INITIAL_CUSTOMERS,
    quotations: INITIAL_QUOTATIONS,
    orders: INITIAL_ORDERS,
    purchases: INITIAL_PURCHASES,
    lorryTrips: INITIAL_LORRY_TRIPS,
    loadProfits: INITIAL_LOAD_PROFITS,
    stockLedger: INITIAL_STOCK_LEDGER,
    expenses: INITIAL_EXPENSES,
    payments: INITIAL_PAYMENTS,
    quarrySites: INITIAL_QUARRY_SITES,
    productionLogs: INITIAL_PRODUCTION_LOGS,
    machinery: INITIAL_MACHINERY,
    maintenanceRecords: INITIAL_MAINTENANCE,
    documents: INITIAL_DOCUMENTS,
    notifications: INITIAL_NOTIFICATIONS,
    auditLogs: INITIAL_AUDIT_LOGS
  };
  saveStateToStorage(initialFreshState);
  recordAudit('Reset Demo Data', 'Settings', 'Reset system dataset to standard sample demo state.');
}

export function clearAllData() {
  const emptyState: AppState = {
    currentUser: INITIAL_USER,
    settings: { ...INITIAL_SETTINGS, demoMode: false },
    materials: [],
    suppliers: [],
    customers: [],
    quotations: [],
    orders: [],
    purchases: [],
    lorryTrips: [],
    loadProfits: [],
    stockLedger: [],
    expenses: [],
    payments: [],
    quarrySites: [],
    productionLogs: [],
    machinery: [],
    maintenanceRecords: [],
    documents: [],
    notifications: [],
    auditLogs: [
      {
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userName: INITIAL_USER.name,
        userRole: INITIAL_USER.role,
        action: 'Clear Data',
        module: 'Settings',
        details: 'Cleared all transaction and operational records for production setup.'
      }
    ]
  };
  saveStateToStorage(emptyState);
}
