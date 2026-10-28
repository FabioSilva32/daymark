'use client';

import React, { useState, useEffect } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { StorageAPI } from '@/lib/storage';
import { DocumentRecord } from '@/types';
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  FolderArchive,
  Upload,
  FileText,
  Trash2,
  Download,
  Search,
  Eye,
  Tag,
} from 'lucide-react';

export default function DocumentsPage() {
  const { storageVersion, refreshStorage, addToast } = useDaymark();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [fileName, setFileName] = useState('');
  const [folder, setFolder] = useState('Personal');
  const [description, setDescription] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [fileDataUrl, setFileDataUrl] = useState<string | undefined>(undefined);
  const [fileSize, setFileSize] = useState<number>(1024);
  const [mimeType, setMimeType] = useState('text/plain');

  useEffect(() => {
    setDocuments(StorageAPI.getDocuments());
  }, [storageVersion]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(file.size);
    setMimeType(file.type || 'application/octet-stream');

    // Read preview if text or image
    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newDoc: DocumentRecord = {
      id: 'doc_' + Date.now(),
      fileName: fileName.trim(),
      fileSizeBytes: fileSize,
      mimeType,
      folder,
      description: description.trim() || undefined,
      tags,
      fileDataUrl,
      createdAt: new Date().toISOString(),
    };

    StorageAPI.saveDocument(newDoc);
    addToast('Document Record Saved', newDoc.fileName, 'success');
    setFileName('');
    setDescription('');
    setTagsStr('');
    setFileDataUrl(undefined);
    setIsModalOpen(false);
    refreshStorage();
  };

  const deleteDoc = (id: string) => {
    StorageAPI.deleteDocument(id);
    addToast('Document Removed', undefined, 'info');
    refreshStorage();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredDocs = documents.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.fileName.toLowerCase().includes(q) ||
      (d.description && d.description.toLowerCase().includes(q)) ||
      d.folder.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white">
            Document Organiser
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Store metadata, tags, contracts, receipts, and private document archives.
          </p>
        </div>

        <Button size="sm" onClick={() => setIsModalOpen(true)} className="gap-1.5">
          <Upload size={14} />
          <span>Upload Document</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center px-3 py-2 bg-[#141414] border border-[#242424] focus-within:border-[#E50914] rounded-xl text-xs max-w-md transition-colors">
        <Search size={14} className="text-[#777777] mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Search documents by name, folder or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-0 p-0 text-white placeholder-[#777777] outline-none focus:outline-none focus:ring-0 w-full"
        />
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <Card key={doc.id} className="p-4 flex flex-col justify-between space-y-3 rounded-xl border border-[#242424] bg-[#141414]">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="p-2 bg-[#181818] border border-[#242424] rounded-lg text-[#E50914] shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="truncate">
                    <h4 className="font-bold text-sm text-white font-heading truncate">{doc.fileName}</h4>
                    <span className="text-[11px] text-[#777777]">
                      {doc.folder} • {formatFileSize(doc.fileSizeBytes)}
                    </span>
                  </div>
                </div>
              </div>

              {doc.description && (
                <p className="text-xs text-[#AAAAAA] mt-2 line-clamp-2">{doc.description}</p>
              )}

              {doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {doc.tags.map((t) => (
                    <Badge key={t} variant="muted">
                      #{t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#1C1C1C] text-xs">
              <span className="text-[10px] text-[#777777] font-mono">
                {new Date(doc.createdAt).toLocaleDateString()}
              </span>

              <div className="flex items-center gap-1">
                {doc.fileDataUrl && (
                  <a
                    href={doc.fileDataUrl}
                    download={doc.fileName}
                    className="p-1.5 text-[#777777] hover:text-white rounded-lg hover:bg-[#181818] transition-colors"
                    title="Download"
                  >
                    <Download size={14} />
                  </a>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteDoc(doc.id)}
                  className="h-7 w-7 text-[#777777] hover:text-[#E50914]"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredDocs.length === 0 && (
          <div className="col-span-full text-center py-14 bg-[#141414] border border-[#242424] rounded-xl">
            <FolderArchive size={36} className="mx-auto text-[#777777] mb-2 opacity-40" />
            <p className="text-sm font-medium text-[#AAAAAA]">No documents stored</p>
            <p className="text-xs text-[#777777] mt-1">
              Upload files or document records to keep them safe and organized.
            </p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload / Register Document"
      >
        <form onSubmit={handleSaveDoc} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[#A0A6B2] block mb-1">
              Select File
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              className="w-full text-xs text-[#A0A6B2] bg-[#101216] p-2 border border-[#2A2F38] rounded file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#EF4444] file:text-white cursor-pointer"
            />
          </div>

          <Input
            label="File Display Name *"
            placeholder="e.g. Apartment_Lease_Agreement_2026.pdf"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            required
          />

          <Select
            label="Folder"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            options={[
              { value: 'Personal', label: 'Personal' },
              { value: 'Legal & Tax', label: 'Legal & Tax' },
              { value: 'Health & Medical', label: 'Health & Medical' },
              { value: 'Career & Work', label: 'Career & Work' },
              { value: 'Receipts', label: 'Receipts' },
            ]}
          />

          <Textarea
            label="Description / Summary"
            placeholder="Key clauses, renewal date, or policy number..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />

          <Input
            label="Tags (comma separated)"
            placeholder="lease, property, 2026"
            value={tagsStr}
            onChange={(e) => setTagsStr(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-[#2A2F38]">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Document</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
