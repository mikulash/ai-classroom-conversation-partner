import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import {
  Scenario,
  ScenarioInsert,
  universalDescriptionForScenario,
} from '@repo/shared/types/supabase/supabaseTypeHelpers';

interface ScenariosTableProps {
    scenarios: Scenario[];
    isProcessing: boolean;
    onEdit: (scenario: ScenarioInsert) => void;
    onDelete: (id: number) => void;
    getPersonalityName: (id: number | null) => string;
}

export const ScenariosTable: React.FC<ScenariosTableProps> = ({
  scenarios,
  isProcessing,
  onEdit,
  onDelete,
  getPersonalityName,
}) => {
  const { t, language } = useTypedTranslation();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('admin.scenarios.table.setting')}</TableHead>
          <TableHead>{t('admin.scenarios.table.description')}</TableHead>
          <TableHead>{t('admin.scenarios.table.personality')}</TableHead>
          <TableHead className="text-right">{t('admin.scenarios.table.actions')}</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {scenarios.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
              {t('admin.scenarios.noScenarios')}
            </TableCell>
          </TableRow>
        ) : (
          scenarios.map((s) => {
            const { situationDescription, setting } = universalDescriptionForScenario(s, language);
            return (
              <TableRow key={s.id}>
                <TableCell className="max-w-xs truncate">{setting}</TableCell>
                <TableCell className="max-w-xs truncate">{situationDescription}</TableCell>
                <TableCell>{getPersonalityName(s.involved_personality_id)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(s)}>
                      {t('admin.scenarios.edit')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(s.id)}
                      disabled={isProcessing}
                    >
                      {t('admin.scenarios.delete')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};
