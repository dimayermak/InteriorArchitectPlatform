-- Add missing score column to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;

-- Add index for potential sorting/filtering by score
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(score);
