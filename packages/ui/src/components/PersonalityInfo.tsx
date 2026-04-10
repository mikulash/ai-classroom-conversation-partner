import React from 'react';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { LANGUAGE } from '@repo/frontend-utils/src/enums/Language';
import { PersonalityModel } from '@repo/frontend-utils/src/models';

interface PersonalityInfoProps {
    personality: PersonalityModel;
    conversationRole: string;
    connectionStatus?: React.ReactNode;
    className: string;
}

export const PersonalityInfo: React.FC<PersonalityInfoProps> = ({
  personality,
  conversationRole,
  connectionStatus,
  className,
}) => {
  const { t, language } = useTypedTranslation();
  const problemSummary = language === LANGUAGE.EN ? personality.problemSummaryEn : personality.problemSummaryCs;
  const personalityDescription = language === LANGUAGE.EN ? personality.personalityDescriptionEn : personality.personalityDescriptionCs;

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

