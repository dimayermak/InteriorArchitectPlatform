'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Upload, FileText, ImageIcon, Trash2, Download,
    Loader2, FolderOpen, Pencil, Check, X, ZoomIn,
    FileSpreadsheet, FileArchive, File,
} from 'lucide-react';
import {
    getProjectFiles,
    uploadProjectFile,
    deleteProjectFile,
    getSignedUrl,
    renameProjectFile,
    type ProjectFile,
} from '@/lib/api/file-upload';

interface ProjectFilesProps {
    projectId: string;
    organizationId: string;
    userId: string;
}

function formatBytes(bytes: number | null): string {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Document icon config ──────────────────────────────────────────────────────
interface DocConfig { icon: React.ReactNode; label: string; bg: string; border: string; text: string }

function getDocConfig(mimeType: string | null): DocConfig {
    if (!mimeType) return { icon: <File className="w-8 h-8" />, label: 'FILE', bg: 'bg-neutral-100 dark:bg-neutral-800', border: 'border-neutral-200 dark:border-neutral-700', text: 'text-neutral-500' };
    if (mimeType === 'application/pdf') return { icon: <FileText className="w-8 h-8" />, label: 'PDF', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800', text: 'text-red-600' };
    if (mimeType.includes('word') || mimeType.includes('document')) return { icon: <FileText className="w-8 h-8" />, label: 'WORD', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-600' };
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return { icon: <FileSpreadsheet className="w-8 h-8" />, label: 'EXCEL', bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800', text: 'text-green-600' };
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed')) return { icon: <FileArchive className="w-8 h-8" />, label: 'ZIP', bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-600' };
    if (mimeType.startsWith('text/')) return { icon: <FileText className="w-8 h-8" />, label: 'TXT', bg: 'bg-neutral-100 dark:bg-neutral-800', border: 'border-neutral-200', text: 'text-neutral-500' };
    return { icon: <File className="w-8 h-8" />, label: 'FILE', bg: 'bg-neutral-100 dark:bg-neutral-800', border: 'border-neutral-200', text: 'text-neutral-500' };
}

const ACCEPT = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'application/zip',
].join(',');

export function ProjectFiles({ projectId, organizationId, userId }: ProjectFilesProps) {
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState('');
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const load = useCallback(async () => {
        try {
            const data = await getProjectFiles(projectId);
            // Fetch all signed URLs in parallel
            const urlEntries = await Promise.all(
                data.map(async (f) => {
                    try {
                        const url = await getSignedUrl(f.file_path);
                        return [f.id, url] as [string, string];
                    } catch {
                        return [f.id, f.file_url] as [string, string];
                    }
                })
            );
            setFiles(data);
            setSignedUrls(Object.fromEntries(urlEntries));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => { load(); }, [load]);

    async function handleFiles(fileList: FileList | null) {
        if (!fileList || fileList.length === 0) return;
        setError('');
        const toUpload = Array.from(fileList);

        for (const file of toUpload) {
            if (file.size > 50 * 1024 * 1024) {
                setError(`הקובץ "${file.name}" גדול מ-50MB`);
                continue;
            }
            setUploading(true);
            setUploadProgress(`מעלה "${file.name}"...`);
            try {
                const uploaded = await uploadProjectFile(file, projectId, organizationId, userId);
                // Get signed URL immediately so thumbnail renders right away
                let freshUrl = uploaded.file_url;
                try { freshUrl = await getSignedUrl(uploaded.file_path); } catch { /* fallback to file_url */ }

                // Batch both updates together
                setFiles(prev => [uploaded, ...prev]);
                setSignedUrls(prev => ({ ...prev, [uploaded.id]: freshUrl }));
            } catch (e) {
                setError(e instanceof Error ? e.message : 'שגיאה בהעלאה');
            }
        }
        setUploading(false);
        setUploadProgress('');

        // CRITICAL: reset input value so the same file can be selected again
        if (inputRef.current) inputRef.current.value = '';
    }

    function openFilePicker() {
        // Reset value first so onChange always fires, even for the same file
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.click();
        }
    }

    async function handleDownload(file: ProjectFile) {
        try {
            const url = signedUrls[file.id] || await getSignedUrl(file.file_path);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            a.target = '_blank';
            a.click();
        } catch (e) { console.error(e); }
    }

    async function handleDelete(file: ProjectFile) {
        if (!confirm(`למחוק את "${file.name}"?`)) return;
        try {
            await deleteProjectFile(file);
            setFiles(prev => prev.filter(f => f.id !== file.id));
            setSignedUrls(prev => { const n = { ...prev }; delete n[file.id]; return n; });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'שגיאה במחיקה');
        }
    }

    function startRename(file: ProjectFile) {
        setEditingId(file.id);
        setEditingName(file.name);
    }

    async function confirmRename(fileId: string) {
        const trimmed = editingName.trim();
        if (!trimmed) { setEditingId(null); return; }
        try {
            await renameProjectFile(fileId, trimmed);
            setFiles(prev => prev.map(f => f.id === fileId ? { ...f, name: trimmed } : f));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'שגיאה בשינוי שם');
        }
        setEditingId(null);
    }

    if (loading) return (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin ml-2" />
            <span>טוען קבצים...</span>
        </div>
    );

    const images = files.filter(f => f.mime_type?.startsWith('image/'));
    const docs = files.filter(f => !f.mime_type?.startsWith('image/'));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">קבצי פרויקט</h2>
                    <p className="text-sm text-muted-foreground">העלה מסמכים, תמונות וקבצים לפרויקט</p>
                </div>
                <button
                    onClick={openFilePicker}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                    <Upload className="w-4 h-4" />
                    העלה קובץ
                </button>
            </div>

            {/* Hidden input — onChange fires on every selection */}
            <input
                ref={inputRef}
                type="file"
                multiple
                accept={ACCEPT}
                className="hidden"
                onChange={e => handleFiles(e.target.files)}
            />

            {/* Drag-and-drop zone */}
            <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                onClick={openFilePicker}
                className={[
                    'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all select-none',
                    dragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50 hover:bg-muted/30',
                ].join(' ')}
            >
                {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">{uploadProgress}</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 pointer-events-none">
                        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                            <Upload className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-medium">גרור קבצים לכאן</p>
                            <p className="text-sm text-muted-foreground mt-0.5">או לחץ לבחירת קבצים · מקסימום 50MB</p>
                        </div>
                        <p className="text-xs text-muted-foreground/60">PDF, תמונות, Word, Excel, ZIP</p>
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError('')}>✕</button>
                </div>
            )}

            {files.length === 0 && !uploading && (
                <div className="text-center py-8 text-muted-foreground">
                    <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">אין קבצים עדיין</p>
                </div>
            )}

            {/* ── Images grid ── */}
            {images.length > 0 && (
                <section>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> תמונות ({images.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {images.map(file => {
                            const url = signedUrls[file.id];
                            return (
                                <div key={file.id} className="group relative rounded-xl overflow-hidden border border-border bg-muted aspect-square">
                                    {url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={url} alt={file.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                                        </div>
                                    )}

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100">
                                        {/* Top actions */}
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => startRename(file)} className="w-7 h-7 rounded-md bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors" title="שנה שם">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDownload(file)} className="w-7 h-7 rounded-md bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors" title="הורד">
                                                <Download className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDelete(file)} className="w-7 h-7 rounded-md bg-red-500/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors" title="מחק">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        {/* Zoom button */}
                                        {url && (
                                            <button
                                                onClick={() => setLightboxUrl(url)}
                                                className="absolute inset-0 flex items-center justify-center"
                                            >
                                                <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                                    <ZoomIn className="w-5 h-5 text-white" />
                                                </span>
                                            </button>
                                        )}
                                        {/* Filename */}
                                        <div className="text-xs text-white/90 truncate font-medium">{file.name}</div>
                                    </div>

                                    {/* Rename overlay */}
                                    {editingId === file.id && (
                                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 p-3" onClick={e => e.stopPropagation()}>
                                            <input
                                                autoFocus
                                                value={editingName}
                                                onChange={e => setEditingName(e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter') confirmRename(file.id); if (e.key === 'Escape') setEditingId(null); }}
                                                className="w-full text-sm px-2 py-1 rounded border border-white/30 bg-white/10 text-white text-center outline-none"
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => confirmRename(file.id)} className="px-2 py-1 rounded bg-green-500 text-white text-xs"><Check className="w-3 h-3" /></button>
                                                <button onClick={() => setEditingId(null)} className="px-2 py-1 rounded bg-white/20 text-white text-xs"><X className="w-3 h-3" /></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ── Documents list ── */}
            {docs.length > 0 && (
                <section>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> מסמכים ({docs.length})
                    </h3>
                    <div className="space-y-2">
                        {docs.map(file => {
                            const cfg = getDocConfig(file.mime_type);
                            return (
                                <div
                                    key={file.id}
                                    className="flex items-center gap-4 p-3 rounded-xl border border-border hover:bg-muted/30 group transition-colors"
                                >
                                    {/* Document icon card */}
                                    <div className={`w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.border}`}>
                                        <span className={cfg.text}>{cfg.icon}</span>
                                        <span className={`text-[9px] font-bold tracking-wider mt-0.5 ${cfg.text}`}>{cfg.label}</span>
                                    </div>

                                    {/* Name + meta */}
                                    <div className="flex-1 min-w-0">
                                        {editingId === file.id ? (
                                            <div className="flex items-center gap-1">
                                                <input
                                                    autoFocus
                                                    value={editingName}
                                                    onChange={e => setEditingName(e.target.value)}
                                                    onKeyDown={e => { if (e.key === 'Enter') confirmRename(file.id); if (e.key === 'Escape') setEditingId(null); }}
                                                    className="flex-1 text-sm px-2 py-0.5 rounded border border-primary outline-none bg-background"
                                                />
                                                <button onClick={() => confirmRename(file.id)} className="text-green-600 p-1"><Check className="w-4 h-4" /></button>
                                                <button onClick={() => setEditingId(null)} className="text-muted-foreground p-1"><X className="w-4 h-4" /></button>
                                            </div>
                                        ) : (
                                            <p className="font-medium text-sm truncate">{file.name}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {formatBytes(file.file_size)}
                                            {file.created_at && <> · {new Date(file.created_at).toLocaleDateString('he-IL')}</>}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                        <button onClick={() => startRename(file)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="שנה שם">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDownload(file)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="הורד">
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(file)} className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors" title="מחק">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Lightbox */}
            {lightboxUrl && (
                <div
                    className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
                    onClick={() => setLightboxUrl(null)}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={lightboxUrl}
                        alt="תצוגה מוגדלת"
                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setLightboxUrl(null)}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
