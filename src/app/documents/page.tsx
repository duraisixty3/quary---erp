'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderLock,
  Plus,
  Search,
  Filter,
  FileText,
  Download,
  Calendar,
  Eye,
  CheckCircle2,
  UploadCloud
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { getStoreState, subscribeToStore, AppState } from '@/lib/storage/store';
import { formatDateDDMMYYYY } from '@/lib/utils';
import { DocumentItem } from '@/types';

export default function DocumentsPage() {
  const [state, setState] = useState<AppState>(getStoreState());
  const [documents, setDocuments] = useState<DocumentItem[]>(state.documents);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Form State
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<any>('Weighbridge Slip');
  const [relatedEntity, setRelatedEntity] = useState('Trip TRIP-2026-0084');

  useEffect(() => {
    setState(getStoreState());
    return subscribeToStore((s) => {
      setState(s);
      setDocuments(s.documents);
    });
  }, []);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) {
      alert('Document title is required.');
      return;
    }

    const newDoc: DocumentItem = {
      id: `doc_${Date.now()}`,
      title: docTitle.trim(),
      category: docCategory,
      relatedEntity: relatedEntity.trim(),
      fileSize: '1.2 MB',
      uploadedAt: new Date().toISOString(),
      uploadedBy: state.currentUser.name
    };

    setDocuments([newDoc, ...documents]);
    setIsUploadModalOpen(false);
  };

  const filteredDocs = documents.filter((doc) => {
    if (selectedCategory !== 'all' && doc.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return doc.title.toLowerCase().includes(q) || doc.relatedEntity.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Central Digital Document & Compliance Vault
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Secure storage for weighbridge certified slips, GST tax invoices, quarry mining leases, and TNPCB/KSPCB NOCs.
          </p>
        </div>

        <Button variant="orange" size="sm" onClick={() => setIsUploadModalOpen(true)}>
          <UploadCloud className="h-4 w-4 mr-1.5" />
          Upload Compliance Document
        </Button>
      </div>

      {/* Filter and Search */}
      <Card className="shadow-xs">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[260px] max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by document title or related record..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-4 py-2 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 focus:border-orange-500 focus:outline-none"
              >
                <option value="all">All Document Types</option>
                <option value="Weighbridge Slip">Weighbridge Slips</option>
                <option value="GST Invoice">GST Invoices</option>
                <option value="Quarry Lease Permit">Quarry Lease Permits</option>
                <option value="Pollution Board NOC">Pollution Board NOCs</option>
                <option value="E-Way Bill">E-Way Bills</option>
              </select>
            </div>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            <strong>{filteredDocs.length}</strong> documents archived
          </span>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map((doc) => (
          <Card key={doc.id} className="shadow-xs hover:border-slate-300 transition flex flex-col justify-between">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" size="sm" className="mb-1 font-mono">
                    {doc.category}
                  </Badge>
                  <CardTitle className="text-sm font-bold text-slate-900 mt-1">{doc.title}</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">{doc.relatedEntity}</p>
                </div>
                <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="py-3 text-xs space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>File Size:</span>
                <span className="font-mono font-medium text-slate-700">{doc.fileSize}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Uploaded On:</span>
                <span>{formatDateDDMMYYYY(doc.uploadedAt)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Archived By:</span>
                <span className="text-slate-800 font-medium">{doc.uploadedBy}</span>
              </div>
            </CardContent>

            <div className="p-3 bg-slate-50 border-t flex items-center justify-between">
              <span className="text-[10px] text-emerald-600 font-semibold inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Verified Secure
              </span>
              <button
                onClick={() => alert(`Downloading verified document: ${doc.title}`)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Compliance or Operational Document"
        description="Attach weighbridge slips, GST sales invoices, mining lease deeds, or pollution control NOCs."
        maxWidth="md"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Document Title *</label>
            <input
              type="text"
              required
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="e.g. Weighbridge Certified Slip WB-ATT-9011"
              className="w-full border rounded-lg p-2 font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Category *</label>
            <select
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value as any)}
              className="w-full border rounded-lg p-2 font-medium"
            >
              <option value="Weighbridge Slip">Weighbridge Slip</option>
              <option value="GST Invoice">GST Tax Invoice</option>
              <option value="Quarry Lease Permit">Quarry Lease Deed / Mining Permit</option>
              <option value="Pollution Board NOC">Pollution Board Consent (CTO)</option>
              <option value="E-Way Bill">E-Way Bill (Commercial Tax)</option>
              <option value="Transport Bilty">Transport Bilty / Lorry Receipt</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Related Entity / Reference *</label>
            <input
              type="text"
              required
              value={relatedEntity}
              onChange={(e) => setRelatedEntity(e.target.value)}
              placeholder="e.g. Trip TRIP-2026-0083 or Order VS-ORD-2026-0046"
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-500 hover:border-orange-500 transition cursor-pointer bg-slate-50">
            <UploadCloud className="h-8 w-8 mx-auto text-slate-400 mb-2" />
            <span className="font-semibold text-slate-800 block">Select PDF, JPG, or PNG File</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Maximum upload size 25MB</span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" type="button" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit">
              Archive Document
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
