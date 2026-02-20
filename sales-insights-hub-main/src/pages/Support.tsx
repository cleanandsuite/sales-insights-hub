import { useState, useRef, useEffect, useCallback } from 'react';
import { StaticPageHeader } from '@/components/layout/StaticPageHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MessageCircle, X, Send, Mic, Play, FileText, CreditCard, Shield, Loader2, Bot, User, Mail, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isLowConfidence?: boolean;
}

const faqData = {
  recording: [
    {
      question: "How do I start recording a call?",
      answer: "Navigate to the Dashboard and click the 'Record Call' button. You can record directly from your browser using your microphone. Make sure to grant microphone permissions when prompted."
    },
    {
      question: "What audio formats are supported for upload?",
      answer: "SellSig supports MP3, WAV, M4A, and WebM audio formats. Files up to 500MB can be uploaded for analysis."
    },
    {
      question: "Can I record calls on mobile devices?",
      answer: "Yes! SellSig is fully responsive and works on mobile browsers. For best results, use Chrome or Safari on your mobile device."
    },
    {
      question: "How long can my recordings be?",
      answer: "There's no strict time limit on recordings. However, for optimal analysis quality, we recommend keeping recordings under 2 hours."
    },
    {
      question: "Are my recordings stored securely?",
      answer: "Yes, all recordings are encrypted at rest and in transit. Only you and authorized team members can access your recordings."
    },
    {
      question: "How do I export recordings?",
      answer: "Go to the Recordings page, select the recording you want to export, and click the download button. You can export the audio file, transcript, or both as a ZIP file."
    }
  ],
  playback: [
    {
      question: "How do I play back my recordings?",
      answer: "Go to the Recordings page, select any recording, and click on it to open the playback interface with waveform visualization and transcript sync."
    },
    {
      question: "Can I skip to specific parts of a recording?",
      answer: "Yes! You can click anywhere on the waveform to jump to that point. You can also click on any transcript line to jump to that moment in the audio."
    },
    {
      question: "What playback speeds are available?",
      answer: "You can adjust playback speed from 0.5x to 2x to listen faster or slower depending on your preference."
    },
    {
      question: "Can I share recordings with my team?",
      answer: "Yes, with an Enterprise plan, you can share recordings with team members and add comments at specific timestamps."
    }
  ],
  transcription: [
    {
      question: "How accurate is the transcription?",
      answer: "Our AI-powered transcription achieves 95%+ accuracy for clear audio in English. Accuracy may vary based on audio quality, accents, and background noise."
    },
    {
      question: "What languages are supported?",
      answer: "Currently, we support English transcription with high accuracy. Additional language support is coming soon."
    },
    {
      question: "How long does transcription take?",
      answer: "Transcription typically completes within 2-5 minutes for a 30-minute recording. Longer recordings may take proportionally more time."
    },
    {
      question: "Can I edit the transcript?",
      answer: "Transcript editing is not currently available, but it's on our roadmap. You can export transcripts and edit them externally."
    },
    {
      question: "What AI analysis is included?",
      answer: "Our AI analyzes calls for key topics, sentiment, pain points, objections, and provides coaching suggestions to improve your sales technique."
    }
  ],
  billing: [
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover) through our secure Stripe payment processor."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time from the Settings page. Your access continues until the end of your current billing period."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! We offer a free trial that includes core features so you can experience SellSig before committing to a paid plan."
    },
    {
      question: "How do I upgrade or downgrade my plan?",
      answer: "Go to Settings > Billing to manage your subscription. Upgrades take effect immediately, while downgrades apply at the next billing cycle."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 14-day money-back guarantee for annual plans. Monthly plans can be cancelled anytime but are non-refundable."
    }
  ],
  security: [
    {
      question: "Is my data encrypted?",
      answer: "Yes, all data is encrypted both at rest (AES-256) and in transit (TLS 1.3). We follow industry best practices for data security."
    },
    {
      question: "Where is my data stored?",
      answer: "Your data is stored in secure, SOC 2 compliant data centers. We use enterprise-grade infrastructure to ensure reliability and security."
    },
    {
      question: "Who can access my recordings?",
      answer: "Only you and team members you explicitly authorize can access your recordings. Our staff cannot access your audio or transcripts without your permission."
    },
    {
      question: "Do you comply with GDPR?",
      answer: "Yes, SellSig is fully GDPR compliant. You can request data export or deletion at any time from your Settings page."
    },
    {
      question: "How do you handle recording consent?",
      answer: "We provide tools to document consent for all recordings. It's your responsibility to comply with local recording consent laws in your jurisdiction."
    }
  ]
};

// Flatten FAQ data for AI context
const getAllFaqContent = () => {
  let content = "";
  Object.entries(faqData).forEach(([category, questions]) => {
    content += `\n\n${category.toUpperCase()} FAQs:\n`;
    questions.forEach(q => {
      content += `Q: ${q.question}\nA: ${q.answer}\n`;
    });
  });
  return content;
};

const categoryIcons = {
  recording: Mic,
  playback: Play,
  transcription: FileText,
  billing: CreditCard,
  security: Shield
};

const categoryTitles = {
  recording: "Recording",
  playback: "Playback",
  transcription: "Transcription",
  billing: "Billing",
  security: "Security"
};

// Generate unique session ID
const generateSessionId = () => {
  return `support_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export default function Support() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketName, setTicketName] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
  const [unresolvedCount, setUnresolvedCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Log chat open event
  const logEvent = useCallback(async (eventType: string, queryText?: string, responseText?: string, wasResolved?: boolean, confidenceScore?: number) => {
    try {
      await supabase.from('support_logs').insert({
        user_id: user?.id || null,
        session_id: sessionId,
        event_type: eventType,
        query_text: queryText,
        response_text: responseText,
        was_resolved: wasResolved,
        confidence_score: confidenceScore,
        metadata: { user_agent: navigator.userAgent }
      });
    } catch (error) {
      console.error('Failed to log support event:', error);
    }
  }, [user?.id, sessionId]);

  // Log chat open when widget opens
  useEffect(() => {
    if (chatOpen) {
      logEvent('chat_open');
    }
  }, [chatOpen, logEvent]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/support-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          faqContext: getAllFaqContent()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let isLowConfidence = false;

      if (reader) {
        // Add empty assistant message that we'll update
        setMessages(prev => [...prev, { role: 'assistant', content: '', isLowConfidence: false }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                const content = data.choices?.[0]?.delta?.content;
                if (content) {
                  assistantContent += content;
                  
                  // Check for low confidence marker
                  if (assistantContent.includes('[LOW_CONFIDENCE]')) {
                    isLowConfidence = true;
                    assistantContent = assistantContent.replace('[LOW_CONFIDENCE]', '').trim();
                  }
                  
                  setMessages(prev => {
                    const newMessages = [...prev];
                    if (newMessages[newMessages.length - 1]?.role === 'assistant') {
                      newMessages[newMessages.length - 1].content = assistantContent.replace('[LOW_CONFIDENCE]', '').trim();
                      newMessages[newMessages.length - 1].isLowConfidence = isLowConfidence;
                    }
                    return newMessages;
                  });
                }
              } catch {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }

      // Log the message and track unresolved
      const confidenceScore = isLowConfidence ? 0.3 : 0.9;
      await logEvent('message_sent', userMessage, assistantContent, !isLowConfidence, confidenceScore);
      
      if (isLowConfidence) {
        setUnresolvedCount(prev => prev + 1);
        await logEvent('unresolved', userMessage, assistantContent, false, confidenceScore);
        
        // Show ticket form prompt after 2 unresolved queries
        if (unresolvedCount >= 1) {
          setShowTicketForm(true);
        }
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I'm having trouble responding right now. Please try again or submit a support ticket below.",
        isLowConfidence: true
      }]);
      setShowTicketForm(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSubmitTicket = async () => {
    if (!ticketName.trim() || !ticketEmail.trim() || !ticketMessage.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide name, email, and message.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingTicket(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-support-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          name: ticketName,
          email: ticketEmail,
          message: ticketMessage,
          sessionId,
          conversationHistory: messages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit ticket');
      }

      toast({
        title: "Ticket submitted!",
        description: "We'll get back to you within 24 hours.",
      });

      setTicketName('');
      setTicketEmail('');
      setTicketMessage('');
      setShowTicketForm(false);
      
    } catch (error) {
      console.error('Ticket submission error:', error);
      toast({
        title: "Submission failed",
        description: "Please try again or email support@sellsig.com directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StaticPageHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Help & Support
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find answers to common questions or chat with our AI assistant for instant help.
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="grid gap-6 md:gap-8 max-w-4xl mx-auto">
          {Object.entries(faqData).map(([category, questions]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons];
            const title = categoryTitles[category as keyof typeof categoryTitles];
            
            return (
              <Card key={category} className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {questions.map((q, index) => (
                      <AccordionItem key={index} value={`${category}-${index}`}>
                        <AccordionTrigger className="text-left text-foreground hover:text-primary">
                          {q.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {q.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Can't find what you're looking for?{' '}
            <a href="mailto:support@sellsig.com" className="text-primary hover:underline">
              Contact our support team
            </a>
          </p>
        </div>
      </main>

      <LandingFooter />

      {/* AI Chat Widget */}
      <div className="fixed bottom-4 right-4 z-50">
        {!chatOpen ? (
          <Button
            onClick={() => setChatOpen(true)}
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        ) : (
          <Card className="w-[350px] md:w-[400px] h-[550px] flex flex-col shadow-2xl border-border">
            {/* Chat Header */}
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <span className="font-semibold text-sm">SellSig Support</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            {/* Chat Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  <Bot className="h-12 w-12 mx-auto mb-3 text-primary/50" />
                  <p className="font-medium">Hi! I'm your SellSig assistant.</p>
                  <p className="mt-1">Ask me anything about recording, transcription, billing, or security.</p>
                </div>
              )}
              {messages.map((msg, index) => (
                <div key={index}>
                  <div
                    className={cn(
                      "flex gap-2",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div className="p-1.5 rounded-full bg-primary/10 h-fit">
                        <Bot className="h-3 w-3 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                        msg.role === 'user'
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {msg.content || (isLoading && index === messages.length - 1 ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null)}
                    </div>
                    {msg.role === 'user' && (
                      <div className="p-1.5 rounded-full bg-muted h-fit">
                        <User className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  {/* Low confidence suggestion */}
                  {msg.role === 'assistant' && msg.isLowConfidence && msg.content && (
                    <div className="ml-8 mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Need more help? <button 
                          onClick={() => setShowTicketForm(true)} 
                          className="underline font-medium hover:text-amber-700"
                        >
                          Submit a support ticket
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Ticket Form */}
            {showTicketForm && (
              <div className="p-3 border-t border-border bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Still need help?</span>
                </div>
                <div className="space-y-2">
                  <Input
                    type="text"
                    value={ticketName}
                    onChange={(e) => setTicketName(e.target.value)}
                    placeholder="Your name"
                    className="text-sm"
                  />
                  <Input
                    type="email"
                    value={ticketEmail}
                    onChange={(e) => setTicketEmail(e.target.value)}
                    placeholder="Your email"
                    className="text-sm"
                  />
                  <Textarea
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Describe your issue..."
                    className="text-sm min-h-[60px]"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSubmitTicket} 
                      disabled={isSubmittingTicket}
                      size="sm"
                      className="flex-1"
                    >
                      {isSubmittingTicket ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Send className="h-4 w-4 mr-1" />
                      )}
                      Submit Ticket
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowTicketForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Input */}
            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your question..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!input.trim() || isLoading}
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
