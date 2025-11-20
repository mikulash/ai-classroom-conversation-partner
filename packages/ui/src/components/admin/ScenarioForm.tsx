import React from 'react';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { Label } from '@radix-ui/react-label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LANGUAGE } from '@repo/shared/enums/Language';
import { Personality, Scenario, ScenarioCreate } from '@repo/shared/types/db/entities';

interface ScenarioFormProps {
    scenario: Scenario | ScenarioCreate;
    personalities: Personality[];
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onSelectChange: (field: string, value: string) => void;
}

export const ScenarioForm: React.FC<ScenarioFormProps> = ({
  scenario,
  personalities,
  onInputChange,
  onSelectChange,
}) => {
  const { t, language } = useTypedTranslation();

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="settingEn">{t('admin.scenarios.form.settingEn')}</Label>
        <Textarea
          id="settingEn"
          name="settingEn"
          value={scenario.settingEn ?? ''}
          onChange={onInputChange}
          rows={3}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="settingCs">{t('admin.scenarios.form.settingCs')}</Label>
        <Textarea
          id="settingCs"
          name="settingCs"
          value={scenario.settingCs ?? ''}
          onChange={onInputChange}
          rows={3}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="situationDescriptionEn">{t('admin.scenarios.form.descriptionEn')}</Label>
        <Textarea
          id="situationDescriptionEn"
          name="situationDescriptionEn"
          value={scenario.situationDescriptionEn ?? ''}
          onChange={onInputChange}
          rows={4}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="situationDescriptionCs">{t('admin.scenarios.form.descriptionCs')}</Label>
        <Textarea
          id="situationDescriptionCs"
          name="situationDescriptionCs"
          value={scenario.situationDescriptionCs ?? ''}
          onChange={onInputChange}
          rows={4}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="involvedPersonalityId">{t('admin.scenarios.form.personality')}</Label>
        <Select
          value={
            scenario.involvedPersonalityId !== null ?
              String(scenario.involvedPersonalityId) :
              'none'
          }
          onValueChange={(value) => {
            onSelectChange('involvedPersonalityId', value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('admin.scenarios.form.selectPersonality')}/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t('admin.scenarios.form.none')}</SelectItem>
            {personalities.map((p) => {
              const problemSummary = language == LANGUAGE.EN ? p.problemSummaryEn : p.problemSummaryCs;
              return (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name} – {problemSummary}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
