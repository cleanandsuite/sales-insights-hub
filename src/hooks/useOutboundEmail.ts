import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useOutboundEmail() {
  const { user } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from('user_email_settings' as any)
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setIsConfigured(!!data);
        setLoading(false);
      });
  }, [user]);

  const sendEmail = async (
    to: string,
    subject: string,
    body: string,
    relatedType?: string,
    relatedId?: string
  ) => {
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-outbound-email', {
        body: { to, subject, body, relatedType, relatedId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success('Email sent successfully');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to send email');
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return { sendEmail, isSending, isConfigured, loading };
}
