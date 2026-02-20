/**
 * SellSig - Modern Cloud Phone Hero Section
 * Clean communications platform look
 */

import { useState } from 'react';
import { Phone, PhoneCall, MessageSquare, Mic, MicOff, Volume2, Video, Users, Zap, ArrowRight, Check, Shield, Headphones } from 'lucide-react';

interface HeroSectionProps {
  onStartTrialClick: () => void;
  onWatchDemoClick: () => void;
}

export function HeroSection({ onStartTrialClick, onWatchDemoClick }: HeroSectionProps) {
  const [dialValue, setDialValue] = useState('');
  const [isDialing, setIsDialing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const dialPad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ];

  const handleDial = (digit: string) => {
    setDialValue(prev => prev + digit);
  };

  const handleCall = () => {
    if (dialValue.length > 0) {
      setIsDialing(true);
    }
  };

  const features = [
    { icon: PhoneCall, title: 'Crystal Clear Calls', desc: 'HD voice quality powered by AI noise cancellation' },
    { icon: MessageSquare, title: 'Smart SMS', desc: 'Text with AI-assisted responses and templates' },
    { icon: Users, title: 'Team Collaboration', desc: 'Shared inboxes and presence indicators' },
    { icon: Shield, title: 'Enterprise Security', desc: 'End-to-end encryption and compliance ready' },
  ];

  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Glow Effects */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* LEFT: Copy */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full px-4 py-2 bg-blue-500/10 border border-blue-500/30">
              <Zap className="w-4 h-4 text-blue-400 mr-2" />
              <span className="text-sm font-medium text-blue-300">AI-Powered Business Phone</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              The phone system{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                your team deserves
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-slate-300 max-w-xl">
              Professional cloud phone with AI coaching built in. 
              Close more deals while your team makes every call count.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                    <p className="text-xs text-slate-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onStartTrialClick}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-500 transition-all hover:scale-105 shadow-lg shadow-blue-600/25"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={onWatchDemoClick}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all"
              >
                Watch Demo
              </button>
            </div>

            {/* Trust */}
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex -space-x-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-slate-900" />
                ))}
              </div>
              <span>Join 2,000+ businesses</span>
            </div>
          </div>

          {/* RIGHT: Phone Interface */}
          <div className="relative">
            {/* Main Phone App */}
            <div className="bg-slate-800 rounded-[2.5rem] p-6 shadow-2xl border border-slate-700 max-w-sm mx-auto">
              {/* Phone Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">SellSig</h3>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Online
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                    <Users className="w-4 h-4 text-slate-300" />
                  </button>
                </div>
              </div>

              {/* Dial Display */}
              <div className="bg-slate-900 rounded-2xl p-6 mb-6 min-h-[120px] flex flex-col items-center justify-center">
                {dialValue ? (
                  <div className="text-4xl font-mono text-white tracking-widest">
                    {dialValue}
                  </div>
                ) : (
                  <div className="text-slate-500 text-center">
                    <p className="text-lg">Enter number to call</p>
                  </div>
                )}
                {isDialing && (
                  <div className="mt-4 flex items-center gap-2 text-green-400">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    Connecting...
                  </div>
                )}
              </div>

              {/* Dial Pad */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {dialPad.map((row, rowI) => 
                  row.map((digit, colI) => (
                    <button
                      key={`${rowI}-${colI}`}
                      onClick={() => handleDial(digit)}
                      className="w-16 h-16 rounded-full bg-slate-700 hover:bg-slate-600 text-white text-xl font-medium transition-all hover:scale-105 flex items-center justify-center"
                    >
                      {digit}
                    </button>
                  ))
                )}
              </div>

              {/* Call Actions */}
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500' : 'bg-slate-700 hover:bg-slate-600'}`}
                >
                  {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
                </button>
                
                <button
                  onClick={handleCall}
                  disabled={dialValue.length === 0}
                  className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PhoneCall className="w-8 h-8 text-white" />
                </button>
                
                <button className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-all">
                  <Volume2 className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-center gap-6 mt-6">
                <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-xs">Messages</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
                  <Users className="w-5 h-5" />
                  <span className="text-xs">Contacts</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
                  <Headphones className="w-5 h-5" />
                  <span className="text-xs">History</span>
                </button>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              AI Coaching Active
            </div>
            <div className="absolute -bottom-4 -left-4 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Encrypted
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
