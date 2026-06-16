import React from 'react';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { universalDescriptionForScenario } from '../lib/universalDescriptionMoreLanguages';
import { ScenarioModel } from '@repo/frontend-utils/src/models';


interface ScenarioInfoProps {
    scenario: ScenarioModel | null;
}

export const ScenarioInfo: React.FC<ScenarioInfoProps> = ({
  scenario,
}) => {
  const { t, language } = useTypedTranslation();

  if (!scenario) {
    return (
      <div className="flex-1 border-2 rounded-lg p-6 bg-muted/50">
        <h2 className="text-xl font-semibold mb-2">{t('common.scenario')}</h2>
        <p className="text-sm">{t('scenarios.noneSelected')}</p>
      </div>
    );
  }
  const { situationDescription, setting } = universalDescriptionForScenario(scenario, language);

  return (
    <div className="flex-1 border-2 rounded-lg p-6 bg-muted/50">
      <h2 className="text-xl font-semibold mb-2">{t('common.scenario')}</h2>
      {setting && <p className="italic text-sm mb-1">{setting}</p>}
      <p className="text-sm whitespace-pre-wrap">
        {situationDescription}
      </p>
    </div>
  );
};
