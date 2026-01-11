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

  // Map research industry to our predefined industry list
  const mapIndustryToValue = (researchIndustry: string): string => {
    const industryLower = researchIndustry.toLowerCase();
    
    // Direct matches
    const directMatch = industries.find(i => i.toLowerCase() === industryLower);
    if (directMatch) return directMatch.toLowerCase();
    
    // Fuzzy matches
    if (industryLower.includes('tech') || industryLower.includes('software') || industryLower.includes('saas') || industryLower.includes('it ')) return 'technology';
    if (industryLower.includes('health') || industryLower.includes('medical') || industryLower.includes('pharma') || industryLower.includes('biotech')) return 'healthcare';
    if (industryLower.includes('financ') || industryLower.includes('bank') || industryLower.includes('insurance') || industryLower.includes('invest')) return 'finance';
    if (industryLower.includes('manufactur') || industryLower.includes('industrial')) return 'manufacturing';
    if (industryLower.includes('retail') || industryLower.includes('ecommerce') || industryLower.includes('e-commerce') || industryLower.includes('consumer')) return 'retail';
    if (industryLower.includes('educat') || industryLower.includes('school') || industryLower.includes('university') || industryLower.includes('learning')) return 'education';
    if (industryLower.includes('real estate') || industryLower.includes('property') || industryLower.includes('construction')) return 'real estate';
    if (industryLower.includes('consult') || industryLower.includes('legal') || industryLower.includes('accounting') || industryLower.includes('professional')) return 'professional services';
    if (industryLower.includes('media') || industryLower.includes('entertainment') || industryLower.includes('advertis') || industryLower.includes('marketing')) return 'media';
    if (industryLower.includes('auto') || industryLower.includes('car') || industryLower.includes('vehicle') || industryLower.includes('dealer')) return 'automotive';
    
    return 'other';
  };

  // Map company size string to select value
  const mapSizeToValue = (size: string): string => {
    const sizeLower = size.toLowerCase();
    
    // Check for employee count patterns
    const numberMatch = sizeLower.match(/(\d+)/g);
    if (numberMatch) {
      const employeeCount = parseInt(numberMatch[0], 10);
      if (employeeCount <= 50) return 'startup';
      if (employeeCount <= 200) return 'smb';
      if (employeeCount <= 1000) return 'mid-market';
      return 'enterprise';
    }
    
    // Keyword matching
    if (sizeLower.includes('startup') || sizeLower.includes('small') || sizeLower.includes('micro')) return 'startup';
    if (sizeLower.includes('smb') || sizeLower.includes('medium')) return 'smb';
    if (sizeLower.includes('mid-market') || sizeLower.includes('mid market') || sizeLower.includes('midsize')) return 'mid-market';
    if (sizeLower.includes('enterprise') || sizeLower.includes('large') || sizeLower.includes('fortune')) return 'enterprise';
    
    return persona.companySize;
  };

  const handleCompanyResearchComplete = (research: CompanyResearchData | null) => {
    const updates: Partial<Persona> = {
      companyResearch: research,
    };
    
    if (research) {
      // Auto-fill industry from research
      if (research.industry) {
        updates.industry = mapIndustryToValue(research.industry);
      }
      
      // Auto-fill company size from research
      if (research.size) {
        updates.companySize = mapSizeToValue(research.size);
      }
      
      // Add researched pain points (merge with existing)
      if (research.painPoints?.length) {
        updates.painPoints = [...new Set([...persona.painPoints, ...research.painPoints.slice(0, 3)])];
      }
    }
    
    onChange({
      ...persona,
      ...updates,
    });
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
