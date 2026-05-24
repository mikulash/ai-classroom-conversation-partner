import React from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { LANGUAGE } from '@repo/frontend-utils/src/enums/Language';
import { PersonalityModel } from '@repo/frontend-utils/src/models';

export const scenarioFormSchema = z.object({
  settingEn: z.string().trim().min(1),
  settingCs: z.string().trim().min(1),
  situationDescriptionEn: z.string().trim().min(1),
  situationDescriptionCs: z.string().trim().min(1),
  involvedPersonalityId: z
    .string()
    .refine((v) => v !== '' && v !== 'none', { message: 'required' }),
});

export type ScenarioFormValues = z.infer<typeof scenarioFormSchema>;

export const EMPTY_SCENARIO_FORM_VALUES: ScenarioFormValues = {
  settingEn: '',
  settingCs: '',
  situationDescriptionEn: '',
  situationDescriptionCs: '',
  involvedPersonalityId: 'none',
};

interface ScenarioFormProps {
  personalities: PersonalityModel[];
}

export const ScenarioForm: React.FC<ScenarioFormProps> = ({ personalities }) => {
  const { t, language } = useTypedTranslation();
  const form = useFormContext<ScenarioFormValues>();

  return (
    <div className="grid gap-4">
      <FormField
        control={form.control}
        name="settingEn"
        render={({ field }) => (
          <FormItem className="grid gap-2">
            <FormLabel className="flex items-center gap-1">
              {t('admin.scenarios.form.settingEn')} <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Textarea rows={3} {...field} />
            </FormControl>
            <FormMessage/>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="settingCs"
        render={({ field }) => (
          <FormItem className="grid gap-2">
            <FormLabel className="flex items-center gap-1">
              {t('admin.scenarios.form.settingCs')} <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Textarea rows={3} {...field} />
            </FormControl>
            <FormMessage/>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="situationDescriptionEn"
        render={({ field }) => (
          <FormItem className="grid gap-2">
            <FormLabel className="flex items-center gap-1">
              {t('admin.scenarios.form.descriptionEn')} <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Textarea rows={4} {...field} />
            </FormControl>
            <FormMessage/>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="situationDescriptionCs"
        render={({ field }) => (
          <FormItem className="grid gap-2">
            <FormLabel className="flex items-center gap-1">
              {t('admin.scenarios.form.descriptionCs')} <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Textarea rows={4} {...field} />
            </FormControl>
            <FormMessage/>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="involvedPersonalityId"
        render={({ field }) => (
          <FormItem className="grid gap-2">
            <FormLabel className="flex items-center gap-1">
              {t('admin.scenarios.form.personality')} <span className="text-red-500">*</span>
            </FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.scenarios.form.selectPersonality')}/>
                </SelectTrigger>
              </FormControl>
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
            <FormMessage/>
          </FormItem>
        )}
      />
    </div>
  );
};
