-- Remove analysis_results column from uploads table
ALTER TABLE uploads
DROP COLUMN IF EXISTS analysis_results;

-- Drop the index for analysis results
DROP INDEX IF EXISTS idx_uploads_analysis_results;

-- Update RLS policies to allow access to analysis_results
ALTER POLICY "Users can view their own uploads" ON uploads
USING (auth.uid() = user_id);

-- Ensure the column is nullable since analysis might fail
ALTER TABLE uploads
ALTER COLUMN analysis_results DROP NOT NULL; 