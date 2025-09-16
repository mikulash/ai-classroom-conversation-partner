import { Scenario } from '@repo/shared/types/supabase/supabaseTypeHelpers';
import React from 'react';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { universalDescriptionForScenario } from '@repo/shared/utils/universalDescriptionMoreLanguages';


interface ScenarioInfoProps {
    scenario: Scenario | null;
}

export const ScenarioInfo: React.FC<ScenarioInfoProps> = ({
  scenario,
}) => {
  const { t, language } = useTypedTranslation();

  if (!scenario) {
    return (
      <div className="flex-1 border border-border rounded-lg p-6 bg-card text-card-foreground">
        <h2 className="text-xl font-semibold mb-2">{t('scenario')}</h2>
        <p className="text-sm">{t('noScenarioSelected')}</p>
      </div>
    );
  }
  const { situationDescription, setting } = universalDescriptionForScenario(scenario, language);

  return (
    <div className="flex-1 border border-border rounded-lg p-6 bg-card text-card-foreground">
      <h2 className="text-xl font-semibold mb-2">{t('scenario')}</h2>
      {setting && <p className="italic text-sm mb-1">{setting}</p>}
      <p className="text-sm whitespace-pre-wrap">
        {situationDescription}
      </p>
    </div>
  );
};
