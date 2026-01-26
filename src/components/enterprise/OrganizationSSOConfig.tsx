import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Upload, CheckCircle2, XCircle, Loader2, Key, Globe, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type SSOStatus = 'connected' | 'not_configured' | 'error';

interface SSOConfig {
  idpMetadataUrl: string;
  entityId: string;
  ssoUrl: string;
  certFingerprint: string;
  jitProvisioning: boolean;
  status: SSOStatus;
}

export function OrganizationSSOConfig() {
  const [config, setConfig] = useState<SSOConfig>({
    idpMetadataUrl: '',
    entityId: '',
    ssoUrl: '',
    certFingerprint: '',
    jitProvisioning: false,
    status: 'not_configured',
  });
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState('saml');

  const handleTestConnection = async () => {
    setTesting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = config.idpMetadataUrl && config.entityId;
    
    if (success) {
      setConfig(prev => ({ ...prev, status: 'connected' }));
      toast({
        title: "Connection Successful",
        description: "SSO configuration validated. Users can now authenticate via your IdP.",
      });
    } else {
      setConfig(prev => ({ ...prev, status: 'error' }));
      toast({
        title: "Connection Failed",
        description: "Unable to validate SSO configuration. Check your IdP metadata URL and Entity ID.",
        variant: "destructive",
      });
    }
    
    setTesting(false);
  };

  const getStatusBadge = () => {
    switch (config.status) {
      case 'connected':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Connected
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 gap-1">
            <XCircle className="h-3 w-3" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted/50 text-muted-foreground border-muted-foreground/30 gap-1">
            <Shield className="h-3 w-3" />
            Not Configured
          </Badge>
        );
    }
  };

  return (
    <Card className="bg-card/30 backdrop-blur-xl border-white/[0.08] shadow-2xl overflow-hidden group hover:bg-card/40 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/20">
              <Key className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-foreground">SSO Configuration</CardTitle>
              <CardDescription>Configure SAML 2.0 or OIDC for enterprise authentication</CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/30 border border-white/[0.08]">
            <TabsTrigger 
              value="saml" 
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-500/30"
            >
              SAML 2.0
            </TabsTrigger>
            <TabsTrigger 
              value="oidc"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-500/30"
            >
              OIDC
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="saml" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="idp-metadata" className="text-sm text-muted-foreground flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" />
                  IdP Metadata URL
                </Label>
                <Input
                  id="idp-metadata"
                  placeholder="https://your-idp.com/saml/metadata"
                  value={config.idpMetadataUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, idpMetadataUrl: e.target.value }))}
                  className="bg-muted/30 border-white/[0.08] focus:border-cyan-500/50 focus:ring-cyan-500/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="entity-id" className="text-sm text-muted-foreground flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  Entity ID / Issuer
                </Label>
                <Input
                  id="entity-id"
                  placeholder="urn:sellsig:enterprise:saml"
                  value={config.entityId}
                  onChange={(e) => setConfig(prev => ({ ...prev, entityId: e.target.value }))}
                  className="bg-muted/30 border-white/[0.08] focus:border-cyan-500/50 focus:ring-cyan-500/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sso-url" className="text-sm text-muted-foreground">SSO URL</Label>
                <Input
                  id="sso-url"
                  placeholder="https://your-idp.com/saml/sso"
                  value={config.ssoUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, ssoUrl: e.target.value }))}
                  className="bg-muted/30 border-white/[0.08] focus:border-cyan-500/50 focus:ring-cyan-500/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cert" className="text-sm text-muted-foreground">Certificate Fingerprint</Label>
                <Input
                  id="cert"
                  placeholder="SHA256:AB:CD:EF:..."
                  value={config.certFingerprint}
                  onChange={(e) => setConfig(prev => ({ ...prev, certFingerprint: e.target.value }))}
                  className="bg-muted/30 border-white/[0.08] focus:border-cyan-500/50 focus:ring-cyan-500/20 font-mono text-xs"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-white/[0.05]">
                <Label htmlFor="xml-upload" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Or upload IdP metadata XML
                </Label>
                <Button variant="outline" size="sm" className="border-white/[0.1] hover:bg-cyan-500/10 hover:border-cyan-500/30">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload XML
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="oidc" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Discovery URL</Label>
                <Input
                  placeholder="https://your-idp.com/.well-known/openid-configuration"
                  className="bg-muted/30 border-white/[0.08] focus:border-cyan-500/50 focus:ring-cyan-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Client ID</Label>
                <Input
                  placeholder="your-client-id"
                  className="bg-muted/30 border-white/[0.08] focus:border-cyan-500/50 focus:ring-cyan-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Client Secret</Label>
                <Input
                  type="password"
                  placeholder="••••••••••••••••"
                  className="bg-muted/30 border-white/[0.08] focus:border-cyan-500/50 focus:ring-cyan-500/20"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20">
          <div className="space-y-0.5">
            <Label htmlFor="jit" className="text-sm font-medium text-foreground">Just-in-Time Provisioning</Label>
            <p className="text-xs text-muted-foreground">Automatically create user accounts on first SSO login</p>
          </div>
          <Switch
            id="jit"
            checked={config.jitProvisioning}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, jitProvisioning: checked }))}
            className="data-[state=checked]:bg-cyan-500"
          />
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={handleTestConnection}
            disabled={testing}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-medium shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>
          <Button variant="outline" className="border-white/[0.1] hover:bg-white/5">
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
