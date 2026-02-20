import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getVisitorId } from '@/hooks/useExperiment';

interface Experiment {
  id: string;
  name: string;
  status: string;
  traffic_percentage: number;
}

interface ExperimentContextType {
  visitorId: string;
  experiments: Experiment[];
  loading: boolean;
  refreshExperiments: () => Promise<void>;
}

const ExperimentContext = createContext<ExperimentContextType | undefined>(undefined);

export function ExperimentProvider({ children }: { children: ReactNode }) {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const visitorId = getVisitorId();

  const refreshExperiments = async () => {
    try {
      const { data, error } = await supabase
        .from('experiments')
        .select('id, name, status, traffic_percentage')
        .eq('status', 'running');

      if (error) throw error;
      setExperiments(data || []);
    } catch (err) {
      console.error('Failed to fetch experiments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshExperiments();
  }, []);

  return (
    <ExperimentContext.Provider value={{ visitorId, experiments, loading, refreshExperiments }}>
      {children}
    </ExperimentContext.Provider>
  );
}

export function useExperimentContext() {
  const context = useContext(ExperimentContext);
  if (!context) {
    throw new Error('useExperimentContext must be used within ExperimentProvider');
  }
  return context;
}
