// Smart Coaching Engine v3 - Production Ready
// SellSig AI Sales Coaching

export type SalesStage = 'OPENING' | 'DISCOVERY' | 'QUALIFICATION' | 'PRESENTATION' | 'OBJECTION' | 'CLOSE';
export type MomentType = 'BUDGET' | 'TIMELINE' | 'COMPETITOR' | 'OBJECTION' | 'DECISION' | 'PAIN' | 'SILENCE';
export type EngagementLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type CoachStyle = 'sellsig' | 'cardone' | 'belfort' | 'highticket' | 'neutral';

interface CoachingMoment {
  type: MomentType;
  confidence: number;
  importance: number;
  timestamp: number;
}

interface CoachingTip {
  message: string;
  coachStyle: CoachStyle;
  stage: SalesStage;
  moment: MomentType;
  timestamp: number;
}

// Coach Brain Responses - Template-based for real-time speed
const COACH_RESPONSES: Record<CoachStyle, Record<MomentType, string>> = {
  sellsig: {
    BUDGET: "Let's understand the budget constraint. What would make this work for you?",
    TIMELINE: "Timing is important. What's driving this timeline?",
    COMPETITOR: "Curious what you like about them. What would you change?",
    OBJECTION: "I hear that concern. Let's explore it further.",
    DECISION: "Great progress. Let's confirm the next steps.",
    PAIN: "That sounds frustrating. How can we help solve that?",
    SILENCE: "It sounds like you're thinking this through. What's top of mind?"
  },
  cardone: {
    BUDGET: "Budget is a challenge we can overcome! Here's how others made it work...",
    TIMELINE: "Great urgency! Let's move fast on this.",
    COMPETITOR: "They're good, but we have something they don't!",
    OBJECTION: "That's actually a good concern - let's turn this into a positive!",
    DECISION: "This is it! Let's close this deal NOW!",
    PAIN: "We've helped hundreds with this exact pain point!",
    SILENCE: "Hey, let's keep the energy up! What's exciting about this?"
  },
  belfort: {
    BUDGET: "What's the REAL budget constraint here?",
    TIMELINE: "If you could solve this today, would you?",
    COMPETITOR: "What do they NOT have that we do?",
    OBJECTION: "But beyond that, what's really stopping you?",
    DECISION: "You said you want this. What's the final answer?",
    PAIN: "How long has this cost you? What's it worth to solve?",
    SILENCE: "You're hesitating. What's the real concern?"
  },
  highticket: {
    BUDGET: "This is an investment in your company's future. Let me show the ROI.",
    TIMELINE: "The cost of waiting is higher than the investment.",
    COMPETITOR: "Our enterprise clients have switched from them for specific reasons.",
    OBJECTION: "That's a fair concern. Let me address it directly.",
    DECISION: "This is a strategic decision. Let's make it happen.",
    PAIN: "This pain will only cost more over time. Here's the solution.",
    SILENCE: "Take your time. This is an important decision."
  },
  neutral: {
    BUDGET: "Let's discuss budget options that could work.",
    TIMELINE: "What's your ideal timeline?",
    COMPETITOR: "What are you comparing?",
    OBJECTION: "Let's address that concern.",
    DECISION: "What are the next steps?",
    PAIN: "Tell me more about that challenge.",
    SILENCE: "What are you thinking about?"
  }
};

// Importance ratings
const MOMENT_IMPORTANCE: Record<MomentType, number> = {
  BUDGET: 5,
  DECISION: 5,
  COMPETITOR: 4,
  PAIN: 4,
  OBJECTION: 3,
  TIMELINE: 3,
  SILENCE: 4
};

export class SmartCoachingEngine {
  private coachStyle: CoachStyle = 'neutral';
  private currentStage: SalesStage = 'OPENING';
  private engagement: EngagementLevel = 'MEDIUM';
  private lastTipTime: number = 0;
  private tipsThisCall: number = 0;
  private callStartTime: number = 0;
  private stageStartTime: number = 0;
  private engagementScore: number = 5;

  // Configuration
  private cooldownMs: number = 20000; // 20 seconds
  private maxTipsPerCall: number = 5;
  private confidenceThreshold: number = 80;
  private importanceThreshold: number = 4;

  constructor(coachStyle: CoachStyle = 'neutral') {
    this.coachStyle = coachStyle;
  }

  setCoachStyle(style: CoachStyle): void {
    this.coachStyle = style;
  }

  startCall(): void {
    this.currentStage = 'OPENING';
    this.engagement = 'MEDIUM';
    this.lastTipTime = 0;
    this.tipsThisCall = 0;
    this.callStartTime = Date.now();
    this.stageStartTime = Date.now();
    this.engagementScore = 5;
  }

  // Process transcript and determine if coaching needed
  processTranscript(text: string, speaker: 'rep' | 'customer'): CoachingTip | null {
    const now = Date.now();
    
    // Update engagement based on speaker
    if (speaker === 'customer') {
      this.updateEngagement(text);
    }

    // Check cooldowns
    if (now - this.lastTipTime < this.cooldownMs) {
      return null;
    }

    // Check max tips
    if (this.tipsThisCall >= this.maxTipsPerCall) {
      return null;
    }

    // Detect moments
    const moment = this.detectMoment(text);
    if (!moment) {
      return null;
    }

    // Apply dual-threshold filter
    if (moment.confidence < this.confidenceThreshold || 
        moment.importance < this.importanceThreshold) {
      return null;
    }

    // Check if should coach based on engagement
    if (this.shouldCoach(moment)) {
      const tip = this.generateTip(moment);
      this.lastTipTime = now;
      this.tipsThisCall++;
      return tip;
    }

    return null;
  }

  private detectMoment(text: string): CoachingMoment | null {
    const lower = text.toLowerCase();
    
    // Budget triggers
    if (lower.match(/budget|afford|expensive|cost|price|cheap/i)) {
      return { type: 'BUDGET', confidence: 85, importance: MOMENT_IMPORTANCE.BUDGET, timestamp: Date.now() };
    }
    
    // Timeline triggers
    if (lower.match(/timeline|asap|deadline|when|soon|urgently/i)) {
      return { type: 'TIMELINE', confidence: 80, importance: MOMENT_IMPORTANCE.TIMELINE, timestamp: Date.now() };
    }
    
    // Competitor triggers
    if (lower.match(/competitor|alternative|gong|chorus|jiminny|using|looking at/i)) {
      return { type: 'COMPETITOR', confidence: 90, importance: MOMENT_IMPORTANCE.COMPETITOR, timestamp: Date.now() };
    }
    
    // Objection triggers
    if (lower.match(/but|concern|worry|not sure|hesitant|issue|problem/i)) {
      return { type: 'OBJECTION', confidence: 75, importance: MOMENT_IMPORTANCE.OBJECTION, timestamp: Date.now() };
    }
    
    // Decision triggers
    if (lower.match(/ready|forward|sign|approve|decision|green light/i)) {
      return { type: 'DECISION', confidence: 90, importance: MOMENT_IMPORTANCE.DECISION, timestamp: Date.now() };
    }
    
    // Pain triggers
    if (lower.match(/struggling|frustrated|broken|inefficient|time consuming|manual|chaos/i)) {
      return { type: 'PAIN', confidence: 80, importance: MOMENT_IMPORTANCE.PAIN, timestamp: Date.now() };
    }

    return null;
  }

  private updateEngagement(text: string): void {
    const lower = text.toLowerCase();
    let score = 0;
    
    // Questions indicate engagement
    const questionCount = (text.match(/\?/g) || []).length;
    score += Math.min(questionCount * 2, 6);
    
    // Positive language
    if (lower.match(/love|great|perfect|yes|agree|exactly/i)) {
      score += 3;
    }
    
    // Negative / hesitation
    if (lower.match(/um|uh|i don't know|maybe|perhaps/i)) {
      score -= 2;
    }

    this.engagementScore = Math.max(0, Math.min(10, score));
    
    if (this.engagementScore >= 7) this.engagement = 'HIGH';
    else if (this.engagementScore >= 4) this.engagement = 'MEDIUM';
    else this.engagement = 'LOW';
  }

  private shouldCoach(moment: CoachingMoment): boolean {
    // High engagement + important moment = stay quiet (they're doing fine)
    if (this.engagement === 'HIGH' && moment.importance < 5) {
      return false;
    }
    
    // Low engagement = coach
    if (this.engagement === 'LOW') {
      return true;
    }
    
    // Decision moments = always coach if not high engagement
    if (moment.type === 'DECISION' && this.engagement !== 'HIGH') {
      return true;
    }
    
    // Budget at medium engagement
    if (moment.type === 'BUDGET' && this.engagement === 'MEDIUM') {
      return true;
    }

    return false;
  }

  private generateTip(moment: CoachingMoment): CoachingTip {
    // Transition stage if needed
    this.checkStageTransition(moment);

    const message = COACH_RESPONSES[this.coachStyle][moment.type] || 
                   "Let's continue with the call.";
    
    return {
      message,
      coachStyle: this.coachStyle,
      stage: this.currentStage,
      moment: moment.type,
      timestamp: Date.now()
    };
  }

  private checkStageTransition(moment: CoachingMoment): void {
    const timeInStage = Date.now() - this.stageStartTime;
    const stageDurationMs = 3 * 60 * 1000; // 3 minutes per stage minimum

    // Auto-advance stage after enough time
    if (timeInStage > stageDurationMs) {
      const stages: SalesStage[] = ['OPENING', 'DISCOVERY', 'QUALIFICATION', 'PRESENTATION', 'OBJECTION', 'CLOSE'];
      const currentIndex = stages.indexOf(this.currentStage);
      
      if (currentIndex < stages.length - 1) {
        // Certain moments indicate stage progression
        if (moment.type === 'DECISION' && currentIndex < 4) {
          this.currentStage = stages[currentIndex + 1];
          this.stageStartTime = Date.now();
        }
      }
    }
  }

  getState() {
    return {
      stage: this.currentStage,
      engagement: this.engagement,
      tipsGiven: this.tipsThisCall,
      callDuration: Date.now() - this.callStartTime
    };
  }

  getCallSummary() {
    return {
      stage: this.currentStage,
      engagement: this.engagement,
      tipsGiven: this.tipsThisCall,
      coachStyle: this.coachStyle
    };
  }
}

// Factory function
export function createCoachingEngine(coachStyle?: CoachStyle): SmartCoachingEngine {
  return new SmartCoachingEngine(coachStyle);
}

export default SmartCoachingEngine;
