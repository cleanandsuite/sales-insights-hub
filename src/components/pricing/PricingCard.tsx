import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  name: string;
  price: number;
  description?: string;
  features: string[];
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  onSelect: () => void;
  loading?: boolean;
  disabled?: boolean;
  ctaText?: string;
}

export function PricingCard({
  name,
  price,
  description,
  features,
  isCurrentPlan = false,
  isPopular = false,
  onSelect,
  loading = false,
  disabled = false,
  ctaText = 'Get Started',
}: PricingCardProps) {
  return (
    <Card className={cn(
      'relative flex flex-col',
      isCurrentPlan && 'border-primary ring-2 ring-primary',
      isPopular && !isCurrentPlan && 'border-primary/50'
    )}>
      {isCurrentPlan && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Your Plan
        </Badge>
      )}
      {isPopular && !isCurrentPlan && (
        <Badge variant="secondary" className="absolute -top-3 left-1/2 -translate-x-1/2">
          Most Popular
        </Badge>
      )}
      
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{name}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
        <div className="mt-4">
          <span className="text-4xl font-bold">${price}</span>
          <span className="text-muted-foreground">/mo</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrentPlan ? 'outline' : 'default'}
          onClick={onSelect}
          disabled={disabled || loading || isCurrentPlan}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : isCurrentPlan ? (
            'Current Plan'
          ) : (
            ctaText
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
