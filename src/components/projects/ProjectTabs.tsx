'use client';

import { Project, ProjectPhase, Task } from '@/types/database';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { ProjectOverview } from './ProjectOverview';
import { ProjectPlan } from './ProjectPlan';
import { ProjectSuppliers } from './ProjectSuppliers';
import { ProjectOrders } from './ProjectOrders';
import { ProjectSupervision } from './ProjectSupervision';
import { ProjectFinance } from './ProjectFinance';
import { ProjectGallery } from './ProjectGallery';
import { ProjectClientReport } from './ProjectClientReport';

interface ProjectTabsProps {
    project: Project & { client: { name: string } | null };
    stats: any;
    tasks: Task[];
    statusLabels: Record<string, { label: string; color: string }>;
}

export function ProjectTabs({ project, stats, tasks, statusLabels }: ProjectTabsProps) {
    return (
        <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-7 lg:w-auto h-auto py-1">
                <TabsTrigger value="overview">מבט על</TabsTrigger>
                <TabsTrigger value="plan">תוכנית עבודה</TabsTrigger>
                <TabsTrigger value="suppliers">ספקים</TabsTrigger>
                <TabsTrigger value="orders">הזמנות רכש</TabsTrigger>
                <TabsTrigger value="supervision">פיקוח</TabsTrigger>
                <TabsTrigger value="finance">פיננסי</TabsTrigger>
                <TabsTrigger value="gallery">גלריה וקבצים</TabsTrigger>
                <TabsTrigger value="client-report">דוח לקוח</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
                <ProjectOverview project={project} stats={stats} statusLabels={statusLabels} tasks={tasks} />
            </TabsContent>

            <TabsContent value="plan">
                <ProjectPlan projectId={project.id} initialTasks={tasks} />
            </TabsContent>

            <TabsContent value="suppliers">
                <ProjectSuppliers projectId={project.id} />
            </TabsContent>

            <TabsContent value="orders">
                <ProjectOrders projectId={project.id} />
            </TabsContent>

            <TabsContent value="supervision">
                <ProjectSupervision projectId={project.id} />
            </TabsContent>

            <TabsContent value="finance">
                <ProjectFinance projectId={project.id} budget={project.budget || 0} />
            </TabsContent>

            <TabsContent value="gallery">
                <ProjectGallery projectId={project.id} />
            </TabsContent>

            <TabsContent value="client-report">
                <ProjectClientReport projectId={project.id} />
            </TabsContent>
        </Tabs>
    );
}
