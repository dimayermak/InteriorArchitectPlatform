import { createClient } from '@/lib/supabase/client';

export interface ProjectFile {
    id: string;
    organization_id: string;
    project_id: string | null;
    client_id: string | null;
    name: string;
    file_path: string;
    file_url: string;
    file_size: number | null;
    mime_type: string | null;
    uploaded_by: string | null;
    created_at: string;
}

export async function getProjectFiles(projectId: string): Promise<ProjectFile[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('project_files')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []) as ProjectFile[];
}

export async function uploadProjectFile(
    file: File,
    projectId: string,
    organizationId: string,
    userId: string
): Promise<ProjectFile> {
    const supabase = createClient();

    // Unique path: org/project/timestamp-filename
    const ext = file.name.split('.').pop();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${organizationId}/${projectId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(path, file, { upsert: false, contentType: file.type });

    if (uploadError) throw new Error(uploadError.message);

    // Get signed URL (48 hours)
    const { data: urlData } = await supabase.storage
        .from('project-files')
        .createSignedUrl(path, 60 * 60 * 48); // 48 hours

    const fileUrl = urlData?.signedUrl || '';

    const { data, error } = await supabase
        .from('project_files')
        .insert({
            organization_id: organizationId,
            project_id: projectId,
            name: file.name,
            file_path: path,
            file_url: fileUrl,
            file_size: file.size,
            mime_type: file.type || null,
            uploaded_by: userId,
        })
        .select()
        .single();

    if (error) {
        // Try to clean up storage
        await supabase.storage.from('project-files').remove([path]);
        throw new Error(error.message);
    }

    return data as ProjectFile;
}

export async function getSignedUrl(filePath: string): Promise<string> {
    const supabase = createClient();
    const { data, error } = await supabase.storage
        .from('project-files')
        .createSignedUrl(filePath, 60 * 60); // 1 hour
    if (error) throw new Error(error.message);
    return data.signedUrl;
}

export async function deleteProjectFile(file: ProjectFile): Promise<void> {
    const supabase = createClient();
    // Remove from storage
    await supabase.storage.from('project-files').remove([file.file_path]);
    // Remove DB record
    const { error } = await supabase.from('project_files').delete().eq('id', file.id);
    if (error) throw new Error(error.message);
}
