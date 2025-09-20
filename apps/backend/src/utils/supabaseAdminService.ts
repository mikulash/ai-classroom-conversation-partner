import { supabaseAdmin } from '../clients/supabase';
import { ModelOptions } from '@repo/shared/types/modelSelection';

export const fetchAppConfig = async () => {
  const { data: app_config, error } = await supabaseAdmin
    .from('app_config')
    .select(`*`).single();
  if (error || !app_config) {
    throw new Error(`Supabase App Config error: ${error.message}`);
  }
  return app_config;
};

export const fetchModelOptions = async () => {
  const { data: responseModels, error: responseModelsError } = await supabaseAdmin
    .from('response_models')
    .select('*');
  const { data: ttsModels, error: ttsModelsError } = await supabaseAdmin
    .from('tts_models')
    .select('*');
  const { data: realtimeModels, error: realtimeModelsError } = await supabaseAdmin
    .from('realtime_models')
    .select('*');
  const { data: realtimeTranscriptionModels, error: realtimeTranscriptionModelsError } = await supabaseAdmin
    .from('realtime_transcription_models')
    .select('*');
  const { data: timestampedTranscriptionModels, error: timestampedTranscriptionModelsError } = await supabaseAdmin
    .from('timestamped_transcription_models')
    .select('*');

  if (responseModelsError || ttsModelsError || realtimeModelsError || realtimeTranscriptionModelsError || timestampedTranscriptionModelsError) {
    const errorMessages = [
      responseModelsError?.message,
      ttsModelsError?.message,
      realtimeModelsError?.message,
      realtimeTranscriptionModelsError?.message,
      timestampedTranscriptionModelsError?.message,
    ].filter(Boolean).join('; ');
    throw new Error(`Supabase Model Options error: ${errorMessages}`);
  }
  const model_options: ModelOptions = {
    responseModels,
    ttsModels,
    realtimeModels,
    timestampedTranscriptionModels,
    realtimeTranscriptionModels,
  };

  return model_options;
};

export const fetchUserCustomModelConfig = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('admin_users_custom_model_selection')
    .select('*')
    .eq('user_id', userId)
    .single();


  if (error || !data) {
    console.warn('Could not fetch user model config:', error);
    return null;
  }
  return data;
};

