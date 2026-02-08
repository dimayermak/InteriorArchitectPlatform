'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';

export type StatusType = 'done' | 'working' | 'stuck' | 'empty' | 'purple' | 'blue';

interface StatusCellProps {
    status: StatusType;
    label?: string;
    onChange?: (newStatus: StatusType) => void;
    readOnly?: boolean;
}

const statusConfig = {
    done: { color: 'bg-[#00C875]', label: 'בוצע' },
    working: { color: 'bg-[#FDAB3D]', label: 'בעבודה' },
    stuck: { color: 'bg-[#E2445C]', label: 'תקוע' },
    purple: { color: 'bg-[#A25DDC]', label: 'בבדיקה' },
    blue: { color: 'bg-[#0086C0]', label: 'נשלח' },
    empty: { color: 'bg-[#C4C4C4]', label: '' },
};

export function StatusCell({ status, label, onChange, readOnly }: StatusCellProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Use provided label or default from config
    const displayLabel = label || statusConfig[status]?.label;
    const bgClass = statusConfig[status]?.color || statusConfig.empty.color;

    if (readOnly) {
        return (
            <div className={cn(
                "w-full h-full min-h-[36px] flex items-center justify-center text-white text-xs font-medium truncate px-1 transition-colors hover:opacity-90 cursor-default",
                bgClass
            )}>
                {displayLabel}
            </div>
        );
    }

    return (
        <div className="relative w-full h-full group">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full h-full min-h-[36px] flex items-center justify-center text-white text-xs font-medium truncate px-1 transition-colors hover:opacity-90 relative",
                    bgClass
                )}
            >
                {/* Fold Corner (Left Bottom for RTL) */}
                <div className="absolute left-0 bottom-0 top-0 w-6 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] rounded-r-sm transition-opacity">
                    ▼
                </div>
                {displayLabel}
            </button>

            {/* Dropdown Popover */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 flex flex-col items-center bg-white shadow-xl rounded-md border border-border p-2 min-w-[140px] animate-in fade-in zoom-in-95 duration-100">
                        {Object.entries(statusConfig).map(([key, config]) => (
                            <button
                                key={key}
                                onClick={() => {
                                    onChange?.(key as StatusType);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full h-8 flex items-center justify-center text-white text-xs font-medium mb-1 last:mb-0 rounded hover:opacity-90 transition-opacity",
                                    config.color
                                )}
                            >
                                {config.label || '\u00A0'}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
