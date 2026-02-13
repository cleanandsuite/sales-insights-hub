import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building2, Search, Loader2, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CompanyMatch {
  name: string;
  city?: string;
  state?: string;
  country?: string;
  industry?: string;
  description?: string;
  size?: string;
  website?: string;
}

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

interface CompanyLookupFieldProps {
  companyName: string;
  onCompanyNameChange: (name: string) => void;
  onCompanyResearchComplete: (data: CompanyResearchData | null) => void;
  companyResearch: CompanyResearchData | null;
}

export function CompanyLookupField({
  companyName,
  onCompanyNameChange,
  onCompanyResearchComplete,
  companyResearch,
}: CompanyLookupFieldProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [showSelectionDialog, setShowSelectionDialog] = useState(false);
  const [companyMatches, setCompanyMatches] = useState<CompanyMatch[]>([]);
  const [selectedCompanyIndex, setSelectedCompanyIndex] = useState<string>('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleLookupCompany = async () => {
    if (!companyName.trim()) {
      toast.error('Please enter a company name');
      return;
    }

    setIsSearching(true);
    setSearchPerformed(true);

    try {
      const response = await supabase.functions.invoke('company-lookup', {
        body: { companyName: companyName.trim() }
      });

      if (response.error) {
        throw response.error;
      }

      const data = response.data;

      if (data.status === 'not_found') {
        toast.info('Company not found. Using default process.');
        onCompanyResearchComplete(null);
        setCompanyMatches([]);
      } else if (data.status === 'multiple') {
        // Multiple matches found - show selection dialog
        setCompanyMatches(data.matches || []);
        setShowSelectionDialog(true);
      } else if (data.status === 'found') {
        // Single match found - use the research data
        onCompanyResearchComplete(data.research);
        toast.success(`Found ${data.research.name}! Research added to your script.`);
      }
    } catch (error) {
      console.error('Company lookup error:', error);
      toast.error('Failed to look up company. Using default process.');
      onCompanyResearchComplete(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCompany = async () => {
    if (selectedCompanyIndex === 'none') {
      // User selected "None of the Above"
      setShowSelectionDialog(false);
      onCompanyResearchComplete(null);
      toast.info('Using default process without company research.');
      return;
    }

    const index = parseInt(selectedCompanyIndex, 10);
    const selectedCompany = companyMatches[index];

    if (!selectedCompany) return;

    setShowSelectionDialog(false);
    setIsSearching(true);

    try {
      // Fetch detailed research for the selected company
      const response = await supabase.functions.invoke('company-lookup', {
        body: { 
          companyName: selectedCompany.name,
          city: selectedCompany.city,
          state: selectedCompany.state,
          confirmed: true
        }
      });

      if (response.error) throw response.error;

      if (response.data.status === 'found') {
        onCompanyResearchComplete(response.data.research);
        toast.success(`Research completed for ${selectedCompany.name}!`);
      } else {
        onCompanyResearchComplete(null);
      }
    } catch (error) {
      console.error('Company research error:', error);
      toast.error('Failed to research company.');
      onCompanyResearchComplete(null);
    } finally {
      setIsSearching(false);
    }
  };

  const clearResearch = () => {
    onCompanyResearchComplete(null);
    setSearchPerformed(false);
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="companyName" className="flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        Company Name
        <Badge variant="outline" className="text-xs font-normal">Optional</Badge>
      </Label>
      
      <div className="flex gap-2">
        <Input
          id="companyName"
          placeholder="e.g., Acme Corp, Salesforce, HubSpot"
          value={companyName}
          onChange={(e) => {
            onCompanyNameChange(e.target.value);
            if (searchPerformed) {
              setSearchPerformed(false);
              onCompanyResearchComplete(null);
            }
          }}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleLookupCompany}
          disabled={isSearching || !companyName.trim()}
          className="gap-2"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {isSearching ? 'Looking up...' : 'Research'}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Add a company name for AI-powered research to enhance your sales pitch with company-specific insights.
      </p>

      {/* Research Status */}
      {companyResearch && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    Research Complete: {companyResearch.name}
                  </p>
                  {companyResearch.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {companyResearch.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {companyResearch.industry && (
                      <Badge variant="secondary" className="text-xs">{companyResearch.industry}</Badge>
                    )}
                    {companyResearch.size && (
                      <Badge variant="secondary" className="text-xs">{companyResearch.size}</Badge>
                    )}
                    {companyResearch.city && companyResearch.state && (
                      <Badge variant="secondary" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {companyResearch.city}, {companyResearch.state}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearResearch}
                className="text-xs"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Company Selection Dialog */}
      <Dialog open={showSelectionDialog} onOpenChange={setShowSelectionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Multiple Companies Found
            </DialogTitle>
            <DialogDescription>
              We found several companies matching "{companyName}". Please select the correct one:
            </DialogDescription>
          </DialogHeader>

          <RadioGroup
            value={selectedCompanyIndex}
            onValueChange={setSelectedCompanyIndex}
            className="space-y-3 max-h-64 overflow-y-auto"
          >
            {companyMatches.map((company, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors ${
                  selectedCompanyIndex === index.toString() ? 'border-primary bg-accent/30' : ''
                }`}
                onClick={() => setSelectedCompanyIndex(index.toString())}
              >
                <RadioGroupItem value={index.toString()} id={`company-${index}`} />
                <div className="flex-1 space-y-1">
                  <label htmlFor={`company-${index}`} className="text-sm font-medium cursor-pointer">
                    {company.name}
                  </label>
                  {(company.city || company.state) && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {[company.city, company.state, company.country].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {company.industry && (
                    <Badge variant="outline" className="text-xs">{company.industry}</Badge>
                  )}
                </div>
              </div>
            ))}

            {/* None of the Above Option */}
            <div
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors ${
                selectedCompanyIndex === 'none' ? 'border-primary bg-accent/30' : ''
              }`}
              onClick={() => setSelectedCompanyIndex('none')}
            >
              <RadioGroupItem value="none" id="company-none" />
              <label htmlFor="company-none" className="text-sm font-medium cursor-pointer text-muted-foreground">
                None of the Above (use default process)
              </label>
            </div>
          </RadioGroup>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowSelectionDialog(false);
                onCompanyResearchComplete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSelectCompany}
              disabled={!selectedCompanyIndex}
            >
              Confirm Selection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
