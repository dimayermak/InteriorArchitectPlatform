'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Upload, Image as ImageIcon, FileText, Download, Trash2, ExternalLink, Grid } from 'lucide-react';

interface ProjectGalleryProps {
    projectId: string;
}

// Dummy data for now - will be replaced by Supabase Storage later
const INITIAL_IMAGES = [
    { id: '1', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80', title: 'הדמיה - סלון', type: 'render', date: '2024-02-10' },
    { id: '2', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', title: 'הדמיה - מטבח', type: 'render', date: '2024-02-10' },
    { id: '3', url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80', title: 'מצב קיים - כניסה', type: 'photo', date: '2024-01-15' },
];

const INITIAL_FILES = [
    { id: '1', name: 'תוכנית חשמל - v2.pdf', type: 'pdf', size: '2.4 MB', date: '2024-02-08' },
    { id: '2', name: 'כתב כמויות ריצוף.xslx', type: 'excel', size: '156 KB', date: '2024-02-05' },
    { id: '3', name: 'הסכם עבודה חתום.pdf', type: 'pdf', size: '1.2 MB', date: '2024-01-20' },
];

export function ProjectGallery({ projectId }: ProjectGalleryProps) {
    const [images, setImages] = useState(INITIAL_IMAGES);
    const [files, setFiles] = useState(INITIAL_FILES);
    const [activeTab, setActiveTab] = useState<'images' | 'files'>('images');
    const [localImages, setLocalImages] = useState(images);
    const [localFiles, setLocalFiles] = useState(files);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Mock upload
        if (activeTab === 'images') {
            const newImage = {
                id: Math.random().toString(),
                url: URL.createObjectURL(file), // Using local URL for preview
                title: file.name, // Using file name as title for now
                type: file.type.startsWith('image/') ? 'photo' : 'render', // Basic type detection
                date: new Date().toISOString().split('T')[0] // Current date
            };
            setLocalImages([newImage, ...localImages]);
        } else {
            const newFile = {
                id: Math.random().toString(),
                name: file.name,
                type: file.name.split('.').pop() || 'file',
                size: `${(file.size / 1024 / 1024).toFixed(2)} MB`, // Convert bytes to MB
                date: new Date().toISOString().split('T')[0]
            };
            setLocalFiles([newFile, ...localFiles]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    {['images', 'files'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === tab
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab === 'images' && 'תמונות'}
                            {tab === 'files' && 'קבצים'}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <label>
                        <input type="file" className="hidden" onChange={handleFileUpload} accept={activeTab === 'images' ? "image/*" : "*"} />
                        <Button variant="outline" className="gap-2 h-9 cursor-pointer">
                            <Upload className="w-4 h-4" />
                            <span>העלאה</span>
                        </Button>
                    </label>
                    <Button variant="ghost" size="icon">
                        <Grid className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Images Grid */}
            {activeTab === 'images' && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Upload Placeholder */}
                    <label className="cursor-pointer">
                        <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                        <div className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-colors aspect-video h-full">
                            <ImageIcon className="w-8 h-8 mb-2" />
                            <span className="text-sm font-medium">הוסף תמונה</span>
                        </div>
                    </label>
                    {localImages.map((image) => (
                        <div key={image.id} className="group relative aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all">
                            <img src={image.url} alt={image.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90 hover:bg-white text-gray-900">
                                    <ExternalLink className="w-4 h-4" />
                                </Button>
                                <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-6">
                                <h3 className="text-white text-sm font-medium truncate">{image.title}</h3>
                                <p className="text-white/80 text-xs">{image.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Files List */}
            {activeTab === 'files' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            קבצים ומסמכים
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {files.map((file) => (
                                <div key={file.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${file.type === 'pdf' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                            }`}>
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{file.name}</h4>
                                            <p className="text-xs text-muted-foreground">{file.date} • {file.size}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
