import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useState } from 'react';
import { CompanyLookupField } from './CompanyLookupField';

interface CompanyResearchData {
  name: string;
  description?: string;
  industry?: string;
  size?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  recentNews?: string[];
  painPoints?: string[];
  competitors?: string[];
  techStack?: string[];
}

interface Persona {
  role: string;
  industry: string;
  companySize: string;
  painPoints: string[];
  personalityStyle: string;
  companyName?: string;
  companyResearch?: CompanyResearchData | null;
}

interface PersonaFormProps {
  persona: Persona;
  onChange: (persona: Persona) => void;
}

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail',
  'Education', 'Real Estate', 'Professional Services', 'Media', 'Automotive', 'Other'
];

const companySizes = [
  { value: 'startup', label: 'Startup (1-50)' },
  { value: 'smb', label: 'SMB (51-200)' },
  { value: 'mid-market', label: 'Mid-Market (201-1000)' },
  { value: 'enterprise', label: 'Enterprise (1000+)' },
];

const personalityStyles = [
  { value: 'analytical', label: 'Analytical - Needs data and proof' },
  { value: 'driver', label: 'Driver - Results-focused, direct' },
  { value: 'expressive', label: 'Expressive - Relationship-focused' },
  { value: 'amiable', label: 'Amiable - Collaborative, team-oriented' },
];

export function PersonaForm({ persona, onChange }: PersonaFormProps) {
  const [newPainPoint, setNewPainPoint] = useState('');

  const addPainPoint = () => {
    if (newPainPoint.trim() && !persona.painPoints.includes(newPainPoint.trim())) {
      onChange({
        ...persona,
        painPoints: [...persona.painPoints, newPainPoint.trim()]
      });
      setNewPainPoint('');
    }
  };

  const removePainPoint = (point: string) => {
    onChange({
      ...persona,
      painPoints: persona.painPoints.filter(p => p !== point)
    });
  };

  const handleCompanyResearchComplete = (research: CompanyResearchData | null) => {
    onChange({
      ...persona,
      companyResearch: research,
      // Auto-fill industry and company size if research provides them
      ...(research?.industry && !persona.industry ? { industry: research.industry.toLowerCase() } : {}),
      ...(research?.size ? { companySize: mapSizeToValue(research.size) } : {}),
      // Add researched pain points
      ...(research?.painPoints?.length ? { 
        painPoints: [...new Set([...persona.painPoints, ...research.painPoints.slice(0, 3)])]
      } : {}),
    });
  };

  // Map company size string to select value
  const mapSizeToValue = (size: string): string => {
    const sizeLower = size.toLowerCase();
    if (sizeLower.includes('startup') || sizeLower.includes('1-50')) return 'startup';
    if (sizeLower.includes('smb') || sizeLower.includes('51-200')) return 'smb';
    if (sizeLower.includes('mid') || sizeLower.includes('201-1000')) return 'mid-market';
    if (sizeLower.includes('enterprise') || sizeLower.includes('1000+')) return 'enterprise';
    return persona.companySize;
  };

  return (
    <div className="space-y-4">
      {/* Company Lookup Field */}
      <CompanyLookupField
        companyName={persona.companyName || ''}
        onCompanyNameChange={(name) => onChange({ ...persona, companyName: name })}
        onCompanyResearchComplete={handleCompanyResearchComplete}
        companyResearch={persona.companyResearch || null}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Buyer Role</Label>
          <Input
            id="role"
            placeholder="e.g., VP of Sales, CTO, Procurement Manager"
            value={persona.role}
            onChange={(e) => onChange({ ...persona, role: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Select
            value={persona.industry}
            onValueChange={(value) => onChange({ ...persona, industry: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry.toLowerCase()}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="companySize">Company Size</Label>
          <Select
            value={persona.companySize}
            onValueChange={(value) => onChange({ ...persona, companySize: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              {companySizes.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="personalityStyle">Buyer Personality</Label>
          <Select
            value={persona.personalityStyle}
            onValueChange={(value) => onChange({ ...persona, personalityStyle: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select personality type" />
            </SelectTrigger>
            <SelectContent>
              {personalityStyles.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Known Pain Points</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a pain point..."
            value={newPainPoint}
            onChange={(e) => setNewPainPoint(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPainPoint())}
          />
          <button
            onClick={addPainPoint}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            Add
          </button>
        </div>
        {persona.painPoints.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {persona.painPoints.map((point) => (
              <Badge key={point} variant="secondary" className="gap-1">
                {point}
                <button onClick={() => removePainPoint(point)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
