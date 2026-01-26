import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Shield, ShieldCheck, Search, ExternalLink, LogOut, 
  Monitor, Smartphone, Globe, Clock, AlertTriangle, 
  CheckCircle2, FileText, Lock 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  ip: string;
}

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  deviceType: 'desktop' | 'mobile' | 'tablet';
}

const mockAuditLogs: AuditLog[] = [
  { id: '1', timestamp: '2026-01-26T14:32:00', user: 'john@acme.com', action: 'User Invited', details: 'Invited sarah@acme.com as member', ip: '192.168.1.1' },
  { id: '2', timestamp: '2026-01-26T13:15:00', user: 'admin@acme.com', action: 'Role Changed', details: 'Changed Mike Chen to manager', ip: '192.168.1.2' },
  { id: '3', timestamp: '2026-01-26T11:45:00', user: 'sarah@acme.com', action: 'Login', details: 'Successful SSO login', ip: '192.168.1.3' },
  { id: '4', timestamp: '2026-01-25T16:20:00', user: 'admin@acme.com', action: 'SSO Updated', details: 'Updated SAML configuration', ip: '192.168.1.2' },
  { id: '5', timestamp: '2026-01-25T14:00:00', user: 'john@acme.com', action: 'Export', details: 'Exported call analytics data', ip: '192.168.1.1' },
  { id: '6', timestamp: '2026-01-25T10:30:00', user: 'mike@acme.com', action: 'Login Failed', details: 'Invalid password attempt', ip: '192.168.1.4' },
  { id: '7', timestamp: '2026-01-24T09:15:00', user: 'admin@acme.com', action: 'User Removed', details: 'Removed inactive user tom@acme.com', ip: '192.168.1.2' },
];

const mockSessions: ActiveSession[] = [
  { id: '1', device: 'Chrome on MacOS', location: 'San Francisco, CA', lastActive: '2 minutes ago', isCurrent: true, deviceType: 'desktop' },
  { id: '2', device: 'Safari on iPhone', location: 'San Francisco, CA', lastActive: '1 hour ago', isCurrent: false, deviceType: 'mobile' },
  { id: '3', device: 'Firefox on Windows', location: 'New York, NY', lastActive: '3 hours ago', isCurrent: false, deviceType: 'desktop' },
];

export function OrganizationSecurityCompliance() {
  const [auditLogs] = useState(mockAuditLogs);
  const [sessions, setSessions] = useState(mockSessions);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleForceLogout = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    toast({
      title: "Session Terminated",
      description: "The session has been forcefully logged out.",
    });
  };

  const getDeviceIcon = (type: ActiveSession['deviceType']) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getActionBadge = (action: string) => {
    if (action.includes('Failed') || action.includes('Removed')) {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">{action}</Badge>;
    }
    if (action.includes('Login') || action.includes('Updated')) {
      return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">{action}</Badge>;
    }
    if (action.includes('Invited') || action.includes('Changed')) {
      return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">{action}</Badge>;
    }
    return <Badge className="bg-muted/50 text-muted-foreground border-muted-foreground/30 text-xs">{action}</Badge>;
  };

  return (
    <Card className="bg-card/30 backdrop-blur-xl border-white/[0.08] shadow-2xl overflow-hidden group hover:bg-card/40 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20">
            <ShieldCheck className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-lg text-foreground">Security & Compliance</CardTitle>
            <CardDescription>Monitor security events and manage compliance settings</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-6">
        {/* Compliance Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">SOC 2 Type II</p>
              <p className="text-xs text-emerald-400">Compliant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Globe className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">GDPR Ready</p>
              <p className="text-xs text-cyan-400">EU Data Protection</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Lock className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">256-bit Encryption</p>
              <p className="text-xs text-purple-400">AES-256-GCM</p>
            </div>
          </div>
        </div>
        
        {/* Data Retention Policy */}
        <div className="p-4 rounded-xl bg-muted/20 border border-white/[0.05]">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Data Retention Policy</p>
              <p className="text-xs text-muted-foreground mt-1">
                Call recordings and transcripts are retained for <strong className="text-foreground">24 months</strong>. 
                Audit logs are retained indefinitely. You can request early deletion through your account executive.
              </p>
            </div>
          </div>
        </div>
        
        {/* Active Sessions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              Active Sessions
            </h4>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10">
                  <LogOut className="h-3 w-3 mr-1" />
                  Logout All Others
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-white/[0.1]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Logout All Other Sessions?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will forcefully log out all sessions except your current one. Users will need to sign in again.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-white/[0.1]">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-red-500 hover:bg-red-600"
                    onClick={() => {
                      setSessions(prev => prev.filter(s => s.isCurrent));
                      toast({ title: "All other sessions terminated" });
                    }}
                  >
                    Logout All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <div className="space-y-2">
            {sessions.map((session) => (
              <div 
                key={session.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-white/[0.05] hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    {getDeviceIcon(session.deviceType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{session.device}</p>
                      {session.isCurrent && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      {session.location}
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      {session.lastActive}
                    </div>
                  </div>
                </div>
                {!session.isCurrent && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-white/[0.1]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Force Logout Session?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will terminate the session on {session.device} in {session.location}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-white/[0.1]">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => handleForceLogout(session.id)}
                        >
                          Force Logout
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Audit Logs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Audit Logs
            </h4>
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 bg-muted/30 border-white/[0.08] text-sm"
                />
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-cyan-400">
                View All
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
          
          <div className="rounded-xl border border-white/[0.08] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.08] hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs">Time</TableHead>
                  <TableHead className="text-muted-foreground text-xs">User</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Action</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Details</TableHead>
                  <TableHead className="text-muted-foreground text-xs">IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.slice(0, 5).map((log) => (
                  <TableRow key={log.id} className="border-white/[0.05] hover:bg-white/[0.02]">
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{log.user}</TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{log.details}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{log.ip}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Security Alert */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Security Recommendation</p>
            <p className="text-xs text-muted-foreground mt-1">
              Enable SSO with your identity provider to enforce organization-wide authentication policies 
              and gain centralized control over user access.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
