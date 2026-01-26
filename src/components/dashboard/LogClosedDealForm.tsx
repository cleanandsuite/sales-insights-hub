import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Calendar, Building2, FileText, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface LogClosedDealFormProps {
  onDealLogged: (deal: {
    amount: number;
    closeDate: string;
    accountName: string;
    notes: string;
  }) => void;
}

export function LogClosedDealForm({ onDealLogged }: LogClosedDealFormProps) {
  const [amount, setAmount] = useState('');
  const [closeDate, setCloseDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountName, setAccountName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !accountName) {
      toast.error('Please fill in deal amount and account name');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onDealLogged({
      amount: parseFloat(amount),
      closeDate,
      accountName,
      notes,
    });

    // Reset form
    setAmount('');
    setAccountName('');
    setNotes('');
    setCloseDate(new Date().toISOString().split('T')[0]);
    setIsSubmitting(false);
    
    toast.success('🎉 Deal logged successfully!', {
      description: `$${parseFloat(amount).toLocaleString()} from ${accountName}`,
    });
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900/20 border-cyan-500/30 overflow-hidden relative">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl" />
      
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          Log Closed Deal
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 relative">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-xs text-slate-400 flex items-center gap-1.5">
              <DollarSign className="h-3 w-3" /> Deal Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <Input
                id="amount"
                type="number"
                placeholder="50,000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 bg-slate-800/50 border-slate-700 focus:border-cyan-500 text-white"
              />
            </div>
          </div>

          {/* Close Date */}
          <div className="space-y-1.5">
            <Label htmlFor="closeDate" className="text-xs text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3 w-3" /> Close Date
            </Label>
            <Input
              id="closeDate"
              type="date"
              value={closeDate}
              onChange={(e) => setCloseDate(e.target.value)}
              className="bg-slate-800/50 border-slate-700 focus:border-cyan-500 text-white"
            />
          </div>

          {/* Account Name */}
          <div className="space-y-1.5">
            <Label htmlFor="account" className="text-xs text-slate-400 flex items-center gap-1.5">
              <Building2 className="h-3 w-3" /> Account Name
            </Label>
            <Input
              id="account"
              placeholder="Acme Corporation"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="bg-slate-800/50 border-slate-700 focus:border-cyan-500 text-white"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs text-slate-400 flex items-center gap-1.5">
              <FileText className="h-3 w-3" /> Notes (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Any details about the deal..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="bg-slate-800/50 border-slate-700 focus:border-cyan-500 text-white resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full font-bold bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-900 shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40 hover:scale-[1.02]"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mr-2" />
                Logging...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Log Deal
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
