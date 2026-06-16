import React, { useState } from 'react';
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

export function AdminGlobalModelSelectionPage() {
  const { t } = useTypedTranslation();
  const confirm = useConfirm();
  const appConfig = useAppStore((state) => state.appConfig);

  const modelOptionsQuery = useFilteredModelOptions();
  const updateAppConfigModels = useUpdateAppConfigModels();

  const [modelSelectionState, setModelSelectionState] = useState<Partial<ModelSelection>>({});

  // Seed the selection state from the loaded model options + current appConfig.
  // Re-seeds whenever either the options arrive or the global config changes
  // (e.g. after save invalidates the query) without overwriting in-flight edits in between.
  const [seedKey, setSeedKey] = useState<{ data: unknown; appConfig: unknown } | null>(null);
  const modelOptions = modelOptionsQuery.data;
  if (modelOptions && (seedKey?.data !== modelOptions || seedKey.appConfig !== appConfig)) {
    setSeedKey({ data: modelOptions, appConfig });
    setModelSelectionState({
      responseModel:
        modelOptions.responseModels.find((m) => m.id === appConfig.responseModelId) ?? modelOptions.responseModels[0],
      ttsModel:
        modelOptions.ttsModels.find((m) => m.id === appConfig.ttsModelId) ?? modelOptions.ttsModels[0],
      realtimeModel:
        modelOptions.realtimeModels.find((m) => m.id === appConfig.realtimeModelId) ?? modelOptions.realtimeModels[0],
      timestampedTranscriptionModel:
        modelOptions.timestampedTranscriptionModels.find((m) => m.id === appConfig.timestampedTranscriptionModelId) ??
        modelOptions.timestampedTranscriptionModels[0],
      realtimeTranscriptionModel:
        modelOptions.realtimeTranscriptionModels.find((m) => m.id === appConfig.realtimeTranscriptionModelId) ??
        modelOptions.realtimeTranscriptionModels[0],
    });
  }

  const handleSave = async () => {
    const confirmed = await confirm({
      title: t('models.confirmationWarning'),
      confirmLabel: t('common.save', 'Save'),
      cancelLabel: t('common.cancel', 'Cancel'),
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
      toast.success(t('common.settingsSaved'), {
        description: t('models.saveSuccessDescription'),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      toast.error(t('common.saveFailed'), { description: message });
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
        <span className="text-muted-foreground">{t('common.loading.general')}</span>
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

  if (!modelOptions) return null;

  const isSaving = updateAppConfigModels.isPending;

  return (
    <Card className="max-w-3xl mx-auto p-6">
      <CardHeader>
        <CardTitle>{t('models.title')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8">
        <ModelSelectionForm>
          <ModelSelectionSection
            label={t('models.responseModel')}
            modelKey="responseModel"
            models={modelOptions.responseModels}
            modelSelection={modelSelectionState}
            setModelSelection={setModelSelectionState}
            selectProviderLabel={t('models.selectProvider')}
            selectModelLabel={t('models.selectModel')}
            optionStatus={getOptionStatus(appConfig.responseModelId)}
          />
          <ModelSelectionSection
            label={t('models.ttsModel')}
            modelKey="ttsModel"
            models={modelOptions.ttsModels}
            modelSelection={modelSelectionState}
            setModelSelection={setModelSelectionState}
            selectProviderLabel={t('models.selectProvider')}
            selectModelLabel={t('models.selectModel')}
            optionStatus={getOptionStatus(appConfig.ttsModelId)}
          />
          <ModelSelectionSection
            label={t('models.realtimeModel')}
            modelKey="realtimeModel"
            models={modelOptions.realtimeModels}
            modelSelection={modelSelectionState}
            setModelSelection={setModelSelectionState}
            selectProviderLabel={t('models.selectProvider')}
            selectModelLabel={t('models.selectModel')}
            optionStatus={getOptionStatus(appConfig.realtimeModelId)}
          />
          <ModelSelectionSection
            label={t('models.timestampedTranscriptionModel')}
            modelKey="timestampedTranscriptionModel"
            models={modelOptions.timestampedTranscriptionModels}
            modelSelection={modelSelectionState}
            setModelSelection={setModelSelectionState}
            selectProviderLabel={t('models.selectProvider')}
            selectModelLabel={t('models.selectModel')}
            optionStatus={getOptionStatus(appConfig.timestampedTranscriptionModelId)}
          />
          <ModelSelectionSection
            label={t('models.realtimeTranscriptionModel')}
            modelKey="realtimeTranscriptionModel"
            models={modelOptions.realtimeTranscriptionModels}
            modelSelection={modelSelectionState}
            setModelSelection={setModelSelectionState}
            selectProviderLabel={t('models.selectProvider')}
            selectModelLabel={t('models.selectModel')}
            optionStatus={getOptionStatus(appConfig.realtimeTranscriptionModelId)}
          />
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
