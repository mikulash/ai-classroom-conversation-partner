import React from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ModelSelection } from '../../lib/types/modelSelection';

interface BaseModel {
    id: number;
    provider: string;
    friendlyName?: string;
    apiName: string;
    isAvailable: boolean;
}

interface ModelSelectionFormProps {
    children: React.ReactNode;
}

export function ModelSelectionForm({ children }: ModelSelectionFormProps) {
  return <div className="grid gap-8">{children}</div>;
}

interface ModelSelectionSectionProps {
    label: string;
    modelKey: keyof ModelSelection;
    models: BaseModel[];
    modelSelection: Partial<ModelSelection>;
    setModelSelection: React.Dispatch<React.SetStateAction<Partial<ModelSelection>>>;
    selectProviderLabel: string;
    selectModelLabel: string;
    titleStatus?: React.ReactNode;
    optionStatus?: (model: BaseModel, currentModel: BaseModel | undefined) => string | null | undefined;
    providerStatus?: (provider: string, currentProvider: string | undefined) => string | null | undefined;
    clearSelectionLabel?: string;
    onClearSelection?: () => void;
    hasOverride?: boolean;
}

const getProviders = (models: BaseModel[]): string[] =>
  Array.from(new Set(models.map((m) => m.provider).filter(Boolean)));

const getModelsForProvider = (
  providerName: string,
  models: BaseModel[],
): BaseModel[] => models.filter((m) => m.provider === providerName);

export function ModelSelectionSection({
  label,
  modelKey,
  models,
  modelSelection,
  setModelSelection,
  selectProviderLabel,
  selectModelLabel,
  titleStatus,
  optionStatus,
  providerStatus,
  clearSelectionLabel,
  onClearSelection,
  hasOverride = false,
}: ModelSelectionSectionProps) {
  const currentModel = modelSelection[modelKey] as BaseModel | undefined;
  const currentProvider = currentModel?.provider ?? '';

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold">{label}</h3>
          {titleStatus}
        </div>
        {onClearSelection && clearSelectionLabel ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={!hasOverride}
          >
            {clearSelectionLabel}
          </Button>
        ) : null}
      </div>

      <Select
        value={currentProvider}
        onValueChange={(value) => {
          const modelsForProvider = getModelsForProvider(value, models);
          if (modelsForProvider.length > 0) {
            setModelSelection((prev) => ({
              ...prev,
              [modelKey]: modelsForProvider[0],
            }));
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={selectProviderLabel}/>
        </SelectTrigger>
        <SelectContent>
          {getProviders(models).map((provider) => {
            const hasAvailableModels = getModelsForProvider(provider, models).some(
              (m) => m.isAvailable,
            );
            const statusText = providerStatus?.(provider, currentProvider);
            return (
              <SelectItem key={provider} value={provider} disabled={!hasAvailableModels}>
                <div className="flex items-center gap-2">
                  <span>{provider}</span>
                  {statusText ? (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{statusText}</span>
                  ) : null}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <Select
        value={currentModel?.id ? String(currentModel.id) : ''}
        onValueChange={(value) => {
          const selectedModel = models.find((m) => m.id === Number(value));
          if (selectedModel) {
            setModelSelection((prev) => ({
              ...prev,
              [modelKey]: selectedModel,
            }));
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={selectModelLabel}/>
        </SelectTrigger>
        <SelectContent className="max-h-60 overflow-y-auto">
          {getModelsForProvider(currentProvider, models).map((model) => {
            const statusText = optionStatus?.(model, currentModel);
            return (
              <SelectItem key={model.id} value={String(model.id)} disabled={!model.isAvailable}>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <span>{model.friendlyName ?? model.apiName}</span>
                    {statusText ? (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{statusText}</span>
                    ) : null}
                  </div>
                  {model.apiName && model.friendlyName && (
                    <span className="text-xs text-muted-foreground">{model.apiName}</span>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
