'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Building,
  CreditCard,
  Edit2,
  Trash2,
  Download,
  Filter
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { getStoreState, subscribeToStore, AppState, saveCustomer, deleteCustomer } from '@/lib/storage/store';
import { formatINR } from '@/lib/utils';
import { Customer, CustomerType, CustomerStatus } from '@/types';

export default function CustomersPage() {
  const [state, setState] = useState<AppState>(getStoreState());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('landscaper');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [district, setDistrict] = useState('Bangalore Urban');
  const [customerState, setCustomerState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560001');
  const [gstin, setGstin] = useState('');
  const [paymentTermsDays, setPaymentTermsDays] = useState(30);
  const [creditLimit, setCreditLimit] = useState(500000);
  const [status, setStatus] = useState<CustomerStatus>('active');
  const [expectedMonthlyDemand, setExpectedMonthlyDemand] = useState(50);
  const [negotiatedPricingNotes, setNegotiatedPricingNotes] = useState('');

  useEffect(() => {
    setState(getStoreState());
    return subscribeToStore((s) => setState(s));
  }, []);

  const openCreateModal = () => {
    setEditingCustomer(null);
    setCompanyName('');
    setContactPerson('');
    setCustomerType('landscaper');
    setPhone('+91 ');
    setEmail('');
    setBillingAddress('');
    setDeliveryAddress('');
    setDistrict('Bangalore Urban');
    setCustomerState('Karnataka');
    setPincode('560087');
    setGstin('');
    setPaymentTermsDays(30);
    setCreditLimit(500000);
    setStatus('active');
    setExpectedMonthlyDemand(40);
    setNegotiatedPricingNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setCompanyName(cust.companyName);
    setContactPerson(cust.contactPerson);
    setCustomerType(cust.customerType);
    setPhone(cust.phone);
    setEmail(cust.email || '');
    setBillingAddress(cust.billingAddress);
    setDeliveryAddress(cust.deliveryAddress);
    setDistrict(cust.district);
    setCustomerState(cust.state);
    setPincode(cust.pincode);
    setGstin(cust.gstin || '');
    setPaymentTermsDays(cust.paymentTermsDays);
    setCreditLimit(cust.creditLimit);
    setStatus(cust.status);
    setExpectedMonthlyDemand(cust.expectedMonthlyDemandTonnes || 0);
    setNegotiatedPricingNotes(cust.negotiatedPricingNotes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !phone.trim()) {
      alert('Company name and phone number are required.');
      return;
    }

    const customerData: Customer = {
      id: editingCustomer ? editingCustomer.id : `cust_${Date.now()}`,
      companyName: companyName.trim(),
      contactPerson: contactPerson.trim(),
      customerType,
      phone: phone.trim(),
      email: email.trim(),
      billingAddress: billingAddress.trim(),
      deliveryAddress: deliveryAddress.trim() || billingAddress.trim(),
      district: district.trim(),
      state: customerState.trim(),
      pincode: pincode.trim(),
      gstin: gstin.trim().toUpperCase(),
      paymentTermsDays: Number(paymentTermsDays),
      creditLimit: Number(creditLimit),
      status,
      expectedMonthlyDemandTonnes: Number(expectedMonthlyDemand),
      negotiatedPricingNotes: negotiatedPricingNotes.trim(),
      totalRevenue: editingCustomer ? editingCustomer.totalRevenue : 0,
      outstandingBalance: editingCustomer ? editingCustomer.outstandingBalance : 0,
      createdAt: editingCustomer ? editingCustomer.createdAt : new Date().toISOString()
    };

    saveCustomer(customerData);
    setIsModalOpen(false);
  };

  const filteredCustomers = state.customers.filter((c) => {
    if (selectedType !== 'all' && c.customerType !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.companyName.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q) ||
        (c.gstin && c.gstin.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const exportCustomersCSV = () => {
    const headers = ['Company', 'Contact', 'Type', 'Phone', 'District', 'State', 'GSTIN', 'Total Revenue', 'Outstanding', 'Status'];
    const rows = filteredCustomers.map((c) => [
      `"${c.companyName}"`,
      `"${c.contactPerson}"`,
      c.customerType,
      c.phone,
      c.district,
      c.state,
      c.gstin || '',
      c.totalRevenue,
      c.outstandingBalance,
      c.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `Vajra_Customers_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Customer CRM & B2B Buyer Accounts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage landscaping firms, infrastructure contractors, garden centers, wholesalers, and credit limits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCustomersCSV}>
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
          <Button variant="orange" size="sm" onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="shadow-xs">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[240px] max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer name, contact, phone, or GSTIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-4 py-2 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 focus:border-orange-500 focus:outline-none"
              >
                <option value="all">All Buyer Types</option>
                <option value="landscaper">Landscaping Firms</option>
                <option value="contractor">Infrastructure Contractors</option>
                <option value="wholesaler">Stone Wholesalers</option>
                <option value="dealer">Material Dealers</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            <strong>{filteredCustomers.length}</strong> active buyer profiles
          </div>
        </CardContent>
      </Card>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCustomers.map((cust) => (
          <Card key={cust.id} className="hover:border-slate-300 transition shadow-xs flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="orange" size="sm" className="capitalize">
                      {cust.customerType}
                    </Badge>
                    <Badge variant={cust.status === 'active' ? 'success' : 'outline'} size="sm">
                      {cust.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-base text-slate-900">{cust.companyName}</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">{cust.contactPerson}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(cust)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove customer ${cust.companyName}?`)) {
                        deleteCustomer(cust.id);
                      }
                    }}
                    className="p-1 rounded text-rose-400 hover:text-rose-700"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="py-3 text-xs space-y-2.5">
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="font-mono">{cust.phone}</span>
              </div>

              {cust.deliveryAddress && (
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="truncate max-w-[240px]">{cust.deliveryAddress}</span>
                </div>
              )}

              {cust.gstin && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-1.5 py-0.5 rounded font-semibold">
                    GSTIN: {cust.gstin}
                  </span>
                </div>
              )}

              <div className="rounded-lg bg-slate-50 p-2.5 space-y-1 border border-slate-100 mt-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Total Billed Sales:</span>
                  <span className="font-semibold text-slate-900">{formatINR(cust.totalRevenue)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Receivable Balance:</span>
                  <span className={`font-bold ${cust.outstandingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {formatINR(cust.outstandingBalance)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Credit Limit:</span>
                  <span className="text-slate-700 font-semibold">{formatINR(cust.creditLimit)}</span>
                </div>
              </div>

              {cust.negotiatedPricingNotes && (
                <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded border border-amber-100">
                  {cust.negotiatedPricingNotes}
                </p>
              )}
            </CardContent>

            <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>{cust.district}, {cust.state}</span>
              <span>Terms: <strong>{cust.paymentTermsDays}D</strong></span>
            </div>
          </Card>
        ))}
      </div>

      {/* Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? `Edit Customer: ${editingCustomer.companyName}` : 'Add New B2B Customer'}
        description="Register landscaping company, stone wholesaler, or contractor with delivery addresses and credit limits."
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Company / Trade Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Brigade Green Landscapes Pvt Ltd"
                className="w-full border rounded-lg p-2 font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Contact Person</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. V. Rajesh Kumar"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Customer Category</label>
              <select
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value as CustomerType)}
                className="w-full border rounded-lg p-2"
              >
                <option value="landscaper">Landscaping Company</option>
                <option value="contractor">Infrastructure Contractor</option>
                <option value="wholesaler">Stone Wholesaler</option>
                <option value="dealer">Building Material Dealer</option>
                <option value="individual">Individual / Residential Buyer</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98801 54321"
                className="w-full border rounded-lg p-2 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="procurement@brigadegreen.com"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">GSTIN</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="29AABCB9012J1ZG"
                className="w-full border rounded-lg p-2 font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Billing Office Address</label>
              <input
                type="text"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                placeholder="Residency Road, Bangalore"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Site Delivery Address</label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Brigade Utopia Site, Varthur-Gunjur Road"
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">District / Market</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Bangalore Urban"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">State</label>
              <select
                value={customerState}
                onChange={(e) => setCustomerState(e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Kerala">Kerala</option>
                <option value="Telangana">Telangana (Hyderabad)</option>
                <option value="Maharashtra">Maharashtra (Pune/Mumbai)</option>
                <option value="Gujarat">Gujarat (Ahmedabad)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">PIN Code</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="560087"
                className="w-full border rounded-lg p-2 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="font-medium text-slate-600 block mb-1">Credit Terms (Days)</label>
              <input
                type="number"
                value={paymentTermsDays}
                onChange={(e) => setPaymentTermsDays(Number(e.target.value))}
                className="w-full border rounded-lg p-2 font-semibold"
              />
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Credit Limit (₹)</label>
              <input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                className="w-full border rounded-lg p-2 font-semibold"
              />
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Account Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CustomerStatus)}
                className="w-full border rounded-lg p-2 font-semibold"
              >
                <option value="active">Active Buyer</option>
                <option value="lead">Lead / Prospect</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Credit Blocked</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-medium text-slate-600 block mb-1">
              Negotiated Rate Notes / Special Commercial Clauses
            </label>
            <input
              type="text"
              value={negotiatedPricingNotes}
              onChange={(e) => setNegotiatedPricingNotes(e.target.value)}
              placeholder="e.g. ₹ 13,000/MT for White River Pebbles on minimum 20 MT loads"
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit">
              {editingCustomer ? 'Update Customer' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
