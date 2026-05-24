import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Form } from '../../components/ui/form';
import { toast } from 'sonner';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { useConfirm } from '../../hooks/useConfirm';
import {
  EMPTY_SCENARIO_FORM_VALUES,
  ScenarioForm,
  ScenarioFormValues,
  scenarioFormSchema,
} from '../../components/admin/ScenarioForm';
import { ScenariosTable } from '../../components/admin/ScenariosTable';
import {
  useCreateScenario,
  useDeleteScenario,
  useScenarios,
  useUpdateScenario,
} from '../../hooks/queries/useScenarios';
import { usePersonalities } from '../../hooks/queries/usePersonalities';
import { ScenarioModel } from '@repo/frontend-utils/src/models';

const scenarioToFormValues = (scenario: ScenarioModel): ScenarioFormValues => ({
  settingEn: scenario.settingEn,
  settingCs: scenario.settingCs,
  situationDescriptionEn: scenario.situationDescriptionEn,
  situationDescriptionCs: scenario.situationDescriptionCs,
  involvedPersonalityId: scenario.involvedPersonalityId !== null ?
    String(scenario.involvedPersonalityId) :
    'none',
});

export function AdminScenariosPage() {
  const { t } = useTypedTranslation();
  const confirm = useConfirm();

  const scenariosQuery = useScenarios();
  const personalitiesQuery = usePersonalities();
  const scenarios = scenariosQuery.data ?? [];
  const personalities = personalitiesQuery.data ?? [];

  const createScenario = useCreateScenario();
  const updateScenario = useUpdateScenario();
  const deleteScenario = useDeleteScenario();

  const isProcessing =
    createScenario.isPending || updateScenario.isPending || deleteScenario.isPending;

  const [editingScenarioId, setEditingScenarioId] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const form = useForm<ScenarioFormValues>({
    resolver: zodResolver(scenarioFormSchema),
    defaultValues: EMPTY_SCENARIO_FORM_VALUES,
    mode: 'onTouched',
  });

  const onInvalid = () => {
    toast.error(t('admin.scenarios.notifications.validationFailed'));
  };

  const handleEdit = (scenario: ScenarioModel) => {
    setEditingScenarioId(scenario.id);
    form.reset(scenarioToFormValues(scenario));
    setIsEditDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingScenarioId(null);
    form.reset(EMPTY_SCENARIO_FORM_VALUES);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: t('admin.scenarios.deleteConfirm'),
      confirmLabel: t('actions.delete', 'Delete'),
      cancelLabel: t('actions.cancel', 'Cancel'),
      destructive: true,
    });
    if (!ok) return;

    try {
      await deleteScenario.mutateAsync(id);
      toast.success(t('admin.scenarios.notifications.deleteSuccess'));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      toast.error(t('admin.scenarios.notifications.deleteFailed'), { description: message });
    }
  };

  const onEditSubmit = async (values: ScenarioFormValues) => {
    if (editingScenarioId === null) return;
    try {
      await updateScenario.mutateAsync({
        id: editingScenarioId,
        input: {
          settingEn: values.settingEn,
          settingCs: values.settingCs,
          situationDescriptionEn: values.situationDescriptionEn,
          situationDescriptionCs: values.situationDescriptionCs,
          involvedPersonalityId: Number(values.involvedPersonalityId),
        },
      });
      toast.success(t('admin.scenarios.notifications.updateSuccess'));
      setIsEditDialogOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      toast.error(t('admin.scenarios.notifications.updateFailed'), { description: message });
    }
  };

  const onAddSubmit = async (values: ScenarioFormValues) => {
    try {
      await createScenario.mutateAsync({
        settingEn: values.settingEn,
        settingCs: values.settingCs,
        situationDescriptionEn: values.situationDescriptionEn,
        situationDescriptionCs: values.situationDescriptionCs,
        involvedPersonalityId: Number(values.involvedPersonalityId),
      });
      toast.success(t('admin.scenarios.notifications.createSuccess'));
      setIsAddDialogOpen(false);
      form.reset(EMPTY_SCENARIO_FORM_VALUES);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      toast.error(t('admin.scenarios.notifications.createFailed'), { description: message });
    }
  };

  const getPersonalityName = (id: number | null) => {
    if (!id) return t('admin.scenarios.form.none');
    const p = personalities.find((x) => x.id === id);
    return p ? p.name : t('admin.scenarios.form.unknown');
  };

  if (scenariosQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-muted-foreground">{t('admin.scenarios.loading')}</span>
      </div>
    );
  }

  if (scenariosQuery.isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-destructive">
          {t('admin.scenarios.notifications.loadFailed')}: {scenariosQuery.error.message}
        </span>
      </div>
    );
  }

  return (
    <Card className="mx-auto mb-8 max-w-6xl p-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('admin.scenarios.title')}</CardTitle>
        <Button onClick={handleAddNew}>{t('admin.scenarios.addNew')}</Button>
      </CardHeader>

      <CardContent>
        <ScenariosTable
          scenarios={scenarios}
          isProcessing={isProcessing}
          onEdit={handleEdit}
          onDelete={(id) => {
            void handleDelete(id);
          }}
          getPersonalityName={getPersonalityName}
        />
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('admin.scenarios.dialog.editTitle')}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={(e) => {
              void form.handleSubmit(onEditSubmit, onInvalid)(e);
            }}>
              <ScenarioForm personalities={personalities} />

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">{t('admin.scenarios.cancel')}</Button>
                </DialogClose>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? t('admin.scenarios.saving') : t('admin.scenarios.saveChanges')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('admin.scenarios.dialog.addTitle')}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={(e) => {
              void form.handleSubmit(onAddSubmit, onInvalid)(e);
            }}>
              <ScenarioForm personalities={personalities} />

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">{t('admin.scenarios.cancel')}</Button>
                </DialogClose>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? t('admin.scenarios.creating') : t('admin.scenarios.createScenario')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
