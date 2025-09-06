import { supabaseAdmin } from '../clients/supabase';
import { CustomModelSelection } from '@repo/shared/types/supabase/supabaseTypeHelpers';

export async function getUserCustomModelConfig(userId: string): Promise<CustomModelSelection | null> {
  if (!userId) return null;

  try {
    const { data, error } = await supabaseAdmin
      .from('admin_users_custom_model_selection')
      .select('*')
      .eq('user_id', userId);


    if (error || !data || data.length === 0) {
      console.warn('Could not fetch user model config:', error);
      return null;
    }

    return data[0];
  } catch (error) {
    console.error('Error in getUserCustomModelConfig:', error);
    return null;
  }
}
