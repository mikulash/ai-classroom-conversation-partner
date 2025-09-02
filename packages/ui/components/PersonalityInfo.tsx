import React from 'react';
import { Personality } from '@repo/shared/types/supabase/supabaseTypeHelpers';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { LANGUAGE } from '@repo/shared/enums/Language';

interface PersonalityInfoProps {
    personality: Personality;
    conversationRole: string;
    connectionStatus?: React.ReactNode;
    className?: string;
}

export const PersonalityInfo: React.FC<PersonalityInfoProps> = ({
  personality,
  conversationRole,
  connectionStatus,
  className = 'border-2 border-gray-400 rounded-lg p-6',
}) => {
  const { t, language } = useTypedTranslation();
  const problemSummary = language === LANGUAGE.EN? personality.problem_summary_en : personality.problem_summary_cs;
  const personalityDescription = language === LANGUAGE.EN? personality.personality_description_en : personality.personality_description_cs;

  return (
    <div className={className}>
      <h2 className="text-2xl mb-4">
        {personality.name} ({personality.age} {t('yearsOld')})
      </h2>
      <p className="text-xl font-semibold mb-2">
        {t('problem')}: {problemSummary}
      </p>
      <p className="mb-4">{personalityDescription}</p>
      <p className="text-lg font-medium">
        {t('yourRole')}: <span className="font-bold">{conversationRole}</span>
      </p>

      {connectionStatus}
    </div>
  );
};

