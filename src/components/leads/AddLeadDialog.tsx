import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { z } from 'zod';

const leadSchema = z.object({
  contact_name: z.string().min(1, 'Name is required').max(100),
  company: z.string().min(1, 'Company is required').max(100),
  title: z.string().max(100).optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional(),
  primary_pain_point: z.string().max(500).optional(),
  secondary_issues: z.array(z.string()).optional(),
  budget_info: z.string().max(200).optional(),
  timeline: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

const SECONDARY_ISSUES = [
  { value: 'efficiency', label: 'Efficiency' },
  { value: 'cost', label: 'Cost' },
  { value: 'growth', label: 'Growth' },
  { value: 'retention', label: 'Retention' },
  { value: 'acquisition', label: 'Acquisition' },
];

const TIMELINE_OPTIONS = [
  { value: 'immediate', label: 'Immediate' },
  { value: '1-3 months', label: '1-3 months' },
  { value: '3-6 months', label: '3-6 months' },
  { value: '6+ months', label: '6+ months' },
];

interface AddLeadDialogProps {
  onLeadAdded: () => void;
}

export function AddLeadDialog({ onLeadAdded }: AddLeadDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<LeadFormData>({
    contact_name: '',
    company: '',
    title: '',
    email: '',
    phone: '',
    primary_pain_point: '',
    secondary_issues: [],
    budget_info: '',
    timeline: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      contact_name: '',
      company: '',
      title: '',
      email: '',
      phone: '',
      primary_pain_point: '',
      secondary_issues: [],
      budget_info: '',
      timeline: '',
      notes: '',
    });
    setErrors({});
  };

  const handleSecondaryIssueChange = (value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      secondary_issues: checked 
        ? [...(prev.secondary_issues || []), value]
        : (prev.secondary_issues || []).filter(v => v !== value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    // Validate form
    const result = leadSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('Please fix the errors in the form');
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const { error } = await supabase.from('leads').insert({
        user_id: user.id,
        contact_name: formData.contact_name.trim(),
        company: formData.company.trim() || null,
        title: formData.title?.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone?.trim() || null,
        primary_pain_point: formData.primary_pain_point?.trim() || null,
        secondary_issues: formData.secondary_issues?.length ? formData.secondary_issues : null,
        budget_info: formData.budget_info?.trim() || null,
        timeline: formData.timeline || null,
        ai_confidence: 0,
        priority_score: 5,
        lead_status: 'new',
      });

      if (error) throw error;

      toast.success('Lead added successfully!');
      resetForm();
      setOpen(false);
      onLeadAdded();
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Failed to add lead. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2 flex-1 sm:flex-none" size="sm">
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">Add Lead</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Contact Name */}
            <div className="space-y-2">
              <Label htmlFor="contact_name">
                Contact Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contact_name"
                value={formData.contact_name}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                placeholder="John Doe"
                className={errors.contact_name ? 'border-destructive' : ''}
              />
              {errors.contact_name && (
                <p className="text-xs text-destructive">{errors.contact_name}</p>
              )}
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company">
                Company <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Acme Inc."
                className={errors.company ? 'border-destructive' : ''}
              />
              {errors.company && (
                <p className="text-xs text-destructive">{errors.company}</p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="VP of Sales"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@acme.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline</Label>
              <Select
                value={formData.timeline}
                onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  {TIMELINE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Primary Pain Point */}
          <div className="space-y-2">
            <Label htmlFor="primary_pain_point">Primary Pain Point</Label>
            <Input
              id="primary_pain_point"
              value={formData.primary_pain_point}
              onChange={(e) => setFormData(prev => ({ ...prev, primary_pain_point: e.target.value }))}
              placeholder="What's their main challenge?"
            />
          </div>

          {/* Secondary Issues */}
          <div className="space-y-2">
            <Label>Secondary Issues</Label>
            <div className="flex flex-wrap gap-4">
              {SECONDARY_ISSUES.map(issue => (
                <div key={issue.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={issue.value}
                    checked={formData.secondary_issues?.includes(issue.value)}
                    onCheckedChange={(checked) => handleSecondaryIssueChange(issue.value, checked as boolean)}
                  />
                  <Label htmlFor={issue.value} className="text-sm font-normal cursor-pointer">
                    {issue.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Info */}
          <div className="space-y-2">
            <Label htmlFor="budget_info">Budget Information</Label>
            <Input
              id="budget_info"
              value={formData.budget_info}
              onChange={(e) => setFormData(prev => ({ ...prev, budget_info: e.target.value }))}
              placeholder="e.g., $10k-$50k annually"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional context about this lead..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Lead
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
