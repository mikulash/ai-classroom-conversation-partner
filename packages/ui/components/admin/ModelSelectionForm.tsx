import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ModelSelection } from '@repo/shared/types/modelSelection';

interface BaseModel {
  id: number;
  provider: string;
  friendly_name?: string;
  api_name: string;
}

export interface ModelSectionConfig {
  label: string;
  modelKey: keyof ModelSelection;
  models: BaseModel[];
}

interface ModelSelectionFormProps {
  sections: ModelSectionConfig[];
  modelSelection: Partial<ModelSelection>;
  setModelSelection: React.Dispatch<React.SetStateAction<Partial<ModelSelection>>>;
  selectProviderLabel: string;
  selectModelLabel: string;
}

export function ModelSelectionForm({
  sections,
  modelSelection,
  setModelSelection,
  selectProviderLabel,
  selectModelLabel,
}: ModelSelectionFormProps) {
  const getProviders = (models: BaseModel[]): string[] =>
    Array.from(new Set(models.map((m) => m.provider).filter(Boolean))) as string[];

  const getModelsForProvider = (
    providerName: string,
    models: BaseModel[],
  ): BaseModel[] => models.filter((m) => m.provider === providerName);

  return (
    <>
      {sections.map((section) => {
        const currentModel = modelSelection[section.modelKey] as BaseModel | undefined;
        const currentProvider = currentModel?.provider || '';

        return (
          <div key={section.modelKey} className="grid gap-4">
            <h3 className="text-xl font-semibold">{section.label}</h3>

            <Select
              value={currentProvider}
              onValueChange={(value) => {
                const modelsForProvider = getModelsForProvider(value, section.models);
                if (modelsForProvider.length > 0) {
                  setModelSelection((prev) => ({
                    ...prev,
                    [section.modelKey]: modelsForProvider[0],
                  }));
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={selectProviderLabel} />
              </SelectTrigger>
              <SelectContent>
                {getProviders(section.models).map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={currentModel?.id ? String(currentModel.id) : ''}
              onValueChange={(value) => {
                const selectedModel = section.models.find((m) => m.id === Number(value));
                if (selectedModel) {
                  setModelSelection((prev) => ({
                    ...prev,
                    [section.modelKey]: selectedModel,
                  }));
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={selectModelLabel} />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {getModelsForProvider(currentProvider, section.models).map((model) => (
                  <SelectItem key={model.id} value={String(model.id)}>
                    <div className="flex flex-col">
                      <span>{model.friendly_name ?? model.api_name}</span>
                      {model.api_name && model.friendly_name && (
                        <span className="text-xs text-muted-foreground">{model.api_name}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </>
  );
}
