import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ArrowLeft, Sparkles, Check } from 'lucide-react';

export default function UpgradePlan() {
  const navigate = useNavigate();

  // Team plan is coming soon - checkout disabled
  const isComingSoon = true;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Enterprise Plan</CardTitle>
          <CardDescription className="text-base">
            Unlock collaboration features and empower your sales team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-center text-muted-foreground">
              <strong className="text-foreground">Enterprise features</strong> require an Enterprise subscription.
              Upgrade now to access:
            </p>
          </div>

          <ul className="space-y-3">
            {[
              'Team performance analytics',
              'Manager dashboard',
              'Lead assignment & routing',
              'Team sharing & collaboration',
              'Custom playbooks',
              'Priority support',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 pt-4">
            <Button 
              disabled={isComingSoon}
              className="gap-2"
              size="lg"
            >
              <Sparkles className="h-4 w-4" />
              Coming Soon - $99/user/mo
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
