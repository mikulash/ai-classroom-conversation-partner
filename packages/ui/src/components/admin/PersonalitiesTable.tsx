import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { PersonalityModel } from '@repo/frontend-utils/src/models';

interface PersonalitiesTableProps {
  personalities: PersonalityModel[];
  isProcessing: boolean;
  onEdit: (personality: PersonalityModel) => void;
  onDelete: (id: number) => void;
}

/**
 * Pure presentation table for the personalities admin page.
 * Empty / processing / data states all live in the parent.
 */
export const PersonalitiesTable: React.FC<PersonalitiesTableProps> = ({
  personalities,
  isProcessing,
  onEdit,
  onDelete,
}) => {
  const { t } = useTypedTranslation();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('personalities.name')}</TableHead>
          <TableHead>{t('personalities.gender')}</TableHead>
          <TableHead>{t('personalities.age')}</TableHead>
          <TableHead>{t('personalities.avatar')}</TableHead>
          <TableHead>{t('personalities.problemSummaryEn')}</TableHead>
          <TableHead>{t('personalities.voice')}</TableHead>
          <TableHead className="text-right">{t('common.actions')}</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {personalities.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
              {t('personalities.noPersonalitiesFound')}
            </TableCell>
          </TableRow>
        ) : (
          personalities.map((personality) => (
            <TableRow key={personality.id}>
              <TableCell className="font-medium">{personality.name}</TableCell>
              <TableCell>{personality.gender}</TableCell>
              <TableCell>{personality.age ?? '-'}</TableCell>
              <TableCell>
                <span className={personality.avatarUrl ? 'text-emerald-700' : 'text-muted-foreground'}>
                  {personality.avatarUrl ?
                    t('personalities.avatarAttached') :
                    t('personalities.avatarMissing')}
                </span>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {personality.problemSummaryEn}
              </TableCell>
              <TableCell>{personality.openaiVoiceName}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onEdit(personality);
                    }}
                  >
                    {t('common.edit')}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      onDelete(personality.id);
                    }}
                    disabled={isProcessing}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
