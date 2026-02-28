import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Mail, Check, Loader2, ExternalLink } from 'lucide-react';

const PRESETS: Record<string, { host: string; port: number; tls: boolean }> = {
  gmail: { host: 'smtp.gmail.com', port: 587, tls: true },
  outlook: { host: 'smtp-mail.outlook.com', port: 587, tls: true },
  custom: { host: '', port: 587, tls: true },
};

export function EmailSettingsCard() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [preset, setPreset] = useState<string>('custom');
  const [form, setForm] = useState({
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    from_name: '',
    from_email: '',
    use_tls: true,
  });
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_email_settings' as any)
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) {
          setForm({
            smtp_host: data.smtp_host || '',
            smtp_port: data.smtp_port || 587,
            smtp_username: data.smtp_username || '',
            smtp_password: data.smtp_password || '',
            from_name: data.from_name || '',
            from_email: data.from_email || '',
            use_tls: data.use_tls ?? true,
          });
          setConfigured(true);
          // detect preset
          if (data.smtp_host === 'smtp.gmail.com') setPreset('gmail');
          else if (data.smtp_host === 'smtp-mail.outlook.com') setPreset('outlook');
          else setPreset('custom');
        }
      });
  }, [user]);

  const applyPreset = (key: string) => {
    setPreset(key);
    const p = PRESETS[key];
    setForm(f => ({ ...f, smtp_host: p.host, smtp_port: p.port, use_tls: p.tls }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const payload = { user_id: user.id, ...form, updated_at: new Date().toISOString() };
    const { error } = await supabase
      .from('user_email_settings' as any)
      .upsert(payload as any, { onConflict: 'user_id' });
    setSaving(false);
    if (error) {
      toast.error('Failed to save email settings');
    } else {
      toast.success('Email settings saved');
      setConfigured(true);
    }
  };

  const handleTest = async () => {
    if (!user) return;
    setTesting(true);
    // Save first, then send test
    await handleSave();
    const { data, error } = await supabase.functions.invoke('send-outbound-email', {
      body: {
        to: form.from_email || form.smtp_username,
        subject: 'SellSig - Test Email',
        body: 'This is a test email from SellSig. Your SMTP settings are working correctly!',
      },
    });
    setTesting(false);
    if (error || data?.error) {
      toast.error(data?.error || 'Test email failed');
    } else {
      toast.success('Test email sent! Check your inbox.');
    }
  };

  return (
    <div className="card-gradient rounded-xl border border-border/50 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Outbound Email</h2>
        </div>
        {configured && (
          <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
            <Check className="h-3 w-3" /> Configured
          </span>
        )}
      </div>

      {/* Presets */}
      <div className="flex gap-2">
        {(['gmail', 'outlook', 'custom'] as const).map(key => (
          <Button
            key={key}
            size="sm"
            variant={preset === key ? 'default' : 'outline'}
            onClick={() => applyPreset(key)}
            className="capitalize"
          >
            {key}
          </Button>
        ))}
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">SMTP Host</Label>
          <Input
            value={form.smtp_host}
            onChange={e => setForm(f => ({ ...f, smtp_host: e.target.value }))}
            placeholder="smtp.gmail.com"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Port</Label>
          <Input
            type="number"
            value={form.smtp_port}
            onChange={e => setForm(f => ({ ...f, smtp_port: parseInt(e.target.value) || 587 }))}
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Username / Email</Label>
          <Input
            value={form.smtp_username}
            onChange={e => setForm(f => ({ ...f, smtp_username: e.target.value }))}
            placeholder="you@gmail.com"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1">
            App Password
            {preset === 'gmail' && (
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-0.5"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </Label>
          <Input
            type="password"
            value={form.smtp_password}
            onChange={e => setForm(f => ({ ...f, smtp_password: e.target.value }))}
            placeholder="••••••••"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">From Name</Label>
          <Input
            value={form.from_name}
            onChange={e => setForm(f => ({ ...f, from_name: e.target.value }))}
            placeholder="Your Name"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">From Email</Label>
          <Input
            value={form.from_email}
            onChange={e => setForm(f => ({ ...f, from_email: e.target.value }))}
            placeholder="you@gmail.com"
            className="h-9 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            checked={form.use_tls}
            onCheckedChange={checked => setForm(f => ({ ...f, use_tls: checked }))}
          />
          <Label className="text-xs">Use TLS</Label>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button size="sm" variant="outline" onClick={handleTest} disabled={testing || !form.smtp_host}>
          {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
          Test Connection
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving || !form.smtp_host}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
