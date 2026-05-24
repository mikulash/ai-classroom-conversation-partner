import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { useAppStore } from '../../hooks/useAppStore';
import { ModelSelection } from '../../lib/types/modelSelection';
import { useAuth } from '../../hooks/useAuth';
import { Loading } from '../../components/Loading';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { ModelSelectionForm, ModelSelectionSection } from '../../components/admin/ModelSelectionForm';
import {
  useCustomModelSelection,
  useFilteredModelOptions,
  useUpsertCustomModelSelection,
} from '../../hooks/queries/useModels';
import { MODEL_CATEGORIES } from '../../lib/modelCategories';

export function AdminCustomModelSelectionPage() {
  const { t } = useTypedTranslation();
  const { session, ready } = useAuth();
  const appConfig = useAppStore((state) => state.appConfig);

  const userId = session?.user.id;

  const modelOptionsQuery = useFilteredModelOptions();
  const customSelectionQuery = useCustomModelSelection(userId);
  const upsertCustomSelection = useUpsertCustomModelSelection(userId);

  const [selection, setSelection] = useState<Partial<ModelSelection>>({});

  // Track which fields have explicit user overrides (vs using global defaults)
  const [userOverrides, setUserOverrides] = useState<Set<keyof ModelSelection>>(new Set());

  /**
   * Seed selection + overrides when both model options and the user's
   * custom selection have loaded. Re-runs whenever either side changes,
   * so a save (which invalidates the custom-selection query) picks the
   * fresh row up automatically.
   */
  useEffect(() => {
    const models = modelOptionsQuery.data;
    if (!models) return;
    if (customSelectionQuery.isLoading) return;

    const userSelection = customSelectionQuery.data;

    const overrides = new Set<keyof ModelSelection>();
    if (userSelection?.responseModelId != null) overrides.add('responseModel');
    if (userSelection?.ttsModelId != null) overrides.add('ttsModel');
    if (userSelection?.realtimeModelId != null) overrides.add('realtimeModel');
    if (userSelection?.timestampedTranscriptionModelId != null) overrides.add('timestampedTranscriptionModel');
    if (userSelection?.realtimeTranscriptionModelId != null) overrides.add('realtimeTranscriptionModel');
    setUserOverrides(overrides);

    const findSelectedModel = <T extends { id: number }>(
      modelArray: T[],
      userModelId: number | null | undefined,
      globalModelId: number | null | undefined,
    ): T | undefined => {
      if (userModelId) return modelArray.find((m) => m.id === userModelId);
      if (globalModelId) return modelArray.find((m) => m.id === globalModelId);
      return modelArray[0];
    };

    setSelection({
      responseModel: findSelectedModel(
        models.responseModels,
        userSelection?.responseModelId,
        appConfig.responseModelId,
      ),
      ttsModel: findSelectedModel(
        models.ttsModels,
        userSelection?.ttsModelId,
        appConfig.ttsModelId,
      ),
      realtimeModel: findSelectedModel(
        models.realtimeModels,
        userSelection?.realtimeModelId,
        appConfig.realtimeModelId,
      ),
      timestampedTranscriptionModel: findSelectedModel(
        models.timestampedTranscriptionModels,
        userSelection?.timestampedTranscriptionModelId,
        appConfig.timestampedTranscriptionModelId,
      ),
      realtimeTranscriptionModel: findSelectedModel(
        models.realtimeTranscriptionModels,
        userSelection?.realtimeTranscriptionModelId,
        appConfig.realtimeTranscriptionModelId,
      ),
    });
  }, [modelOptionsQuery.data, customSelectionQuery.data, customSelectionQuery.isLoading, appConfig]);

  const handleSave = async () => {
    if (!userId) {
      toast.error(t('loginRequiredToSave'));
      return;
    }

    // Build payload with only the fields that should be stored as overrides:
    // 1. Selection is undefined → send null to remove override
    // 2. Selection differs from global → send ID to set override
    // 3. Selection matches global AND had previous override → send ID to keep override
    // 4. Selection matches global AND no previous override → don't send
    const payload: Partial<{
      responseModelId: number | null;
      ttsModelId: number | null;
      realtimeModelId: number | null;
      timestampedTranscriptionModelId: number | null;
      realtimeTranscriptionModelId: number | null;
    }> = {};

    const buildField = (
      modelKey: keyof ModelSelection,
      payloadKey: keyof typeof payload,
      globalId: number | null | undefined,
    ) => {
      const selected = selection[modelKey] as { id: number } | undefined;
      if (!selected) {
        payload[payloadKey] = null;
        return;
      }
      if (selected.id !== globalId) {
        payload[payloadKey] = selected.id;
        return;
      }
      if (userOverrides.has(modelKey)) {
        payload[payloadKey] = selected.id;
      }
    };

    buildField('responseModel', 'responseModelId', appConfig.responseModelId);
    buildField('ttsModel', 'ttsModelId', appConfig.ttsModelId);
    buildField('realtimeModel', 'realtimeModelId', appConfig.realtimeModelId);
    buildField('timestampedTranscriptionModel', 'timestampedTranscriptionModelId', appConfig.timestampedTranscriptionModelId);
    buildField('realtimeTranscriptionModel', 'realtimeTranscriptionModelId', appConfig.realtimeTranscriptionModelId);

    try {
      await upsertCustomSelection.mutateAsync(payload);
      toast.success(t('settingsSaved'), {
        description: t('customModelPreferencesSaved'),
      });
      // The query invalidation in the mutation hook will re-fetch and the effect
      // above will re-seed `selection` + `userOverrides` from server truth.
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      toast.error(t('saveFailed'), { description: message });
    }
  };

  if (!ready || !session) return <Loading />;

  if (modelOptionsQuery.isError) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="text-destructive">
          {t('models.loadFailed')}: {modelOptionsQuery.error.message}
        </span>
      </div>
    );
  }

  if (modelOptionsQuery.isLoading || customSelectionQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="text-muted-foreground">{t('loading.general')}</span>
      </div>
    );
  }

  const models = modelOptionsQuery.data;
  if (!models) return null;

  const overridesDefaultLabel = t('models.overridesDefault');
  const usesGlobalDefaultLabel = t('models.usesGlobalDefault');
  const clearSectionLabel = t('models.clearCustomSelection');
  const clearAllLabel = t('models.clearAllCustomSelections');

  const globalOptionStatus = (modelId?: number | null) =>
    (model: { id: number }, _currentModel?: { id: number }) => {
      void _currentModel;
      return modelId != null && model.id === modelId ? t('models.currentlyUsedGlobally') : null;
    };

  const globalProviderStatus = (
    modelId?: number | null,
    modelsList?: { id: number; provider: string }[],
  ) =>
    (provider: string, _currentProvider?: string) => {
      void _currentProvider;
      if (modelId == null || !modelsList) return null;
      const globalModel = modelsList.find((m) => m.id === modelId);
      return globalModel?.provider === provider ? t('models.currentlyUsedGlobally') : null;
    };

  // Derive `modelKeys` and `globalModelIds` from the central category list
  // so adding/removing a model category requires no edit here.
  const modelKeys = MODEL_CATEGORIES.map((c) => c.key);
  const globalModelIds = Object.fromEntries(
    MODEL_CATEGORIES.map((c) => [c.key, (appConfig[c.configIdKey] as number | null | undefined) ?? null]),
  ) as Record<keyof ModelSelection, number | null>;

  const hasAnyOverride = userOverrides.size > 0;

  const titleStatusForKey = (modelKey: keyof ModelSelection) => {
    const selectedModel = selection[modelKey] as { id?: number } | undefined;
    const selectedId = selectedModel?.id ?? null;
    const globalId = globalModelIds[modelKey];
    const isOverriding = selectedId != null && selectedId !== globalId;
    const statusLabel = isOverriding ? overridesDefaultLabel : usesGlobalDefaultLabel;
    const statusColor = isOverriding ? 'text-yellow-600' : 'text-blue-600';

    return <span className={`text-xs font-medium ${statusColor}`}>{statusLabel}</span>;
  };

  const clearSelectionForKey = (modelKey: keyof ModelSelection) => {
    setSelection((prev) => ({
      ...prev,
      [modelKey]: undefined,
    }));
  };

  const clearAllSelections = () => {
    setSelection(
      Object.fromEntries(modelKeys.map((key) => [key, undefined])) as Partial<ModelSelection>,
    );
  };

  const isSaving = upsertCustomSelection.isPending;

  return (
    <Card className="max-w-3xl mx-auto p-6">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>{t('customModelPreferences')}</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearAllSelections}
          disabled={!hasAnyOverride}
        >
          {clearAllLabel}
        </Button>
      </CardHeader>
      <CardContent className="grid gap-8">
        <ModelSelectionForm>
          {MODEL_CATEGORIES.map((category) => {
            const modelList = models[category.modelsKey];
            const globalId = appConfig[category.configIdKey] as number | null | undefined;
            return (
              <ModelSelectionSection
                key={category.key}
                label={t(category.customLabelKey)}
                modelKey={category.key}
                models={modelList}
                modelSelection={selection}
                setModelSelection={setSelection}
                selectProviderLabel={t('selectProvider')}
                selectModelLabel={t('selectModel')}
                titleStatus={titleStatusForKey(category.key)}
                optionStatus={globalOptionStatus(globalId)}
                providerStatus={globalProviderStatus(globalId, modelList)}
                clearSelectionLabel={clearSectionLabel}
                onClearSelection={() => {
                  clearSelectionForKey(category.key);
                }}
                hasOverride={userOverrides.has(category.key)}
              />
            );
          })}
        </ModelSelectionForm>
      </CardContent>

      <CardFooter className="flex gap-4">
        <Button
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="flex-1"
        >
          {isSaving ? t('saving') : t('savePreferences')}
        </Button>
      </CardFooter>
    </Card>
  );
}
