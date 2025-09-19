import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { scenarioApi } from '@repo/frontend-utils/src/supabaseService';
import { toast } from 'sonner';
import { ScenarioInsert } from '@repo/shared/types/supabase/supabaseTypeHelpers';
import { useAppStore } from '../../hooks/useAppStore';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { ScenarioForm } from '../../components/admin/ScenarioForm';
import { ScenariosTable } from '../../components/admin/ScenariosTable';


export function AdminScenariosPage() {
  const { t } = useTypedTranslation();
  const scenarios = useAppStore((state) => state.scenarios);
  const setScenarios = useAppStore((state) => state.setScenarios);
  const personalities = useAppStore((state) => state.personalities);

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const emptyScenario: ScenarioInsert = {
    setting_en: '',
    setting_cs: '',
    situation_description_en: '',
    situation_description_cs: '',
    involved_personality_id: null,
  };

  const [currentScenario, setCurrentScenario] = useState<ScenarioInsert>(emptyScenario);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);

    const [scenariosRes] = await Promise.all([
      scenarioApi.all(),
    ]);

    console.log('scenariosRes', scenariosRes);

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


  const handleEdit = (scenario: ScenarioInsert) => {
    setCurrentScenario(scenario);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('admin.scenarios.deleteConfirm'))) return;

    setIsProcessing(true);
    const { error } = await scenarioApi.delete(id);

    if (error) {
      console.error(error.message);
      toast.error(t('admin.scenarios.notifications.deleteFailed'), { description: error.message });
    } else {
      toast.success(t('admin.scenarios.notifications.deleteSuccess'));
      fetchData();
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
            field === 'involved_personality_id' && value === 'none' ? null : field === 'involved_personality_id' ? Number(value) : value;

    setCurrentScenario((prev) => ({ ...prev, [field]: processedValue }));
  };

  const handleEditSubmit = async () => {
    if (!currentScenario.id) return;

    setIsProcessing(true);

    console.log('current scenario to update', currentScenario);

    const { error } = await scenarioApi.update(
      currentScenario.id,
      currentScenario,
    );

    if (error) {
      console.error(error.message);
      toast.error(t('admin.scenarios.notifications.updateFailed'), { description: error.message });
    } else {
      toast.success(t('admin.scenarios.notifications.updateSuccess'));
      fetchData();
      setIsEditDialogOpen(false);
    }
    setIsProcessing(false);
  };

  const handleAddSubmit = async () => {
    setIsProcessing(true);

    const { error } = await scenarioApi.insert(currentScenario);

    if (error) {
      console.error(error.message);
      toast.error(t('admin.scenarios.notifications.createFailed'), { description: error.message });
    } else {
      toast.success(t('admin.scenarios.notifications.createSuccess'));
      fetchData();
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
          onDelete={handleDelete}
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
            <Button onClick={handleEditSubmit} disabled={isProcessing}>
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
            <Button onClick={handleAddSubmit} disabled={isProcessing}>
              {isProcessing ? t('admin.scenarios.creating') : t('admin.scenarios.createScenario')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
