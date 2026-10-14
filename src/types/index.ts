export type BusinessMode = 'trading' | 'quarry' | 'combined';

export type UserRole = 'owner' | 'manager' | 'accountant' | 'sales' | 'operations';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

export interface BusinessSettings {
  id: string;
  businessName: string;
  tradeName: string;
  businessMode: BusinessMode;
  currency: string; // "INR"
  gstin: string;
  pan: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  bankName: string;
  bankAccountNo: string;
  bankIfsc: string;
  bankBranch: string;
  invoicePrefix: string;
  quotationPrefix: string;
  purchasePrefix: string;
  defaultGstRate: number; // e.g. 5% on stone or 18% on transport
  demoMode: boolean;
}

export type MaterialCategory = 'pebbles' | 'coloured_pebbles' | 'jalli_aggregates' | 'gravel' | 'm_sand' | 'boulders' | 'granite_slabs';
export type UnitOfMeasurement = 'MT' | 'kg' | 'm3' | 'brass' | 'sqft';

export interface Material {
  id: string;
  name: string;
  code: string;
  category: MaterialCategory;
  size?: string; // e.g. "10-20mm", "20mm", "40mm", "50-75mm"
  color?: string; // "Snow White", "River Natural", "Polished Black", "Red Jasper", "Grey Granite"
  grade?: string; // "Grade A", "Industrial", "Architectural", "Commercial"
  intendedApplication?: string; // "Landscaping", "Concrete Mix", "Garden Pathway", "Exposed Aggregate"
  defaultUnit: UnitOfMeasurement;
  densityFactor: number; // tonnes per cubic metre (e.g. 1.6 for pebbles, 1.55 for 20mm jalli)
  standardPurchasePrice: number; // per defaultUnit in INR
  standardSellingPrice: number; // per defaultUnit in INR
  minStockLevel: number; // in defaultUnit
  currentStock: number;
  stockLocation: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  gstin?: string;
  quarryLocation?: string;
  materialsSupplied: string[]; // Material IDs
  paymentTermsDays: number;
  creditLimit: number;
  totalPurchases: number;
  outstandingBalance: number;
  loadingAvailability: string; // "Immediate", "24hr notice", "Daytime only"
  notes?: string;
  createdAt: string;
}

export type CustomerType = 'landscaper' | 'dealer' | 'contractor' | 'wholesaler' | 'individual';
export type CustomerStatus = 'lead' | 'active' | 'inactive' | 'blocked';

export interface Customer {
  id: string;
  companyName: string;
  contactPerson: string;
  customerType: CustomerType;
  phone: string;
  email?: string;
  billingAddress: string;
  deliveryAddress: string;
  district: string;
  state: string;
  pincode: string;
  gstin?: string;
  paymentTermsDays: number;
  creditLimit: number;
  status: CustomerStatus;
  expectedMonthlyDemandTonnes?: number;
  negotiatedPricingNotes?: string;
  totalRevenue: number;
  outstandingBalance: number;
  createdAt: string;
}

export interface QuotationItem {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: UnitOfMeasurement;
  unitPrice: number;
  discount: number;
  taxRatePercent: number;
  taxAmount: number;
  lineTotal: number;
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted';

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  validUntil: string;
  items: QuotationItem[];
  subtotal: number;
  totalTax: number;
  deliveryCharges: number;
  grandTotal: number;
  terms: string;
  status: QuotationStatus;
  notes?: string;
  createdAt: string;
}

export type OrderStatus = 'draft' | 'confirmed' | 'dispatched' | 'delivered' | 'closed' | 'cancelled';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue';

export interface SalesOrderItem {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: UnitOfMeasurement;
  unitPrice: number;
  discount: number;
  taxRatePercent: number;
  taxAmount: number;
  lineTotal: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  quotationId?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerGstin?: string;
  deliveryAddress: string;
  destinationCity: string;
  destinationState: string;
  orderDate: string;
  expectedDeliveryDate: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: SalesOrderItem[];
  subtotal: number;
  taxAmount: number;
  deliveryCharges: number;
  grandTotal: number;
  advancePaid: number;
  balanceDue: number;
  invoiceNumber?: string;
  invoiceDate?: string;
  weighbridgeRef?: string;
  deliveryConfirmedBy?: string;
  deliveryConfirmedAt?: string;
  cancellationReason?: string;
  createdAt: string;
}

export type PurchaseStatus = 'requested' | 'ordered' | 'partially_received' | 'received' | 'cancelled';

export interface PurchaseOrderItem {
  id: string;
  materialId: string;
  materialName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unit: UnitOfMeasurement;
  negotiatedRate: number;
  taxRatePercent: number;
  taxAmount: number;
  lineTotal: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDispatchDate: string;
  status: PurchaseStatus;
  paymentStatus: PaymentStatus;
  items: PurchaseOrderItem[];
  subtotal: number;
  loadingCharges: number;
  taxAmount: number;
  landedCost: number;
  amountPaid: number;
  balancePayable: number;
  supplierInvoiceNo?: string;
  supplierInvoiceDate?: string;
  stockLocationReceived?: string;
  shortageDamageQty?: number;
  receivedConfirmedBy?: string;
  receivedAt?: string;
  notes?: string;
  createdAt: string;
}

export type TripStatus = 'planned' | 'loaded' | 'in_transit' | 'delivered' | 'settled' | 'cancelled';

export interface LorryTrip {
  id: string;
  tripNumber: string;
  lorryNumber: string; // e.g. "KA-01-AF-4512"
  transporterName: string;
  driverName: string;
  driverPhone: string;
  vehicleCapacityMT: number;
  salesOrderId?: string;
  purchaseOrderId?: string;
  customerName: string;
  supplierName: string;
  materialName: string;
  materialId: string;
  sourceQuarry: string;
  destinationSite: string;
  distanceKm: number;
  orderedQuantityMT: number;
  grossWeightMT?: number;
  tareWeightMT?: number;
  netWeightMT: number; // Delivered MT verified by weighbridge
  weighbridgeSlipNo?: string;
  loadingDate: string;
  dispatchDate: string;
  actualArrivalDate?: string;
  freightAgreedRate: number; // Flat or per MT
  totalFreight: number;
  loadingCharges: number;
  unloadingCharges: number;
  tollsAndPermits: number;
  driverAdvance: number;
  settlementAmount: number;
  status: TripStatus;
  isOverloaded: boolean;
  notes?: string;
  createdAt: string;
}

export interface LoadProfitCalculation {
  id: string;
  tripId: string;
  tripNumber: string;
  customerName: string;
  supplierName: string;
  materialName: string;
  quantityMT: number;
  customerSellingRatePerMT: number;
  totalSalesRevenue: number;
  supplierPurchaseRatePerMT: number;
  totalSupplierCost: number;
  freightCost: number;
  loadingUnloadingCost: number;
  tollPermitCost: number;
  otherDirectCosts: number;
  totalDirectCosts: number;
  grossProfit: number;
  grossProfitPerMT: number;
  grossMarginPercent: number;
  customerPaymentStatus: 'pending' | 'partial' | 'paid';
  transporterPaymentStatus: 'pending' | 'settled';
  supplierPaymentStatus: 'pending' | 'settled';
  date: string;
  notes?: string;
}

export type StockMovementType = 'purchase_in' | 'sales_out' | 'quarry_production' | 'damage_loss' | 'adjustment' | 'transfer';

export interface StockLedgerEntry {
  id: string;
  date: string;
  materialId: string;
  materialName: string;
  movementType: StockMovementType;
  quantityChange: number; // positive for additions, negative for deductions
  unit: UnitOfMeasurement;
  balanceAfter: number;
  location: string;
  referenceType: 'purchase_order' | 'sales_order' | 'quarry_batch' | 'manual_adjustment';
  referenceId: string;
  performedBy: string;
  reason?: string;
}

export type ExpenseCategory = 
  | 'freight_transport'
  | 'labour_wages'
  | 'fuel_diesel'
  | 'crusher_electricity'
  | 'explosives_blasting'
  | 'machinery_repairs'
  | 'stockyard_rent'
  | 'quarry_royalty'
  | 'office_admin'
  | 'other';

export interface BusinessExpense {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'upi' | 'cheque';
  description: string;
  vendorSupplierName?: string;
  relatedLorryTripId?: string;
  relatedQuarrySiteId?: string;
  isApproved: boolean;
  approvedBy?: string;
  isReversed?: boolean;
  receiptAttachmentNote?: string;
  createdAt: string;
}

export type PaymentMode = 'upi' | 'neft_rtgs' | 'cheque' | 'cash';
export type PaymentType = 'customer_receipt' | 'supplier_payment' | 'transporter_payment';

export interface PaymentTransaction {
  id: string;
  paymentType: PaymentType;
  date: string;
  partyName: string;
  partyId: string;
  amount: number;
  paymentMode: PaymentMode;
  referenceNumber: string; // UPI UTR or Cheque # or Bank Ref
  allocatedInvoiceId?: string;
  allocatedInvoiceNo?: string;
  isAdvance: boolean;
  notes?: string;
  createdAt: string;
}

export interface QuarrySite {
  id: string;
  name: string;
  siteCode: string;
  district: string;
  state: string;
  surveyNumbers: string;
  areaAcres: number;
  permitNumber: string;
  permitIssuingAuthority: string;
  permitIssueDate: string;
  permitExpiryDate: string;
  quarryType: 'Granite Aggregates' | 'Gravel / M-Sand' | 'River Bed Stone' | 'Sandstone';
  dailyCapacityMT: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

export interface QuarryProductionLog {
  id: string;
  quarrySiteId: string;
  quarrySiteName: string;
  date: string;
  shift: 'Day Shift' | 'Night Shift';
  materialProduced: string;
  producedQuantityMT: number;
  rejectedWasteMT: number;
  operatingHours: number;
  fuelConsumedLitres: number;
  labourWagesPaid: number;
  crushingScreeningExpense: number;
  calculatedCostPerTon: number;
  supervisorName: string;
  createdAt: string;
}

export interface HeavyMachinery {
  id: string;
  name: string;
  type: 'Jaw Crusher' | 'Cone Crusher' | 'Vibratory Screen' | 'Excavator' | 'Wheel Loader' | 'Tipper Lorry';
  serialNumber: string;
  quarrySiteId?: string;
  purchaseDate: string;
  purchaseCost: number;
  totalOperatingHours: number;
  fuelConsumptionRateLph: number;
  lastServiceDate: string;
  nextServiceDueDate: string;
  status: 'operational' | 'under_maintenance' | 'idle';
  totalMaintenanceExpense: number;
}

export interface MaintenanceRecord {
  id: string;
  machineId: string;
  machineName: string;
  date: string;
  serviceType: 'Routine Oil & Filter' | 'Screen Mesh Replacement' | 'Jaw Plate Welds' | 'Hydraulic Repair' | 'Breakdown Repair';
  hourMeterReading: number;
  cost: number;
  technicianName: string;
  sparePartsReplaced: string;
  downtimeHours: number;
  notes?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'Weighbridge Slip' | 'GST Invoice' | 'Quarry Lease Permit' | 'Pollution Board NOC' | 'E-Way Bill' | 'Transport Bilty';
  relatedEntity: string;
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  downloadUrl?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'payment_overdue' | 'low_stock' | 'permit_expiry' | 'maintenance_due' | 'order_alert' | 'general';
  severity: 'info' | 'warning' | 'critical';
  date: string;
  isRead: boolean;
  linkUrl?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
}
