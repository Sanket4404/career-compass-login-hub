
import { supabase } from '@/lib/supabase';
import { CareerAssessment } from '@/lib/supabase';

export const careerService = {
  // Save a new career assessment for a user
  async saveAssessment(assessment: Omit<CareerAssessment, 'id'>) {
    try {
      const { data, error } = await supabase
        .from('career_assessments')
        .insert([assessment])
        .select();

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error saving assessment:', error);
      return { data: null, error };
    }
  },

  // Get all career assessments for a specific user
  async getUserAssessments(userId: string) {
    try {
      const { data, error } = await supabase
        .from('career_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('assessment_date', { ascending: false });

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error getting user assessments:', error);
      return { data: null, error };
    }
  },

  // Get a specific career assessment by ID
  async getAssessmentById(assessmentId: string) {
    try {
      const { data, error } = await supabase
        .from('career_assessments')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error getting assessment:', error);
      return { data: null, error };
    }
  },
};
