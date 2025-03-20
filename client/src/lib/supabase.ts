import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tbzwkdyhsiuyhcseidnv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiendrZHloc2l1eWhjc2VpZG52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMjUxNDgsImV4cCI6MjA1NzkwMTE0OH0.9plsUjuMImDwwsQMlRka-L3m8418UEM0YLzVXkFY0fI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for tab history
export interface TabHistory {
  id?: string;
  tab_id: string;
  content: any;
  title: string;
  created_at?: string;
}

// Types for evaluate history
export interface EvaluateHistory {
  id?: string;
  user_id?: string;
  problem_type: string;
  description: string;
  thinking_process: string;
  expected_outcome: string;
  score?: number;
  feedback?: string;
  strengths?: string[];
  weaknesses?: string[];
  improvements?: string[];
  created_at?: string;
}

// Types for reverse engineering history
export interface ReverseHistory {
  id?: string;
  user_id?: string;
  problem_type: string;
  problem: string;
  solution?: string;
  process?: any[];
  principles?: string[];
  insights?: string[];
  created_at?: string;
}

// Types for verification history
export interface VerifyHistory {
  id?: string;
  user_id?: string;
  problem: string;
  thinking_process: string;
  conclusion: string;
  is_valid?: boolean;
  confidence?: number;
  gaps?: string[];
  alternatives?: string[];
  created_at?: string;
}

// Functions for tab state operations
export async function saveTabHistory(tabId: string, title: string, content: any): Promise<TabHistory | null> {
  try {
    const { data, error } = await supabase
      .from('tab_history')
      .upsert({
        tab_id: tabId,
        title,
        content,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving tab history:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error saving tab history:', error);
    return null;
  }
}

export async function getTabHistory(tabId: string): Promise<TabHistory | null> {
  try {
    const { data, error } = await supabase
      .from('tab_history')
      .select('*')
      .eq('tab_id', tabId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      // If no data found, just return null
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching tab history:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching tab history:', error);
    return null;
  }
}

// Functions for evaluate history
export async function saveEvaluateHistory(evaluateData: EvaluateHistory): Promise<EvaluateHistory | null> {
  try {
    const { data, error } = await supabase
      .from('evaluate_history')
      .insert(evaluateData)
      .select()
      .single();
    
    if (error) {
      console.error('Error saving evaluate history:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error saving evaluate history:', error);
    return null;
  }
}

export async function getEvaluateHistoryList(limit: number = 10): Promise<EvaluateHistory[]> {
  try {
    const { data, error } = await supabase
      .from('evaluate_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching evaluate history:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching evaluate history:', error);
    return [];
  }
}

// Functions for reverse engineering history
export async function saveReverseHistory(reverseData: ReverseHistory): Promise<ReverseHistory | null> {
  try {
    const { data, error } = await supabase
      .from('reverse_history')
      .insert(reverseData)
      .select()
      .single();
    
    if (error) {
      console.error('Error saving reverse history:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error saving reverse history:', error);
    return null;
  }
}

export async function getReverseHistoryList(limit: number = 10): Promise<ReverseHistory[]> {
  try {
    const { data, error } = await supabase
      .from('reverse_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching reverse history:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching reverse history:', error);
    return [];
  }
}

// Functions for verification history
export async function saveVerifyHistory(verifyData: VerifyHistory): Promise<VerifyHistory | null> {
  try {
    const { data, error } = await supabase
      .from('verify_history')
      .insert(verifyData)
      .select()
      .single();
    
    if (error) {
      console.error('Error saving verify history:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error saving verify history:', error);
    return null;
  }
}

export async function getVerifyHistoryList(limit: number = 10): Promise<VerifyHistory[]> {
  try {
    const { data, error } = await supabase
      .from('verify_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching verify history:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching verify history:', error);
    return [];
  }
}