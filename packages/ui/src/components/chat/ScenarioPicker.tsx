import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { ScenarioModel } from '@repo/frontend-utils/src/models';
import { ScenarioTabKey } from '../../lib/customConversationOptions';
import { universalDescriptionForScenario } from '../../lib/universalDescriptionMoreLanguages';

interface ScenarioPickerProps {
  scenariosForPersonality: ScenarioModel[];
  activeTab: ScenarioTabKey;
  onActiveTabChange: (tab: ScenarioTabKey) => void;
  selectedScenario: ScenarioModel | undefined;
  onSelectScenario: (scenario: ScenarioModel) => void;
  customScenario: Partial<ScenarioModel>;
  onCustomScenarioChange: (updater: (prev: Partial<ScenarioModel>) => Partial<ScenarioModel>) => void;
  /** When true, the "predefined" tab is hidden (predefined scenarios are tied to a predefined personality). */
  hidePredefinedTab: boolean;
}

export const ScenarioPicker: React.FC<ScenarioPickerProps> = ({
  scenariosForPersonality,
  activeTab,
  onActiveTabChange,
  selectedScenario,
  onSelectScenario,
  customScenario,
  onCustomScenarioChange,
  hidePredefinedTab,
}) => {
  const { t, language } = useTypedTranslation();

  return (
    <Tabs value={activeTab} onValueChange={(value) => {
      onActiveTabChange(value as ScenarioTabKey);
    }}>
      <TabsList className={`grid w-full max-w-md mb-6 ${hidePredefinedTab ? 'grid-cols-2' : 'grid-cols-3'}`}>
        <TabsTrigger value="none">{t('scenarios.none')}</TabsTrigger>
        {!hidePredefinedTab && (
          <TabsTrigger value="predefined">{t('scenarios.predefined')}</TabsTrigger>
        )}
        <TabsTrigger value="custom">{t('scenarios.custom')}</TabsTrigger>
      </TabsList>

      <TabsContent value="predefined">
        {scenariosForPersonality.length === 0 ? (
          <p className="text-gray-400 mb-10">{t('scenarios.noneForPersonality')}</p>
        ) : (
          <Carousel className="w-full mb-10">
            <CarouselContent>
              {scenariosForPersonality.map((s) => {
                const { situationDescription, setting } =
                  universalDescriptionForScenario(s, language);
                return (
                  <CarouselItem key={s.id} className="md:basis-1/2 lg:basis-1/2">
                    <Card
                      className={`border-2 cursor-pointer transition-colors ${
                        selectedScenario?.id === s.id ?
                          'border-black' :
                          'border-gray-300 hover:border-gray-600'
                      }`}
                      onClick={() => {
                        onSelectScenario(s);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="text-sm mb-1 italic">{setting}</div>
                        <div className="h-36 overflow-y-auto text-sm">{situationDescription}</div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        )}
      </TabsContent>

      <TabsContent value="custom">
        <div className="flex flex-col gap-4 mb-10">
          <div>
            <label htmlFor="custom-scenario-setting" className="block mb-2">
              {t('scenarioForm.setting')}
            </label>
            <Input
              id="custom-scenario-setting"
              value={customScenario.settingCs ?? ''}
              onChange={(e) => {
                onCustomScenarioChange((prev) => ({
                  ...prev,
                  settingCs: e.target.value,
                  settingEn: e.target.value,
                }));
              }}
              className="bg-transparent border-2 border-gray-400"
              placeholder={t('scenarioForm.placeholder.setting')}
            />
          </div>
          <div>
            <label htmlFor="custom-scenario-description" className="block mb-2">
              {t('scenarioForm.description')}
            </label>
            <Textarea
              id="custom-scenario-description"
              value={customScenario.situationDescriptionCs ?? ''}
              onChange={(e) => {
                onCustomScenarioChange((prev) => ({
                  ...prev,
                  situationDescriptionCs: e.target.value,
                  situationDescriptionEn: e.target.value,
                }));
              }}
              className="bg-transparent border-2 border-gray-400 h-40"
              placeholder={t('scenarioForm.placeholder.description')}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="none">
        <div className="mb-10 text-gray-500 italic">{t('scenarios.noneDescription')}</div>
      </TabsContent>
    </Tabs>
  );
};
