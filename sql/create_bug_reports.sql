-- Create bug_reports table to store user-submitted bug reports

CREATE TABLE IF NOT EXISTS bug_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User info (optional - can be submitted by logged in or anonymous users)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,

  -- Bug details
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('gameplay', 'ui', 'performance', 'account', 'payment', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  steps_to_reproduce TEXT NOT NULL,
  expected_behavior TEXT NOT NULL,
  actual_behavior TEXT NOT NULL,

  -- Technical details
  browser TEXT,
  device TEXT,
  user_agent TEXT,
  screen_resolution TEXT,

  -- Status tracking
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'in_progress', 'resolved', 'closed', 'duplicate', 'wont_fix')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Admin notes
  admin_notes TEXT,
  assigned_to TEXT,
  resolved_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id ON bug_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_severity ON bug_reports(severity);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at DESC);

-- Enable RLS
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can submit bug reports (even anonymous)
CREATE POLICY "Anyone can submit bug reports"
  ON bug_reports
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view their own bug reports
CREATE POLICY "Users can view their own bug reports"
  ON bug_reports
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_email = auth.jwt()->>'email'
  );

-- Policy: Admins can view all bug reports
-- Note: You'll need to create an admins table or role system
-- For now, we'll create a simple function to check admin status
CREATE POLICY "Admins can view all bug reports"
  ON bug_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE id = auth.uid()
      AND (email LIKE '%@yourdomain.com' OR is_admin = true)
    )
  );

-- Policy: Admins can update bug reports
CREATE POLICY "Admins can update bug reports"
  ON bug_reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE id = auth.uid()
      AND (email LIKE '%@yourdomain.com' OR is_admin = true)
    )
  );

-- Add is_admin column to players table if it doesn't exist
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bug_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_bug_reports_timestamp ON bug_reports;
CREATE TRIGGER update_bug_reports_timestamp
  BEFORE UPDATE ON bug_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_bug_reports_updated_at();

-- Create a view for admin dashboard
CREATE OR REPLACE VIEW bug_reports_summary AS
SELECT
  status,
  severity,
  COUNT(*) as count,
  MAX(created_at) as last_reported
FROM bug_reports
GROUP BY status, severity
ORDER BY
  CASE severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  CASE status
    WHEN 'new' THEN 1
    WHEN 'investigating' THEN 2
    WHEN 'in_progress' THEN 3
    WHEN 'resolved' THEN 4
    WHEN 'closed' THEN 5
  END;

COMMENT ON TABLE bug_reports IS 'User-submitted bug reports and issue tracking';
