import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';
import { Card, CardContent, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { PersonalityModel } from '@repo/frontend-utils/src/models';
import { PersonalityTabKey } from '../../lib/customConversationOptions';
import { universalDescriptionForPersonality } from '../../lib/universalDescriptionMoreLanguages';

interface PersonalityPickerProps {
  personalities: PersonalityModel[];
  activeTab: PersonalityTabKey;
  onActiveTabChange: (tab: PersonalityTabKey) => void;
  selectedPersonality: PersonalityModel;
  onSelectPersonality: (personality: PersonalityModel) => void;
  customPersonality: Partial<PersonalityModel>;
  onCustomPersonalityChange: (updater: (prev: Partial<PersonalityModel>) => Partial<PersonalityModel>) => void;
}

/**
 * Personality picker with predefined / custom tabs.
 *
 * State lives in the parent because:
 *  - which personality is "current" affects scenario filtering
 *  - the chat-start logic needs to reach back into the parent
 */
export const PersonalityPicker: React.FC<PersonalityPickerProps> = ({
  personalities,
  activeTab,
  onActiveTabChange,
  selectedPersonality,
  onSelectPersonality,
  customPersonality,
  onCustomPersonalityChange,
}) => {
  const { t, language } = useTypedTranslation();

  return (
    <Tabs value={activeTab} onValueChange={(value) => {
      onActiveTabChange(value as PersonalityTabKey);
    }}>
      <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
        <TabsTrigger value="predefined">{t('personalities.predefined')}</TabsTrigger>
        <TabsTrigger value="custom">{t('personalities.custom')}</TabsTrigger>
      </TabsList>

      <TabsContent value="predefined">
        <div className="mb-10">
          <Carousel className="w-full">
            <CarouselContent>
              {personalities.map((p) => {
                const { problemSummary, personalityDescription } =
                  universalDescriptionForPersonality(p, language);

                return (
                  <CarouselItem key={p.id} className="md:basis-1/2 lg:basis-1/2">
                    <Card
                      className={`border-2 cursor-pointer transition-colors ${
                        selectedPersonality.id === p.id ?
                          'border-black' :
                          'border-gray-300 hover:border-gray-600'
                      }`}
                      onClick={() => {
                        onSelectPersonality(p);
                      }}
                    >
                      <CardContent className="text-center p-4">
                        <CardTitle className="text-2xl mb-2">
                          {p.name} ({p.age} {t('yearsOld')})
                        </CardTitle>
                        <div className="text-xl font-semibold mb-1">{problemSummary}</div>
                        <div className="h-60 overflow-y-auto">{personalityDescription}</div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </TabsContent>

      <TabsContent value="custom">
        <div className="flex flex-col gap-4 mb-10">
          <div>
            <label htmlFor="custom-personality-name" className="block mb-2">
              {t('personalityForm.name')}
            </label>
            <Input
              id="custom-personality-name"
              value={customPersonality.name ?? ''}
              onChange={(e) => {
                onCustomPersonalityChange((prev) => ({ ...prev, name: e.target.value }));
              }}
              placeholder={t('personalityForm.placeholder.name')}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="custom-age" className="block mb-2">
                {t('personalityForm.age')}
              </label>
              <Input
                id="custom-age"
                type="number"
                value={customPersonality.age ?? ''}
                onChange={(e) => {
                  onCustomPersonalityChange((prev) => ({ ...prev, age: Number(e.target.value) }));
                }}
                className="bg-transparent border-2 border-gray-400"
                placeholder={t('personalityForm.placeholder.age')}
              />
            </div>

            <div className="flex-1">
              <label className="block mb-2">{t('personalityForm.gender')}</label>
              <div className="flex gap-2">
                <Button
                  variant={customPersonality.gender === 'M' ? 'default' : 'outline'}
                  onClick={() => {
                    onCustomPersonalityChange((prev) => ({
                      ...prev,
                      gender: 'M',
                      openaiVoiceName: 'ash',
                    }));
                  }}
                >
                  {t('personalityForm.genderMale')}
                </Button>
                <Button
                  variant={customPersonality.gender === 'F' ? 'default' : 'outline'}
                  onClick={() => {
                    onCustomPersonalityChange((prev) => ({
                      ...prev,
                      gender: 'F',
                      openaiVoiceName: 'alloy',
                    }));
                  }}
                >
                  {t('personalityForm.genderFemale')}
                </Button>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="custom-problem" className="block mb-2">
              {t('personalityForm.problemDescription')}
            </label>
            <Input
              id="custom-problem"
              value={customPersonality.problemSummaryCs ?? ''}
              onChange={(e) => {
                onCustomPersonalityChange((prev) => ({
                  ...prev,
                  problemSummaryCs: e.target.value,
                  problemSummaryEn: e.target.value,
                }));
              }}
              placeholder={t('personalityForm.placeholder.problem')}
              className="bg-transparent border-2 border-gray-400"
            />
          </div>

          <div>
            <label htmlFor="custom-description" className="block mb-2">
              {t('personalityForm.fullDescription')}
            </label>
            <Textarea
              id="custom-description"
              value={customPersonality.personalityDescriptionCs ?? ''}
              onChange={(e) => {
                onCustomPersonalityChange((prev) => ({
                  ...prev,
                  personalityDescriptionCs: e.target.value,
                  personalityDescriptionEn: e.target.value,
                }));
              }}
              placeholder={t('personalityForm.placeholder.description')}
              className="bg-transparent border-2 border-gray-400 h-40"
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
