import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize Supabase client with the environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://efjlmqkkihvsipkffavi.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmamxtcWtraWh2c2lwa2ZmYXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzOTM1MDEsImV4cCI6MjA1Nzk2OTUwMX0.tt8sr6ApBXAoRa9JWq_T3soxuQxEvXvAlBPeo_IMZ2U';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Tab history interfaces
export interface TabHistory {
  id?: string;
  tab_id: string;
  content: any;
  title: string;
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
