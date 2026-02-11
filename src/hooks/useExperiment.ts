import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Generate or retrieve visitor ID from localStorage
const getVisitorId = (): string => {
  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
};

interface Variant {
  id: string;
  name: string;
  weight: number;
  is_control: boolean;
  config: unknown;
}

interface ExperimentAssignment {
  experimentId: string;
  variantId: string;
  variantName: string;
  isControl: boolean;
  config: Record<string, unknown>;
}

// Weighted random selection
const selectVariant = (variants: Variant[]): Variant => {
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const variant of variants) {
    random -= variant.weight;
    if (random <= 0) return variant;
  }
  
  return variants[0];
};

// A/B Testing disabled - always return control/control behavior
export function useExperiment(experimentName: string) {
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<ExperimentAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const visitorId = getVisitorId();

  const assignVariant = useCallback(async () => {
    // Always return control - A/B testing disabled
    const controlAssignment: ExperimentAssignment = {
      experimentId: experimentName,
      variantId: 'control',
      variantName: 'Control',
      isControl: true,
      config: {},
    };

    setAssignment(controlAssignment);
    setLoading(false);
    return;

    /*
    Original A/B testing code (disabled):
    try {
    try {
      setLoading(true);
      setError(null);

      // Check for cached assignment
      const cacheKey = `exp_${experimentName}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is still valid (24 hours)
        if (parsed.timestamp > Date.now() - 24 * 60 * 60 * 1000) {
          setAssignment(parsed.assignment);
          setLoading(false);
          return;
        }
      }

      // Fetch experiment
      const { data: experiment, error: expError } = await supabase
        .from('experiments')
        .select('id, traffic_percentage')
        .eq('name', experimentName)
        .eq('status', 'running')
        .single();

      if (expError || !experiment) {
        setLoading(false);
        return; // Experiment not running
      }

      // Check traffic allocation
      if (Math.random() * 100 > experiment.traffic_percentage) {
        setLoading(false);
        return; // User not in experiment traffic
      }

      // Check existing assignment
      const { data: existingAssignment } = await supabase
        .from('experiment_assignments')
        .select(`
          id,
          variant_id,
          experiment_variants (id, name, is_control, config)
        `)
        .eq('experiment_id', experiment.id)
        .eq('visitor_id', visitorId)
        .single();

      if (existingAssignment?.experiment_variants) {
        const variant = existingAssignment.experiment_variants as unknown as Variant;
        const assignmentData: ExperimentAssignment = {
          experimentId: experiment.id,
          variantId: variant.id,
          variantName: variant.name,
          isControl: variant.is_control,
          config: variant.config as Record<string, unknown>,
        };
        setAssignment(assignmentData);
        localStorage.setItem(cacheKey, JSON.stringify({
          assignment: assignmentData,
          timestamp: Date.now(),
        }));
        setLoading(false);
        return;
      }

      // Fetch variants and assign
      const { data: variants, error: varError } = await supabase
        .from('experiment_variants')
        .select('id, name, weight, is_control, config')
        .eq('experiment_id', experiment.id);

      if (varError || !variants || variants.length === 0) {
        setLoading(false);
        return;
      }

      const selectedVariant = selectVariant(variants as Variant[]);

      // Create assignment
      const { error: assignError } = await supabase
        .from('experiment_assignments')
        .insert([{
          experiment_id: experiment.id,
          variant_id: selectedVariant.id,
          visitor_id: visitorId,
          user_id: user?.id || null,
        }]);

      if (assignError) {
        console.error('Assignment error:', assignError);
      }

      const assignmentData: ExperimentAssignment = {
        experimentId: experiment.id,
        variantId: selectedVariant.id,
        variantName: selectedVariant.name,
        isControl: selectedVariant.is_control,
        config: selectedVariant.config as Record<string, unknown>,
      };

      setAssignment(assignmentData);
      localStorage.setItem(cacheKey, JSON.stringify({
        assignment: assignmentData,
        timestamp: Date.now(),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [experimentName, visitorId, user?.id]);

  useEffect(() => {
    assignVariant();
  }, [assignVariant]);

  return {
    assignment,
    variant: assignment?.variantName || null,
    isControl: assignment?.isControl ?? true,
    config: assignment?.config || {},
    loading,
    error,
    visitorId,
  };
}

/*
Original A/B testing code (disabled for now):

try {
      setLoading(true);
      setError(null);

      // Check for cached assignment
      const cacheKey = `exp_${experimentName}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is still valid (24 hours)
        if (parsed.timestamp > Date.now() - 24 * 60 * 60 * 1000) {
          setAssignment(parsed.assignment);
          setLoading(false);
          return;
        }
      }

      // Fetch experiment
      const { data: experiment, error: expError } = await supabase
        .from('experiments')
        .select('id, traffic_percentage')
        .eq('name', experimentName)
        .eq('status', 'running')
        .single();

      if (expError || !experiment) {
        setLoading(false);
        return; // Experiment not running
      }

      // Check traffic allocation
      if (Math.random() * 100 > experiment.traffic_percentage) {
        setLoading(false);
        return; // User not in experiment traffic
      }

      // Check existing assignment
      const { data: existingAssignment } = await supabase
        .from('experiment_assignments')
        .select(`
          id,
          variant_id,
          experiment_variants (id, name, is_control, config)
        `)
        .eq('experiment_id', experiment.id)
        .eq('visitor_id', visitorId)
        .single();

      if (existingAssignment?.experiment_variants) {
        const variant = existingAssignment.experiment_variants as unknown as Variant;
        const assignmentData: ExperimentAssignment = {
          experimentId: experiment.id,
          variantId: variant.id,
          variantName: variant.name,
          isControl: variant.is_control,
          config: variant.config as Record<string, unknown>,
        };
        setAssignment(assignmentData);
        localStorage.setItem(cacheKey, JSON.stringify({
          assignment: assignmentData,
          timestamp: Date.now(),
        }));
        setLoading(false);
        return;
      }

      // Fetch variants and assign
      const { data: variants, error: varError } = await supabase
        .from('experiment_variants')
        .select('id, name, weight, is_control, config')
        .eq('experiment_id', experiment.id);

      if (varError || !variants || variants.length === 0) {
        setLoading(false);
        return;
      }

      const selectedVariant = selectVariant(variants as Variant[]);

      // Create assignment
      const { error: assignError } = await supabase
        .from('experiment_assignments')
        .insert([{
          experiment_id: experiment.id,
          variant_id: selectedVariant.id,
          visitor_id: visitorId,
          user_id: user?.id || null,
        }]);

      if (assignError) {
        console.error('Assignment error:', assignError);
      }

      const assignmentData: ExperimentAssignment = {
        experimentId: experiment.id,
        variantId: selectedVariant.id,
        variantName: selectedVariant.name,
        isControl: selectedVariant.is_control,
        config: selectedVariant.config as Record<string, unknown>,
      };

      setAssignment(assignmentData);
      localStorage.setItem(cacheKey, JSON.stringify({
        assignment: assignmentData,
        timestamp: Date.now(),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [experimentName, visitorId, user?.id]);

  useEffect(() => {
    assignVariant();
  }, [assignVariant]);

  return {
    assignment,
    variant: assignment?.variantName || null,
    isControl: assignment?.isControl ?? true,
    config: assignment?.config || {},
    loading,
    error,
    visitorId,
  };
}
*/

export { getVisitorId };
