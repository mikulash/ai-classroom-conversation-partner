import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { useAppStore } from '../../hooks/useAppStore';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ModelSelection } from '../../lib/types/modelSelection';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { useConfirm } from '../../hooks/useConfirm';
import { ModelSelectionForm, ModelSelectionSection } from '../../components/admin/ModelSelectionForm';
import { useFilteredModelOptions } from '../../hooks/queries/useModels';
import { useUpdateAppConfigModels } from '../../hooks/queries/useAppConfig';
import { MODEL_CATEGORIES } from '../../lib/modelCategories';

export function AdminGlobalModelSelectionPage() {
  const { t } = useTypedTranslation();
  const confirm = useConfirm();
  const appConfig = useAppStore((state) => state.appConfig);

  const modelOptionsQuery = useFilteredModelOptions();
  const updateAppConfigModels = useUpdateAppConfigModels();

  const [modelSelectionState, setModelSelectionState] = useState<Partial<ModelSelection>>({});

  /**
   * Seed the selection state from the loaded model options + current appConfig.
   * Re-runs when either the options arrive or the global config changes.
   */
  useEffect(() => {
    const data = modelOptionsQuery.data;
    if (!data) return;

    setModelSelectionState({
      responseModel:
        data.responseModels.find((m) => m.id === appConfig.responseModelId) ?? data.responseModels[0],
      ttsModel:
        data.ttsModels.find((m) => m.id === appConfig.ttsModelId) ?? data.ttsModels[0],
      realtimeModel:
        data.realtimeModels.find((m) => m.id === appConfig.realtimeModelId) ?? data.realtimeModels[0],
      timestampedTranscriptionModel:
        data.timestampedTranscriptionModels.find((m) => m.id === appConfig.timestampedTranscriptionModelId) ??
        data.timestampedTranscriptionModels[0],
      realtimeTranscriptionModel:
        data.realtimeTranscriptionModels.find((m) => m.id === appConfig.realtimeTranscriptionModelId) ??
        data.realtimeTranscriptionModels[0],
    });
  }, [modelOptionsQuery.data, appConfig]);

  const handleSave = async () => {
    const confirmed = await confirm({
      title: t('models.confirmationWarning'),
      confirmLabel: t('actions.save', 'Save'),
      cancelLabel: t('actions.cancel', 'Cancel'),
    });
    if (!confirmed) return;

    try {
      await updateAppConfigModels.mutateAsync({
        responseModelId: modelSelectionState.responseModel?.id,
        ttsModelId: modelSelectionState.ttsModel?.id,
        realtimeModelId: modelSelectionState.realtimeModel?.id,
        timestampedTranscriptionModelId: modelSelectionState.timestampedTranscriptionModel?.id,
        realtimeTranscriptionModelId: modelSelectionState.realtimeTranscriptionModel?.id,
      });
      toast.success(t('models.saveSuccess'), {
        description: t('models.saveSuccessDescription'),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      toast.error(t('models.saveFailed'), { description: message });
    }
  };

  const getOptionStatus = (configValue?: number | null) =>
    (model: { id: number }, currentModel?: { id: number }) => {
      if (configValue == null) return null;
      if (!currentModel) return null;
      return currentModel.id === configValue && model.id === currentModel.id ?
        t('models.currentlyApplied') :
        null;
    };

  if (modelOptionsQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="text-muted-foreground">{t('common.loading')}</span>
      </div>
    );
  }

  if (modelOptionsQuery.isError) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="text-destructive">
          {t('models.loadFailed')}: {modelOptionsQuery.error.message}
        </span>
      </div>
    );
  }

  const modelOptions = modelOptionsQuery.data;
  if (!modelOptions) return null;

  const isSaving = updateAppConfigModels.isPending;

  return (
    <Card className="max-w-3xl mx-auto p-6">
      <CardHeader>
        <CardTitle>{t('models.title')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8">
        <ModelSelectionForm>
          {MODEL_CATEGORIES.map((category) => (
            <ModelSelectionSection
              key={category.key}
              label={t(category.globalLabelKey)}
              modelKey={category.key}
              models={modelOptions[category.modelsKey]}
              modelSelection={modelSelectionState}
              setModelSelection={setModelSelectionState}
              selectProviderLabel={t('models.selectProvider')}
              selectModelLabel={t('models.selectModel')}
              optionStatus={getOptionStatus(appConfig[category.configIdKey] as number | null | undefined)}
            />
          ))}
        </ModelSelectionForm>
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('models.warningTitle')}</AlertTitle>
          <AlertDescription>
            {t('models.warningDescription')}
          </AlertDescription>
        </Alert>
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => {
            void handleSave();
          }}
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? t('common.saving') : t('models.saveSettings')}
        </Button>
      </CardFooter>
    </Card>
  );
}
