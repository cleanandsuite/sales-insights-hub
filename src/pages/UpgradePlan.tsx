import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ArrowLeft, Check, Phone, Brain, BarChart3, Shield, Headphones } from 'lucide-react';

export default function UpgradePlan() {
  const navigate = useNavigate();

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
            Custom pricing · Minimum 10 seats · Tailored to your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-center text-muted-foreground">
              Built for <strong className="text-foreground">high-value sales organizations</strong> that 
              need full-transparency management and custom AI.
            </p>
          </div>

          <ul className="space-y-3">
            {[
              { icon: Brain, text: 'Custom business-specific AI models' },
              { icon: Headphones, text: '5 learning-style AI coaching engines' },
              { icon: BarChart3, text: 'Full-transparency management dashboard' },
              { icon: Users, text: 'Gamified rep performance & leaderboards' },
              { icon: Shield, text: 'SSO, compliance & data export controls' },
              { icon: Phone, text: 'Dedicated numbers per rep with unlimited minutes' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-foreground text-sm">{text}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 pt-4">
            <Button 
              className="gap-2"
              size="lg"
              asChild
            >
              <a href="mailto:sales@sellsig.com?subject=Enterprise%20Plan%20Inquiry">
                <Phone className="h-4 w-4" />
                Schedule a Call
              </a>
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