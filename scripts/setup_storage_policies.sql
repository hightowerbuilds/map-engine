-- Enable RLS (Row Level Security) on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to upload files to their own folder
CREATE POLICY "Users can upload files to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'bank-statements' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create a policy that allows users to view their own files
CREATE POLICY "Users can view their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'bank-statements' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create a policy that allows users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'bank-statements' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create a policy that allows users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'bank-statements' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create the bank-statements bucket if it doesn't exist
-- Note: This needs to be run by a superuser or the owner of the storage schema
INSERT INTO storage.buckets (id, name, public, owner)
VALUES ('bank-statements', 'bank-statements', false, auth.uid())
ON CONFLICT (id) DO NOTHING;

-- Note: The storage policies should be created through the Supabase Dashboard:
-- 1. Go to Storage > Policies
-- 2. Select the 'bank-statements' bucket
-- 3. Add the following policies manually:

-- Policy 1: "Users can upload files to their own folder"
-- Operation: INSERT
-- Policy definition:
-- (bucket_id = 'bank-statements' AND (storage.foldername(name))[1] = auth.uid()::text)

-- Policy 2: "Users can view their own files"
-- Operation: SELECT
-- Policy definition:
-- (bucket_id = 'bank-statements' AND (storage.foldername(name))[1] = auth.uid()::text)

-- Policy 3: "Users can update their own files"
-- Operation: UPDATE
-- Policy definition:
-- (bucket_id = 'bank-statements' AND (storage.foldername(name))[1] = auth.uid()::text)

-- Policy 4: "Users can delete their own files"
-- Operation: DELETE
-- Policy definition:
-- (bucket_id = 'bank-statements' AND (storage.foldername(name))[1] = auth.uid()::text) 