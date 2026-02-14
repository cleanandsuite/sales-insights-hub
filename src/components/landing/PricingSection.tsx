import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePricingAvailability } from "@/hooks/usePricingAvailability";

// Countdown timer component
function CountdownTimer({ deadline }: { deadline: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = deadline.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <div className="flex items-center justify-center gap-2 text-sm font-semibold">
      <Clock className="h-4 w-4 text-destructive" />
      <div className="flex gap-1">
        <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs">{timeLeft.days}d</span>
        <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs">{timeLeft.hours}h</span>
        <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs">
          {timeLeft.minutes}m
        </span>
        <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs">
          {timeLeft.seconds}s
        </span>
      </div>
    </div>
  );
}

// Comparison table data
const comparisonData = [
  { feature: "Setup Time", sellsig: "Minutes", gong: "2-4 weeks", chorus: "1-2 weeks", fireflies: "10 minutes" },
  { feature: "Price (per user/mo)", sellsig: "$25-55", gong: "$100-300", chorus: "$80-200", fireflies: "$19" },
  {
    feature: "Unlimited Recording",
    sellsig: "✓ Yes",
    gong: "✓ Enterprise",
    chorus: "✓ Enterprise",
    fireflies: "✓ Paid plans",
  },
  {
    feature: "Live Coaching",
    sellsig: "✓ Real-time",
    gong: "Post-call only",
    chorus: "Post-call only",
    fireflies: "✗",
  },
  {
    feature: "AI Coach Personalities",
    sellsig: "✓ 5 Styles",
    gong: "✗",
    chorus: "✗",
    fireflies: "✗",
  },
  {
    feature: "AI Deal Insights",
    sellsig: "✓ Included",
    gong: "✓ Enterprise",
    chorus: "✓ Enterprise",
    fireflies: "Limited",
  },
];

export function PricingSection() {
  const { availability, loading: availabilityLoading } = usePricingAvailability();

  const handleStartTrial = () => {
    window.open("https://buy.stripe.com/fZu6oG1zi7O7euubi69k400", "_blank");
  };

  const handleJoinWaitlist = () => {
    toast.info("You've been added to our waitlist! We'll notify you when spots open up.");
  };

  const singleUserAvailable = availability?.singleUser.available ?? true;
  const deadline = availability?.deadline ?? new Date("2026-01-31");

  const pricingTiers = [
    {
      name: "Starter",
      description: "Perfect for individual sales reps",
      trialPrice: "$0",
      trialPeriod: "14 days",
      price: "$25",
      pricePeriod: "/mo",
      priceNote: "200 AI coaching minutes included",
      features: [
        "Unlimited call recordings",
        "AI transcription & analysis",
        "Live coaching suggestions",
        "Lead intelligence",
        "Deal insights",
        "200 AI minutes/month",
        "Email support",
      ],
      cta: "Start Free 14-Day Trial",
      popular: true,
      available: true,
    },
    {
      name: "Pro",
      description: "For serious sales professionals",
      trialPrice: "$0",
      trialPeriod: "14 days",
      price: "$55",
      pricePeriod: "/mo",
      priceNote: "Unlimited AI coaching",
      features: [
        "Everything in Starter",
        "Unlimited AI coaching minutes",
        "5 AI Coach Personalities",
        "Smart Coaching Engine",
        "Priority support",
        "Advanced analytics",
        "Team leaderboards",
      ],
      cta: "Start Free 14-Day Trial",
      popular: true,
      available: true,
    },
    {
      name: "Enterprise",
      description: "For scaling sales organizations",
      trialPrice: null,
      trialPeriod: null,
      price: "$150",
      pricePeriod: "/user/mo",
      priceNote: "Contact for volume discounts",
      features: [
        "Everything in Pro",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantees",
        "Advanced security",
        "API access",
        "24/7 phone support",
      ],
      cta: "Contact Sales",
      popular: false,
      available: true,
    },
  ];

  if (availabilityLoading) {
    return (
      <section className="py-20 bg-background" id="pricing">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-24 bg-muted/30" id="pricing">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple, <span className="text-primary">Transparent</span> Pricing
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Start with a 14-day free trial. No charge until you see the value.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative bg-card rounded-lg border shadow-md ${tier.popular ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground font-semibold">
                  🔥 Most Popular
                </Badge>
              )}

              <CardHeader className="pb-4 pt-8">
                <CardTitle className="text-xl font-bold text-foreground">{tier.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Pricing */}
                <div>
                  {tier.trialPrice && (
                    <div className="mb-2">
                      <span className="text-3xl font-bold text-foreground">{tier.trialPrice}</span>
                      <span className="text-muted-foreground ml-2">for {tier.trialPeriod}</span>
                    </div>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.pricePeriod}</span>
                  </div>
                  {tier.priceNote && <p className="text-sm text-accent font-medium mt-1">{tier.priceNote}</p>}
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-foreground">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pb-6">
                <Button
                  className={`w-full font-semibold py-5 rounded-lg ${
                    tier.available ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md" : ""
                  }`}
                  variant={tier.available ? "default" : "outline"}
                  onClick={() => (tier.available ? handleStartTrial() : handleJoinWaitlist())}
                  disabled={!tier.available}
                >
                  {tier.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">How We Compare</h3>
          <div className="overflow-x-auto">
            <table className="w-full bg-card rounded-lg border border-border shadow-md">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                  <th className="text-center p-4 font-semibold text-primary bg-primary/5">SellSig</th>
                  <th className="text-center p-4 font-semibold text-muted-foreground">Gong</th>
                  <th className="text-center p-4 font-semibold text-muted-foreground">Chorus</th>
                  <th className="text-center p-4 font-semibold text-muted-foreground">Fireflies</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr key={idx} className={idx !== comparisonData.length - 1 ? "border-b border-border" : ""}>
                    <td className="p-4 text-sm text-foreground font-medium">{row.feature}</td>
                    <td className="p-4 text-sm text-center text-primary font-semibold bg-primary/5">{row.sellsig}</td>
                    <td className="p-4 text-sm text-center text-muted-foreground">{row.gong}</td>
                    <td className="p-4 text-sm text-center text-muted-foreground">{row.chorus}</td>
                    <td className="p-4 text-sm text-center text-muted-foreground">{row.fireflies}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Card required upfront — no charge until day 15. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
