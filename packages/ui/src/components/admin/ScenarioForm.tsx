import React from 'react';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { Label } from '@radix-ui/react-label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LANGUAGE } from '@repo/shared/enums/Language';
import { ScenarioCreate } from '@repo/shared/types/db/entities';
import { PersonalityModel, ScenarioModel } from '@repo/frontend-utils/src/models';

interface ScenarioFormProps {
    scenario: ScenarioModel | ScenarioCreate;
    personalities: PersonalityModel[];
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
        <Label htmlFor="settingEn" className="flex items-center gap-1">
          {t('admin.scenarios.form.settingEn')} <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="settingEn"
          name="settingEn"
          value={scenario.settingEn ?? ''}
          onChange={onInputChange}
          rows={3}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="settingCs" className="flex items-center gap-1">
          {t('admin.scenarios.form.settingCs')} <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="settingCs"
          name="settingCs"
          value={scenario.settingCs ?? ''}
          onChange={onInputChange}
          rows={3}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="situationDescriptionEn" className="flex items-center gap-1">
          {t('admin.scenarios.form.descriptionEn')} <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="situationDescriptionEn"
          name="situationDescriptionEn"
          value={scenario.situationDescriptionEn ?? ''}
          onChange={onInputChange}
          rows={4}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="situationDescriptionCs" className="flex items-center gap-1">
          {t('admin.scenarios.form.descriptionCs')} <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="situationDescriptionCs"
          name="situationDescriptionCs"
          value={scenario.situationDescriptionCs ?? ''}
          onChange={onInputChange}
          rows={4}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="involvedPersonalityId" className="flex items-center gap-1">
          {t('admin.scenarios.form.personality')} <span className="text-red-500">*</span>
        </Label>
        <Select
          value={
            scenario.involvedPersonalityId !== null ?
              String(scenario.involvedPersonalityId) :
              'none'
          }
          onValueChange={(value) => {
            onSelectChange('involvedPersonalityId', value);
          }}
          required
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
