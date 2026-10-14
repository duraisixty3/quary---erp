import test from 'node:test';
import assert from 'node:assert/strict';

// Test 1: Unit Conversion using Material Density
function convertToTonnes(quantity, unit, densityFactor = 1.6) {
  if (!quantity) return 0;
  const density = densityFactor > 0 ? densityFactor : 1.6;
  switch (unit) {
    case 'MT':
      return quantity;
    case 'kg':
      return quantity / 1000;
    case 'm3':
      return quantity * density;
    case 'brass':
      return quantity * 2.83168 * density;
    default:
      return quantity;
  }
}

test('Unit Conversion: converts m3 and brass to MT correctly', () => {
  // 10 m3 with density 1.6 MT/m3 -> 16 MT
  assert.equal(convertToTonnes(10, 'm3', 1.6), 16.0);

  // 1000 kg -> 1 MT
  assert.equal(convertToTonnes(1000, 'kg', 1.6), 1.0);

  // 1 Brass (~2.83168 m3) with density 1.55 MT/m3 for 20mm jalli
  const brassMT = convertToTonnes(1, 'brass', 1.55);
  assert.ok(Math.abs(brassMT - 4.389) < 0.01, `Expected ~4.39 MT, got ${brassMT}`);
});

// Test 2: Sales Order Financial Calculations
function calculateOrderTotals(items, deliveryCharges = 0, advancePaid = 0) {
  let subtotal = 0;
  let taxAmount = 0;

  for (const item of items) {
    const lineNet = (item.unitPrice - (item.discount || 0)) * item.quantity;
    const lineTax = Number(((lineNet * item.taxRatePercent) / 100).toFixed(2));
    subtotal += lineNet;
    taxAmount += lineTax;
  }

  const grandTotal = Number((subtotal + taxAmount + Number(deliveryCharges)).toFixed(2));
  const balanceDue = Math.max(0, Number((grandTotal - Number(advancePaid)).toFixed(2)));

  return { subtotal, taxAmount, grandTotal, balanceDue };
}

test('Sales Order: calculates subtotal, 5% GST tax, delivery fee and balance due', () => {
  const items = [
    { quantity: 20, unitPrice: 13000, discount: 0, taxRatePercent: 5 }, // 2,60,000 + 13,000 tax
    { quantity: 10, unitPrice: 14500, discount: 500, taxRatePercent: 5 } // 1,40,000 + 7,000 tax
  ];
  const deliveryFee = 15000;
  const advance = 200000;

  const result = calculateOrderTotals(items, deliveryFee, advance);

  assert.equal(result.subtotal, 400000);
  assert.equal(result.taxAmount, 20000);
  assert.equal(result.grandTotal, 435000); // 4,00,000 + 20,000 + 15,000
  assert.equal(result.balanceDue, 235000); // 4,35,000 - 2,00,000
});

// Test 3: Load-Wise Profit Margin Calculation
function calculateLoadProfit({
  quantityMT,
  customerSellingRatePerMT,
  supplierPurchaseRatePerMT,
  freightCost,
  loadingCharges = 0,
  unloadingCharges = 0,
  tollPermitCost = 0,
  otherDirectCosts = 0
}) {
  const totalSalesRevenue = Number((quantityMT * customerSellingRatePerMT).toFixed(2));
  const totalSupplierCost = Number((quantityMT * supplierPurchaseRatePerMT).toFixed(2));
  const totalDirectCosts = totalSupplierCost + freightCost + loadingCharges + unloadingCharges + tollPermitCost + otherDirectCosts;
  const grossProfit = Number((totalSalesRevenue - totalDirectCosts).toFixed(2));
  const grossProfitPerMT = quantityMT > 0 ? Number((grossProfit / quantityMT).toFixed(2)) : 0;
  const grossMarginPercent = totalSalesRevenue > 0 ? Number(((grossProfit / totalSalesRevenue) * 100).toFixed(2)) : 0;

  return {
    totalSalesRevenue,
    totalSupplierCost,
    totalDirectCosts,
    grossProfit,
    grossProfitPerMT,
    grossMarginPercent
  };
}

test('Load-Wise Profitability: computes accurate gross profit and per-tonne margin', () => {
  const loadParams = {
    quantityMT: 25.0,
    customerSellingRatePerMT: 13000, // Sales: 3,25,000
    supplierPurchaseRatePerMT: 8500, // Sourcing: 2,12,500
    freightCost: 21250,              // Freight: 21,250
    loadingCharges: 2500,
    unloadingCharges: 2000,
    tollPermitCost: 1750,
    otherDirectCosts: 500
  };

  const pnl = calculateLoadProfit(loadParams);

  assert.equal(pnl.totalSalesRevenue, 325000.0);
  assert.equal(pnl.totalSupplierCost, 212500.0);
  assert.equal(pnl.totalDirectCosts, 240500.0);
  assert.equal(pnl.grossProfit, 84500.0);
  assert.equal(pnl.grossProfitPerMT, 3380.0); // 84,500 / 25 MT = 3,380 / MT
  assert.equal(pnl.grossMarginPercent, 26.0); // (84,500 / 3,25,000) * 100 = 26.0%
});

// Test 4: Payment Allocation & Balance Reduction
test('Payment Allocation: reduces customer invoice balance and updates payment status', () => {
  const invoice = { grandTotal: 369000, advancePaid: 180000, balanceDue: 189000, paymentStatus: 'partial' };
  const incomingPayment = 189000;

  const newPaid = invoice.advancePaid + incomingPayment;
  const newBalance = Math.max(0, invoice.grandTotal - newPaid);
  const newStatus = newBalance === 0 ? 'paid' : 'partial';

  assert.equal(newPaid, 369000);
  assert.equal(newBalance, 0);
  assert.equal(newStatus, 'paid');
});
