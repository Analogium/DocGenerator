/*
  # Add credit system for pay-as-you-go users

  1. New Columns
    - Add `credits` column to `profiles` table
  
  2. New Tables
    - Create `credit_transactions` table to track credit purchases and usage
  
  3. Security
    - Enable RLS on `credit_transactions` table
    - Add policies for authenticated users to view their own transactions
*/

-- Add credits column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage')),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for credit_transactions
CREATE POLICY "Users can view their own credit transactions"
  ON credit_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own credit transactions"
  ON credit_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);