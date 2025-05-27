-- Add analysis_results column to uploads table
ALTER TABLE uploads
ADD COLUMN IF NOT EXISTS analysis_results JSONB;

-- Add comment to explain the column
COMMENT ON COLUMN uploads.analysis_results IS 'Stores the spending analysis results from Gemini, including locations, transactions, and summary data';

-- Create index for faster querying of analysis results
CREATE INDEX IF NOT EXISTS idx_uploads_analysis_results ON uploads USING gin (analysis_results);

-- Update RLS policies to allow access to analysis_results
ALTER POLICY "Users can view their own uploads" ON uploads
USING (auth.uid() = user_id);

-- Ensure the column is nullable since analysis might fail
ALTER TABLE uploads
ALTER COLUMN analysis_results DROP NOT NULL; 