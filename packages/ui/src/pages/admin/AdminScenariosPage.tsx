import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { useConfirm } from '../../hooks/useConfirm';
import { ScenarioForm } from '../../components/admin/ScenarioForm';
import { ScenariosTable } from '../../components/admin/ScenariosTable';
import {
  useCreateScenario,
  useDeleteScenario,
  useScenarios,
  useUpdateScenario,
} from '../../hooks/queries/useScenarios';
import { usePersonalities } from '../../hooks/queries/usePersonalities';
import { ScenarioCreateModel, ScenarioModel } from '@repo/frontend-utils/src/models';

type ScenarioFormData = ScenarioModel | ScenarioCreateModel;

const EMPTY_SCENARIO: ScenarioCreateModel = {
  settingEn: '',
  settingCs: '',
  situationDescriptionCs: '',
  situationDescriptionEn: '',
  involvedPersonalityId: null,
};

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

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<ScenarioFormData>(EMPTY_SCENARIO);

  const handleEdit = (scenario: ScenarioFormData) => {
    setCurrentScenario(scenario);
    setIsEditDialogOpen(true);
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setCurrentScenario((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    const processedValue =
      field === 'involvedPersonalityId' && value === 'none' ?
        null :
        field === 'involvedPersonalityId' ?
          Number(value) :
          value;

    setCurrentScenario((prev) => ({ ...prev, [field]: processedValue }));
  };

  const validateScenario = (scenario: ScenarioFormData): boolean => {
    if (
      !scenario.settingEn || !scenario.settingCs ||
      !scenario.situationDescriptionEn || !scenario.situationDescriptionCs ||
      scenario.involvedPersonalityId === null
    ) {
      toast.error(t('admin.scenarios.notifications.validationFailed'));
      return false;
    }
    return true;
  };

  const handleEditSubmit = async (scenario: ScenarioFormData) => {
    if (!('id' in scenario) || !scenario.id) return;
    if (!validateScenario(scenario)) return;

    try {
      await updateScenario.mutateAsync({
        id: scenario.id,
        input: {
          settingEn: scenario.settingEn,
          settingCs: scenario.settingCs,
          situationDescriptionEn: scenario.situationDescriptionEn,
          situationDescriptionCs: scenario.situationDescriptionCs,
          involvedPersonalityId: scenario.involvedPersonalityId ?? undefined,
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

  const handleAddSubmit = async () => {
    if (!validateScenario(currentScenario)) return;

    try {
      await createScenario.mutateAsync({
        settingEn: currentScenario.settingEn,
        settingCs: currentScenario.settingCs,
        situationDescriptionEn: currentScenario.situationDescriptionEn,
        situationDescriptionCs: currentScenario.situationDescriptionCs,
        involvedPersonalityId: currentScenario.involvedPersonalityId ?? undefined,
      });
      toast.success(t('admin.scenarios.notifications.createSuccess'));
      setIsAddDialogOpen(false);
      setCurrentScenario(EMPTY_SCENARIO);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      toast.error(t('admin.scenarios.notifications.createFailed'), { description: message });
    }
  };

  const handleAddNew = () => {
    setCurrentScenario(EMPTY_SCENARIO);
    setIsAddDialogOpen(true);
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

          <ScenarioForm
            scenario={currentScenario}
            personalities={personalities}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('admin.scenarios.cancel')}</Button>
            </DialogClose>
            <Button onClick={() => {
              void handleEditSubmit(currentScenario);
            }} disabled={isProcessing}>
              {isProcessing ? t('admin.scenarios.saving') : t('admin.scenarios.saveChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('admin.scenarios.dialog.addTitle')}</DialogTitle>
          </DialogHeader>

          <ScenarioForm
            scenario={currentScenario}
            personalities={personalities}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('admin.scenarios.cancel')}</Button>
            </DialogClose>
            <Button onClick={() => {
              void handleAddSubmit();
            }} disabled={isProcessing}>
              {isProcessing ? t('admin.scenarios.creating') : t('admin.scenarios.createScenario')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
