'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { StatusCell, StatusType } from './StatusCell';

// Mock Data Structure
interface Item {
    id: string;
    name: string;
    person: string;
    status: StatusType;
    priority: StatusType;
    date: string;
}

interface Group {
    id: string;
    title: string;
    color: string;
    items: Item[];
}

const initialData: Group[] = [
    {
        id: 'g-1',
        title: 'פרויקטים פעילים',
        color: 'border-blue-500', // Right border color in RTL
        items: [
            { id: '1', name: 'וילה רוטשילד - סקיצה רעיונית', person: 'https://i.pravatar.cc/150?u=1', status: 'working', priority: 'stuck', date: '24 אוק' },
            { id: '2', name: 'פנטהאוז ת"א - היתרים', person: 'https://i.pravatar.cc/150?u=2', status: 'stuck', priority: 'purple', date: '01 נוב' },
            { id: '3', name: 'משרדי הייטק - ריהוט', person: 'https://i.pravatar.cc/150?u=3', status: 'done', priority: 'blue', date: '15 אוק' },
        ]
    },
    {
        id: 'g-2',
        title: 'משימות שוטפות',
        color: 'border-purple-500',
        items: [
            { id: '4', name: 'עדכון תיק עבודות באתר', person: 'https://i.pravatar.cc/150?u=4', status: 'empty', priority: 'empty', date: '01 דצמ' },
        ]
    }
];

export function BoardView() {
    const [groups, setGroups] = useState(initialData);

    const handleStatusChange = (groupId: string, itemId: string, field: 'status' | 'priority', newStatus: StatusType) => {
        setGroups(prev => prev.map(group => {
            if (group.id !== groupId) return group;
            return {
                ...group,
                items: group.items.map(item => {
                    if (item.id !== itemId) return item;
                    return { ...item, [field]: newStatus };
                })
            };
        }));
    };

    return (
        <div className="w-full h-full flex flex-col p-8 font-sans" dir="rtl">
            {/* Board Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 text-primary-900">הפרויקטים שלי</h1>
                <p className="text-muted-foreground text-lg">ניהול כל משימות העיצוב והתכנון במקום אחד.</p>
            </div>

            {/* Groups */}
            <div className="space-y-12">
                {groups.map(group => (
                    <div key={group.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Group Header */}
                        <div className="flex items-center gap-2 mb-4 group/header">
                            <div className="p-1 rounded hover:bg-muted cursor-pointer transition-colors">
                                <svg className="w-4 h-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </div>
                            <h2 className={`text-xl font-bold ${group.color.replace('border-', 'text-')}`}>{group.title}</h2>
                            <span className="text-sm text-muted-foreground mr-2 px-2 py-0.5 rounded-full border border-border">{group.items.length} משימות</span>
                        </div>

                        {/* Table Container */}
                        <div className="border border-border rounded-lg overflow-hidden shadow-sm bg-white">
                            {/* Table Header */}
                            <div className="grid grid-cols-[40px_1fr_100px_140px_140px_120px] divide-x divide-x-reverse divide-border bg-slate-50/50 border-b border-border">
                                <div className="p-2 flex items-center justify-center"><div className={`w-1.5 h-full rounded-full ${group.color.replace('border-', 'bg-')}`}></div></div> {/* Color Lip */}
                                <div className="px-4 py-2 text-xs font-bold text-muted-foreground flex items-center">שם המשימה</div>
                                <div className="px-4 py-2 text-xs font-bold text-muted-foreground flex items-center justify-center">אחראי</div>
                                <div className="px-4 py-2 text-xs font-bold text-muted-foreground flex items-center justify-center">סטטוס</div>
                                <div className="px-4 py-2 text-xs font-bold text-muted-foreground flex items-center justify-center">עדיפות</div>
                                <div className="px-4 py-2 text-xs font-bold text-muted-foreground flex items-center justify-center">תאריך יעד</div>
                            </div>

                            {/* Table Body */}
                            <div className="divide-y divide-border">
                                {group.items.map(item => (
                                    <div key={item.id} className="grid grid-cols-[40px_1fr_100px_140px_140px_120px] divide-x divide-x-reverse divide-border group/row hover:bg-slate-50 transition-colors">
                                        {/* Selection / Lip */}
                                        <div className="relative flex items-center justify-center group/select">
                                            <div className={`absolute inset-y-0 right-0 w-1.5 ${group.color.replace('border-', 'bg-')} opacity-40 group-hover/row:opacity-100 transition-opacity`}></div>
                                            <input type="checkbox" className="opacity-0 group-hover/row:opacity-100 cursor-pointer w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                        </div>

                                        {/* Name */}
                                        <div className="px-4 py-2 flex items-center h-10 border-r-0">
                                            <span className="font-medium text-sm text-foreground truncate pl-2">{item.name}</span>
                                            <button className="mr-auto opacity-0 group-hover/row:opacity-100 text-xs text-primary font-medium hover:underline bg-primary/5 px-2 py-0.5 rounded">פתח</button>
                                        </div>

                                        {/* Person */}
                                        <div className="p-1 flex items-center justify-center h-10">
                                            <div className="w-7 h-7 rounded-full overflow-hidden border border-white shadow-sm cursor-pointer hover:scale-110 transition-transform">
                                                <img src={item.person} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="h-10 p-1">
                                            <StatusCell
                                                status={item.status}
                                                onChange={(s) => handleStatusChange(group.id, item.id, 'status', s)}
                                            />
                                        </div>

                                        {/* Priority */}
                                        <div className="h-10 p-1">
                                            <StatusCell
                                                status={item.priority}
                                                label={item.priority === 'stuck' ? 'גבוהה' : item.priority === 'purple' ? 'בינונית' : item.priority === 'blue' ? 'נמוכה' : ''}
                                                onChange={(s) => handleStatusChange(group.id, item.id, 'priority', s)}
                                            />
                                        </div>

                                        {/* Date */}
                                        <div className="px-4 py-2 flex items-center justify-center h-10 text-sm text-muted-foreground font-medium">
                                            {item.date}
                                        </div>
                                    </div>
                                ))}

                                {/* Add Item Row */}
                                <div className="grid grid-cols-[40px_1fr] divide-x divide-x-reverse divide-border bg-white group/add">
                                    <div className={`w-1.5 ${group.color.replace('border-', 'bg-')} opacity-20`}></div>
                                    <div className="px-4 py-2 h-9 flex items-center">
                                        <input
                                            type="text"
                                            placeholder="+ הוסף משימה חדשה"
                                            className="w-full bg-transparent border-none text-sm focus:ring-0 focus:outline-none placeholder:text-muted-foreground/60"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
