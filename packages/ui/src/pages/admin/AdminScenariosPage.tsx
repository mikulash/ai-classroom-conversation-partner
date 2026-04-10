import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { useAppStore } from '../../hooks/useAppStore';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { ScenarioForm } from '../../components/admin/ScenarioForm';
import { ScenariosTable } from '../../components/admin/ScenariosTable';
import { scenarioClient } from '@repo/frontend-utils/src/clients/db/scenario.client';
import { ScenarioCreateModel, ScenarioModel } from '@repo/frontend-utils/src/models';

type ScenarioFormData = ScenarioModel | ScenarioCreateModel;

export function AdminScenariosPage() {
  const { t } = useTypedTranslation();
  const scenarios = useAppStore((state) => state.scenarios);
  const setScenarios = useAppStore((state) => state.setScenarios);
  const personalities = useAppStore((state) => state.personalities);

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const emptyScenario: ScenarioCreateModel = {
    settingEn: '',
    settingCs: '',
    situationDescriptionCs: '',
    situationDescriptionEn: '',
    involvedPersonalityId: null,
  };

  const [currentScenario, setCurrentScenario] = useState<ScenarioFormData>(emptyScenario);

  useEffect(() => {
    void fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);

    const scenariosRes = await scenarioClient.all();

    // Handle scenarios response
    if (scenariosRes.error) {
      console.error(scenariosRes.error.message);
      toast.error(t('admin.scenarios.notifications.loadFailed'), {
        description: scenariosRes.error.message,
      });
    } else {
      const sortedScenarios = scenariosRes.data.toSorted((a, b) => a.id - b.id);
      setScenarios(sortedScenarios);
    }

    setIsLoading(false);
  }


  const handleEdit = (scenario: ScenarioFormData) => {
    setCurrentScenario(scenario);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!globalThis.confirm(t('admin.scenarios.deleteConfirm'))) return;

    setIsProcessing(true);
    const { error } = await scenarioClient.delete(id);

    if (error) {
      console.error(error.message);
      toast.error(t('admin.scenarios.notifications.deleteFailed'), { description: error.message });
    } else {
      toast.success(t('admin.scenarios.notifications.deleteSuccess'));
      void fetchData();
    }
    setIsProcessing(false);
  };


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setCurrentScenario((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    const processedValue =
      field === 'involvedPersonalityId' && value === 'none' ? null : field === 'involvedPersonalityId' ? Number(value) : value;

    setCurrentScenario((prev) => ({ ...prev, [field]: processedValue }));
  };

  const validateScenario = (scenario: ScenarioFormData): boolean => {
    if (!scenario.settingEn || !scenario.settingCs ||
      !scenario.situationDescriptionEn || !scenario.situationDescriptionCs ||
      scenario.involvedPersonalityId === null) {
      toast.error(t('admin.scenarios.notifications.validationFailed'));
      return false;
    }
    return true;
  };

  const handleEditSubmit = async (scenario: ScenarioFormData) => {
    if (!('id' in scenario) || !scenario.id) return;
    if (!validateScenario(scenario)) return;

    setIsProcessing(true);

    const { error } = await scenarioClient.update(
      scenario.id,
      {
        settingEn: scenario.settingEn,
        settingCs: scenario.settingCs,
        situationDescriptionEn: scenario.situationDescriptionEn,
        situationDescriptionCs: scenario.situationDescriptionCs,
        involvedPersonalityId: scenario.involvedPersonalityId ?? undefined,
      },
    );

    if (error) {
      console.error(error.message);
      toast.error(t('admin.scenarios.notifications.updateFailed'), { description: error.message });
    } else {
      toast.success(t('admin.scenarios.notifications.updateSuccess'));
      void fetchData();
      setIsEditDialogOpen(false);
    }
    setIsProcessing(false);
  };

  const handleAddSubmit = async () => {
    if (!validateScenario(currentScenario)) return;

    setIsProcessing(true);

    const { error } = await scenarioClient.insert({
      settingEn: currentScenario.settingEn,
      settingCs: currentScenario.settingCs,
      situationDescriptionEn: currentScenario.situationDescriptionEn,
      situationDescriptionCs: currentScenario.situationDescriptionCs,
      involvedPersonalityId: currentScenario.involvedPersonalityId ?? undefined,
    });

    if (error) {
      console.error(error.message);
      toast.error(t('admin.scenarios.notifications.createFailed'), { description: error.message });
    } else {
      toast.success(t('admin.scenarios.notifications.createSuccess'));
      void fetchData();
      setIsAddDialogOpen(false);
      setCurrentScenario(emptyScenario);
    }
    setIsProcessing(false);
  };

  const handleAddNew = () => {
    setCurrentScenario(emptyScenario);
    setIsAddDialogOpen(true);
  };


  const getPersonalityName = (id: number | null) => {
    if (!id) return t('admin.scenarios.form.none');
    const p = personalities.find((x) => x.id === id);
    return p ? p.name : t('admin.scenarios.form.unknown');
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-muted-foreground">{t('admin.scenarios.loading')}</span>
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
