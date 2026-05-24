import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { useConfirm } from '../../hooks/useConfirm';
import {
  useDeletePersonality,
  usePersonalities,
} from '../../hooks/queries/usePersonalities';
import { PersonalityModel } from '@repo/frontend-utils/src/models';
import { PersonalitiesTable } from '../../components/admin/PersonalitiesTable';
import { PersonalityFormDialog } from '../../components/admin/PersonalityFormDialog';

type DialogState =
  | { open: false }
  | { open: true; personality: PersonalityModel | null };

const CLOSED: DialogState = { open: false };

export function AdminPersonalitiesPage() {
  const { t } = useTypedTranslation();
  const confirm = useConfirm();

  const personalitiesQuery = usePersonalities();
  const personalities = personalitiesQuery.data ?? [];
  const deletePersonality = useDeletePersonality();

  const [dialog, setDialog] = useState<DialogState>(CLOSED);

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: t('personalities.confirmDelete'),
      confirmLabel: t('actions.delete', 'Delete'),
      cancelLabel: t('actions.cancel', 'Cancel'),
      destructive: true,
    });
    if (!ok) return;

    try {
      await deletePersonality.mutateAsync(id);
      toast.success(t('personalities.deleteSuccess'));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      toast.error(t('personalities.deleteFailed'), { description: message });
    }
  };

  if (personalitiesQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="text-muted-foreground">{t('common.loading')}</span>
      </div>
    );
  }

  if (personalitiesQuery.isError) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="text-destructive">
          {t('personalities.loadFailed')}: {personalitiesQuery.error.message}
        </span>
      </div>
    );
  }

  return (
    <Card className="max-w-6xl mx-auto p-6 mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('personalities.title')}</CardTitle>
        <Button onClick={() => {
          setDialog({ open: true, personality: null });
        }}>
          {t('personalities.addNewPersonality')}
        </Button>
      </CardHeader>

      <CardContent>
        <PersonalitiesTable
          personalities={personalities}
          isProcessing={deletePersonality.isPending}
          onEdit={(personality) => {
            setDialog({ open: true, personality });
          }}
          onDelete={(id) => {
            void handleDelete(id);
          }}
        />
      </CardContent>

      <PersonalityFormDialog
        open={dialog.open}
        onOpenChange={(open) => {
          setDialog(open ? dialog : CLOSED);
        }}
        initialPersonality={dialog.open ? dialog.personality : null}
      />
    </Card>
  );
}
