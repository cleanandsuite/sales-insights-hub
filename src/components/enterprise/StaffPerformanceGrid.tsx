import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, TrendingDown, Minus, ChevronRight, Target, Zap,
  MessageSquare, Handshake, Presentation, Shield
} from 'lucide-react';

interface StaffPerformanceGridProps {
  teamId: string;
  onSelectStaff?: (userId: string, name: string) => void;
}

interface StaffMember {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  avg_overall_score: number;
  avg_discovery_score: number;
  avg_closing_score: number;
  avg_rapport_score: number;
  avg_presentation_score: number;
  avg_objection_handling_score: number;
  total_calls: number;
  win_rate: number;
}

interface SkillData {
  name: string;
  score: number;
  icon: React.ElementType;
  isStrength: boolean;
  isWeakness: boolean;
}

export function StaffPerformanceGrid({ teamId, onSelectStaff }: StaffPerformanceGridProps) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, [teamId]);

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('manager_team_stats')
        .select('*')
        .eq('team_id', teamId)
        .order('avg_overall_score', { ascending: false });

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSkills = (member: StaffMember): SkillData[] => {
    const skills = [
      { name: 'Discovery', score: member.avg_discovery_score, icon: Target },
      { name: 'Closing', score: member.avg_closing_score, icon: Zap },
      { name: 'Rapport', score: member.avg_rapport_score, icon: Handshake },
      { name: 'Presentation', score: member.avg_presentation_score, icon: Presentation },
      { name: 'Objections', score: member.avg_objection_handling_score, icon: Shield },
    ];

    const sorted = [...skills].sort((a, b) => b.score - a.score);
    const maxScore = sorted[0]?.score || 0;
    const minScore = sorted[sorted.length - 1]?.score || 0;

    return skills.map(skill => ({
      ...skill,
      isStrength: skill.score >= maxScore - 5 && skill.score >= 60,
      isWeakness: skill.score <= minScore + 5 && skill.score < 50,
    }));
  };

  const getTrendIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="h-4 w-4 text-success" />;
    if (score >= 50) return <Minus className="h-4 w-4 text-warning" />;
    return <TrendingDown className="h-4 w-4 text-destructive" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  if (loading) {
    return (
      <Card className="card-enterprise">
        <CardContent className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-enterprise">
      <CardHeader>
        <CardTitle className="text-foreground">Staff Performance</CardTitle>
        <CardDescription>Individual strengths, weaknesses, and key metrics</CardDescription>
      </CardHeader>
      <CardContent>
        {staff.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No team members found
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {staff.map((member) => {
              const skills = getSkills(member);
              const strengths = skills.filter(s => s.isStrength);
              const weaknesses = skills.filter(s => s.isWeakness);

              return (
                <div
                  key={member.user_id}
                  className="p-4 rounded-xl border border-border bg-card/50 hover:bg-card/80 hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={() => onSelectStaff?.(member.user_id, member.full_name || 'Unknown')}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {member.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {member.full_name || 'Unknown'}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getScoreColor(member.avg_overall_score)}`}>
                          {Math.round(member.avg_overall_score)}
                        </span>
                        {getTrendIcon(member.avg_overall_score)}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold text-foreground">{member.total_calls}</p>
                      <p className="text-xs text-muted-foreground">Calls</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className={`text-lg font-bold ${member.win_rate >= 50 ? 'text-success' : 'text-destructive'}`}>
                        {member.win_rate}%
                      </p>
                      <p className="text-xs text-muted-foreground">Win Rate</p>
                    </div>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="space-y-3">
                    {/* Strengths */}
                    {strengths.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-success mb-1.5 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Strengths
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {strengths.map((skill) => (
                            <Badge 
                              key={skill.name} 
                              variant="outline" 
                              className="text-xs border-success/30 bg-success/10 text-success"
                            >
                              <skill.icon className="h-3 w-3 mr-1" />
                              {skill.name} ({Math.round(skill.score)})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {weaknesses.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-destructive mb-1.5 flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" />
                          Needs Improvement
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {weaknesses.map((skill) => (
                            <Badge 
                              key={skill.name} 
                              variant="outline" 
                              className="text-xs border-destructive/30 bg-destructive/10 text-destructive"
                            >
                              <skill.icon className="h-3 w-3 mr-1" />
                              {skill.name} ({Math.round(skill.score)})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skill Bars */}
                    <div className="space-y-1.5 pt-2">
                      {skills.slice(0, 3).map((skill) => (
                        <div key={skill.name} className="flex items-center gap-2">
                          <skill.icon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground w-16 truncate">{skill.name}</span>
                          <Progress value={skill.score} className="flex-1 h-1.5" />
                          <span className="text-xs font-medium w-6 text-right">{Math.round(skill.score)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
