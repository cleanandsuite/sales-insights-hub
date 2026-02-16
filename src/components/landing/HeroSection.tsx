/**
 * SellSig Hero Section - Live Dashboard Style
 * Based on Max's vision: Real-time coaching, outcomes not features
 */

import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Phone, Brain, Zap, ArrowRight, MessageSquare, Target, Clock, Play } from 'lucide-react';

interface HeroSectionProps {
  onStartTrialClick: () => void;
  onWatchDemoClick: () => void;
}

// Simulated AI insights that pop up
const aiInsights = [
  { id: 1, text: "Objection detected: 'Too expensive' → Try ROI calculator", type: 'warning' },
  { id: 2, text: "Great pause! Building rapport score +15%", type: 'success' },
  { id: 3, text: "Competitor mentioned 3x — Have a counter ready", type: 'tip' },
  { id: 4, text: "They're ready to buy. Ask for the close.", type: 'success' },
];

// Live metrics
const liveMetrics = [
  { label: "Active Calls", value: "24", icon: Phone, color: "#2563EB" },
  { label: "Deals Moved", value: "+$2.4M", icon: TrendingUp, color: "#10B981" },
  { label: "Win Rate", value: "34%", icon: Target, color: "#7C3AED", trend: "+8%" },
  { label: "AI Suggestions", value: "156", icon: Brain, color: "#F59E0B" },
];

export function HeroSection({ onStartTrialClick, onWatchDemoClick }: HeroSectionProps) {
  const [activeInsight, setActiveInsight] = useState(aiInsights[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  // Rotate through insights
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnalyzing(true);
      setTimeout(() => {
        setActiveInsight(aiInsights[Math.floor(Math.random() * aiInsights.length)]);
        setIsAnalyzing(false);
      }, 1500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-white min-h-screen overflow-hidden">
      {/* Clean background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT: Copy */}
          <div className="space-y-6 text-center lg:text-left max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full px-4 py-2 border bg-blue-50 border-blue-200">
              <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-semibold text-blue-700">#1 AI Coach for Sales</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Close 30% More Deals{' '}
              <span className="text-blue-600">with Zero Extra Effort</span>
            </h1>

            {/* Subheadline - Sales input */}
            <p className="text-xl text-gray-600">
              Gong analyzes what happened.{' '}
              <strong className="text-gray-900">We coach your reps while it matters.</strong>
            </p>

            {/* Bullet points - Marketing input */}
            <ul className="space-y-3 text-left">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <Zap className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-gray-700">Transform training from a cost center into a measurable advantage</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                  <TrendingUp className="w-3 h-3 text-purple-600" />
                </div>
                <span className="text-gray-700">Report to leadership with concrete metrics — not gut feelings</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                  <Clock className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-gray-700">Sleep well — know exactly which skills are closing deals</span>
              </li>
            </ul>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <button
                onClick={onStartTrialClick}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all hover:scale-105 shadow-lg shadow-blue-600/25"
              >
                Know For Certain
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={onWatchDemoClick}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-full border-2 border-gray-200 hover:border-gray-300 transition-all"
              >
                <Play className="w-5 h-5" />
                See It In Action
              </button>
            </div>

            {/* Trust */}
            <p className="text-sm text-gray-500">
              500+ companies increased close rates by avg 34%
            </p>
          </div>

          {/* RIGHT: Live Dashboard Visual */}
          <div className="relative">
            {/* Dashboard Frame */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gray-900 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-gray-400 text-sm">SellSig — Live Coaching</span>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-4 space-y-4">
                {/* Live Metrics Row */}
                <div className="grid grid-cols-4 gap-2">
                  {liveMetrics.map((metric, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3 text-center">
                      <metric.icon className="w-4 h-4 mx-auto mb-1" style={{ color: metric.color }} />
                      <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                      <p className="text-xs text-gray-500">{metric.label}</p>
                    </div>
                  ))}
                </div>

                {/* Main Dashboard Area */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Call Activity */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-blue-900">Live Call</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">JD</div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">John Davis — Acme Corp</p>
                          <p className="text-xs text-gray-500">$125,000 deal • 12:34</p>
                        </div>
                      </div>
                      {/* Fake transcript */}
                      <div className="bg-white rounded-lg p-2 text-xs text-gray-600 space-y-1">
                        <p><span className="font-medium text-gray-900">Rep:</span> "So compared to our competitor..."</p>
                        <p><span className="font-medium text-gray-900"> prospect:</span> "Honestly, the price is..."</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Insight Card - Product's vision */}
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">AI Coaching</span>
                      {isAnalyzing && (
                        <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                          <span className="animate-pulse">Thinking</span>
                          <span className="flex gap-0.5">
                            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </span>
                        </span>
                      )}
                    </div>
                    
                    {/* The AI Insight Bubble */}
                    <div className={`bg-white rounded-lg p-3 border ${activeInsight.type === 'warning' ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}`}>
                      <p className="text-sm text-gray-800">{activeInsight.text}</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 bg-purple-600 text-white text-xs py-2 rounded-lg font-medium">Insert Response</button>
                      <button className="flex-1 bg-white border border-gray-200 text-gray-700 text-xs py-2 rounded-lg font-medium">Dismiss</button>
                    </div>
                  </div>
                </div>

                {/* Bottom Stats */}
                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">+35%</p>
                    <p className="text-xs text-gray-500">Win Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">2.4x</p>
                    <p className="text-xs text-gray-500">Deal Velocity</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">156</p>
                    <p className="text-xs text-gray-500">Objections Handled</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements - minimal, clean */}
            <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-100">
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live Coaching Active
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
