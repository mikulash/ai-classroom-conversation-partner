import React from 'react';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { Label } from '@radix-ui/react-label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LANGUAGE } from '@repo/shared/enums/Language';
import { Personality, ScenarioInsert } from '@repo/shared/types/supabase/supabaseTypeHelpers';

interface ScenarioFormProps {
    scenario: ScenarioInsert;
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
        <Label htmlFor="setting_en">{t('admin.scenarios.form.settingEn')}</Label>
        <Textarea
          id="setting_en"
          name="setting_en"
          value={scenario.setting_en ?? ''}
          onChange={onInputChange}
          rows={3}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="setting_cs">{t('admin.scenarios.form.settingCs')}</Label>
        <Textarea
          id="setting_cs"
          name="setting_cs"
          value={scenario.setting_cs ?? ''}
          onChange={onInputChange}
          rows={3}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="situation_description_en">{t('admin.scenarios.form.descriptionEn')}</Label>
        <Textarea
          id="situation_description_en"
          name="situation_description_en"
          value={scenario.situation_description_en ?? ''}
          onChange={onInputChange}
          rows={4}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="situation_description_cs">{t('admin.scenarios.form.descriptionCs')}</Label>
        <Textarea
          id="situation_description_cs"
          name="situation_description_cs"
          value={scenario.situation_description_cs ?? ''}
          onChange={onInputChange}
          rows={4}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="involved_personality_id">{t('admin.scenarios.form.personality')}</Label>
        <Select
          value={
            scenario.involved_personality_id !== null ?
              String(scenario.involved_personality_id) :
              'none'
          }
          onValueChange={(value) => onSelectChange('involved_personality_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('admin.scenarios.form.selectPersonality')}/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t('admin.scenarios.form.none')}</SelectItem>
            {personalities.map((p) => {
              const problemSummary = language == LANGUAGE.EN ? p.problem_summary_en : p.problem_summary_cs;
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
