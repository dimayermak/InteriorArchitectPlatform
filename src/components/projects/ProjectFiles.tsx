'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, File, FileText, ImageIcon, Trash2, Download, Loader2, FolderOpen } from 'lucide-react';
import {
    getProjectFiles,
    uploadProjectFile,
    deleteProjectFile,
    getSignedUrl,
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

function FileIcon({ mimeType }: { mimeType: string | null }) {
    if (!mimeType) return <File className="w-5 h-5 text-muted-foreground" />;
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (mimeType === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <FileText className="w-5 h-5 text-blue-600" />;
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return <FileText className="w-5 h-5 text-green-600" />;
    return <File className="w-5 h-5 text-muted-foreground" />;
}

const ACCEPT = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'application/zip',
].join(',');

export function ProjectFiles({ projectId, organizationId, userId }: ProjectFilesProps) {
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>('');
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const load = useCallback(async () => {
        try {
            const data = await getProjectFiles(projectId);
            setFiles(data);
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
                setFiles(prev => [uploaded, ...prev]);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'שגיאה בהעלאה');
            }
        }
        setUploading(false);
        setUploadProgress('');
    }

    async function handleDownload(file: ProjectFile) {
        try {
            const url = await getSignedUrl(file.file_path);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            a.target = '_blank';
            a.click();
        } catch (e) {
            console.error(e);
        }
    }

    async function handleDelete(file: ProjectFile) {
        if (!confirm(`למחוק את "${file.name}"?`)) return;
        try {
            await deleteProjectFile(file);
            setFiles(prev => prev.filter(f => f.id !== file.id));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'שגיאה במחיקה');
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin ml-2" />
                <span>טוען קבצים...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">קבצי פרויקט</h2>
                    <p className="text-sm text-muted-foreground">העלה מסמכים, תמונות וקבצים לפרויקט</p>
                </div>
                <button
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                    <Upload className="w-4 h-4" />
                    בחר קובץ
                </button>
            </div>

            {/* Hidden file input */}
            <input
                ref={inputRef}
                type="file"
                multiple
                accept={ACCEPT}
                className="hidden"
                onChange={e => handleFiles(e.target.files)}
            />

            {/* Drag & drop zone */}
            <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFiles(e.dataTransfer.files);
                }}
                onClick={() => inputRef.current?.click()}
                className={[
                    'relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all',
                    dragOver
                        ? 'border-primary bg-primary/5 scale-[1.01]'
                        : 'border-border hover:border-primary/40 hover:bg-muted/30',
                ].join(' ')}
            >
                {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">{uploadProgress}</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                            <Upload className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-medium">גרור קבצים לכאן</p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                או לחץ לבחירת קבצים · מקסימום 50MB לקובץ
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground/60">PDF, תמונות, Word, Excel, ZIP</p>
                    </div>
                )}
            </div>

            {/* Error banner */}
            {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
                    <span>❌</span>
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">✕</button>
                </div>
            )}

            {/* File list */}
            {files.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">אין קבצים עדיין</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {files.map(file => (
                        <div
                            key={file.id}
                            className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 group transition-colors"
                        >
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                <FileIcon mimeType={file.mime_type} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatBytes(file.file_size)}
                                    {file.created_at && (
                                        <> · {new Date(file.created_at).toLocaleDateString('he-IL')}</>
                                    )}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleDownload(file)}
                                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    title="הורד"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(file)}
                                    className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                                    title="מחק"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
