-- Create enterprise_users table for tracking enterprise subscriptions
CREATE TABLE IF NOT EXISTS public.enterprise_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('executive', 'staff')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  stripe_subscription_id TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create enterprise_invitations table for pending invites
CREATE TABLE IF NOT EXISTS public.enterprise_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('executive', 'staff')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enterprise_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_invitations ENABLE ROW LEVEL SECURITY;

-- Policies for enterprise_users - only admins can manage
CREATE POLICY "Admins can view all enterprise users"
  ON public.enterprise_users
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert enterprise users"
  ON public.enterprise_users
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update enterprise users"
  ON public.enterprise_users
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete enterprise users"
  ON public.enterprise_users
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own enterprise status
CREATE POLICY "Users can view own enterprise status"
  ON public.enterprise_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for enterprise_invitations - only admins can manage
CREATE POLICY "Admins can view all invitations"
  ON public.enterprise_invitations
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert invitations"
  ON public.enterprise_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update invitations"
  ON public.enterprise_invitations
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete invitations"
  ON public.enterprise_invitations
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger
CREATE TRIGGER update_enterprise_users_updated_at
  BEFORE UPDATE ON public.enterprise_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_enterprise_users_user_id ON public.enterprise_users(user_id);
CREATE INDEX idx_enterprise_users_tier ON public.enterprise_users(tier);
CREATE INDEX idx_enterprise_invitations_email ON public.enterprise_invitations(email);
CREATE INDEX idx_enterprise_invitations_status ON public.enterprise_invitations(status);