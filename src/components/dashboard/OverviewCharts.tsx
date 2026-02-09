'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';

interface OverviewChartsProps {
    projectStats: { name: string; value: number; color: string }[];
    clientGrowth: { date: string; count: number }[];
    revenueStats: { name: string; income: number; expenses: number }[];
}

export function OverviewCharts({ projectStats, clientGrowth, revenueStats }: OverviewChartsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Project Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-center">פילוח פרויקטים</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={projectStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {projectStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                        {projectStats.map((stat, index) => (
                            <div key={index} className="flex items-center gap-1.5 text-xs">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stat.color }} />
                                <span className="text-muted-foreground">{stat.name}</span>
                                <span className="font-medium text-foreground">({stat.value})</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Revenue */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-center">הכנסות והוצאות</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                />
                                <Bar dataKey="income" name="הכנסות" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expenses" name="הוצאות" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Client Growth */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-center">גידול לקוחות</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={clientGrowth}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12} />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} allowDecimals={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" name="לקוחות חדשים" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
