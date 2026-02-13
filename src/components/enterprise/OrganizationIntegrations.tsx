import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Puzzle, Check, X, Copy, RefreshCw, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Integration {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  description: string;
}

const mockIntegrations: Integration[] = [
  { id: 'salesforce', name: 'Salesforce', icon: '☁️', connected: true, description: 'CRM sync and opportunity tracking' },
  { id: 'hubspot', name: 'HubSpot', icon: '🔶', connected: false, description: 'Contact and deal synchronization' },
  { id: 'slack', name: 'Slack', icon: '💬', connected: true, description: 'Real-time notifications and alerts' },
  { id: 'zoom', name: 'Zoom', icon: '📹', connected: true, description: 'Call recording integration' },
  { id: 'teams', name: 'Microsoft Teams', icon: '🟦', connected: false, description: 'Meeting integration' },
  { id: 'calendar', name: 'Google Calendar', icon: '📅', connected: true, description: 'Schedule sync' },
];

export function OrganizationIntegrations() {
  const [integrations] = useState(mockIntegrations);
  const [apiKey] = useState('sk_live_ent_1234567890abcdef');
  const [showApiKey, setShowApiKey] = useState(false);
  const [regenerating, setRegenrating] = useState(false);

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "API Key Copied",
      description: "The API key has been copied to your clipboard.",
    });
  };

  const handleRegenerateKey = async () => {
    setRegenrating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRegenrating(false);
    toast({
      title: "API Key Regenerated",
      description: "Your new API key is ready. The old key has been invalidated.",
    });
  };

  return (
    <Card className="bg-card/30 backdrop-blur-xl border-white/[0.08] shadow-2xl overflow-hidden group hover:bg-card/40 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/20">
            <Puzzle className="h-5 w-5 text-pink-400" />
          </div>
          <div>
            <CardTitle className="text-lg text-foreground">Integrations & API</CardTitle>
            <CardDescription>Connect third-party apps and manage API access</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-6">
        {/* Connected Apps */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Connected Applications</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {integrations.map((integration) => (
              <div 
                key={integration.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-all",
                  integration.connected 
                    ? "bg-emerald-500/5 border-emerald-500/20" 
                    : "bg-muted/10 border-white/[0.05]"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                {integration.connected ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1">
                    <Check className="h-3 w-3" />
                    Connected
                  </Badge>
                ) : (
                  <Button variant="outline" size="sm" className="border-white/[0.1] hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400">
                    Connect
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* API Key Management */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">API Access</h4>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-cyan-400">
              View Docs
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
          
          <div className="p-4 rounded-xl bg-muted/20 border border-white/[0.05] space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Enterprise API Key</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    readOnly
                    className="bg-black/30 border-white/[0.08] font-mono text-sm pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyApiKey}
                  className="border-white/[0.1] hover:bg-cyan-500/10 hover:border-cyan-500/30"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateKey}
                  disabled={regenerating}
                  className="border-white/[0.1] hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-400"
                >
                  <RefreshCw className={cn("h-4 w-4", regenerating && "animate-spin")} />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Rate limit: 10,000 requests/hour</span>
              <span className="text-muted-foreground">Used: 2,847 this hour</span>
            </div>
          </div>
        </div>
        
        {/* Webhooks Hint */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20">
          <p className="text-xs text-muted-foreground">
            <strong className="text-cyan-400">Pro tip:</strong> Set up webhooks to receive real-time 
            notifications when calls are analyzed, scores are updated, or coaching suggestions are generated.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
