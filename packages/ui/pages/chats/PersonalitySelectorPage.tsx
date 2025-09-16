import React, { useMemo, useState } from 'react';
import { MdOutlinePhoneInTalk } from 'react-icons/md';
import { FaVideo } from 'react-icons/fa';
import { IoMdSend } from 'react-icons/io';
import { useNavigate } from 'react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../../components/ui/carousel';
import { Card, CardContent, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { ConversationRole, Personality, Scenario } from '@repo/shared/types/supabase/supabaseTypeHelpers';
import { ConversationRoleSelector } from '../../components/ConversationRoleSelector';
import { useAppStore } from '../../hooks/useAppStore';
import { ChatPageProps } from '../../lib/types/ChatPageProps';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { LANGUAGE } from '@repo/shared/enums/Language';
import {
  createCustomPersonality,
  getScenario,
  getUserRoleName,
  PersonalityTabKey,
  ScenarioTabKey,
} from '@repo/shared/utils/customConversationOptions';
import {
  universalDescriptionForPersonality,
  universalDescriptionForScenario,
} from '@repo/shared/utils/universalDescriptionMoreLanguages';


export const PersonalitySelectorPage: React.FC = () => {
  const { t, language } = useTypedTranslation();
  const predefinedPersonalities = useAppStore((s) => s.personalities).toSorted(
    (a, b) => a.id - b.id,
  );
  const predefinedConversationRoles = useAppStore((s) => s.conversationRoles);
  const predefinedScenarios = useAppStore((s) => s.scenarios);
  const { appConfig } = useAppStore((s) => s);
  const navigate = useNavigate();
  const [customPersonality, setCustomPersonality] = useState<Partial<Personality>>({});
  const [selectedPersonality, setSelectedPersonality] = useState<Personality>(
    predefinedPersonalities[0],
  );
  const [activePersonalityTab, setActivePersonalityTab] = useState<PersonalityTabKey>('predefined');
  const [customScenario, setCustomScenario] = useState<Partial<Scenario>>({});
  const [selectedScenario, setSelectedScenario] = useState<Scenario>();
  const [activeScenarioTab, setActiveScenarioTab] = useState<ScenarioTabKey>('none');
  const isVoiceCallEnabled = appConfig.realtime_model_id !== null;
  const isVideoCallEnabled = appConfig.realtime_transcription_model_id !== null && appConfig.response_model_id !== null && appConfig.tts_model_id !== null && appConfig.timestamped_transcription_model_id !== null;
  const isMessageChatEnabled = appConfig.response_model_id !== null;

  const scenariosForPersonality = useMemo(() => {
    if (!selectedPersonality) return [];
    return predefinedScenarios.filter(
      (sc) => sc.involved_personality_id === selectedPersonality.id,
    );
  }, [selectedPersonality, predefinedScenarios]);

  const switchPersonalityTab = (value: string): void => {
    const tab = value as PersonalityTabKey;
    setActivePersonalityTab(tab);
    if (tab === 'predefined') {
      setSelectedPersonality(predefinedPersonalities[0]);
    } else {
      setSelectedScenario(undefined);
      setActiveScenarioTab('none');
    }
  };

  const [customUserRoleName, setCustomUserRoleName] = useState<string>('');
  const [selectedUserRole, setSelectedUserRole] = useState<ConversationRole | undefined>(
    predefinedConversationRoles[0],
  );

  const handleRoleChange = (roleName: string) => {
    const found = predefinedConversationRoles.find((r) => {
      const translated = language === LANGUAGE.EN ? r.name_en : r.name_cs;
      return translated === roleName;
    });

    if (found) {
      setSelectedUserRole(found);
      setCustomUserRoleName('');
    } else {
      setSelectedUserRole(undefined);
      setCustomUserRoleName(roleName);
    }
  };

  const selectPersonality = (p: Personality) => {
    setSelectedPersonality(p);
    setSelectedScenario(undefined);
    setCustomScenario({ ...customScenario, involved_personality_id: p.id });
  };


  const storeAndNavigate = (path: string) => {
    const finalPersonality = activePersonalityTab === 'predefined' ?
      selectedPersonality :
      createCustomPersonality(customPersonality);

    const finalUserRoleName = getUserRoleName(selectedUserRole, customUserRoleName, language);
    const finalScenario = getScenario(activeScenarioTab, selectedScenario, customScenario);

    const chatPageProps: ChatPageProps = {
      personality: finalPersonality,
      conversationRoleName: finalUserRoleName,
      scenario: finalScenario,
    };

    navigate('/chat' + path, { state: chatPageProps });
  };


  const isStartButtonDisabled = () => {
    const hasPersonality =
            (activePersonalityTab === 'predefined' && !!selectedPersonality) ||
            (activePersonalityTab === 'custom' && !!customPersonality.name);

    const hasUserRole = !!selectedUserRole || customUserRoleName.trim() !== '';

    const hasScenario =
            activeScenarioTab === 'none' ||
            (activeScenarioTab === 'predefined' && !!selectedScenario) ||
            activeScenarioTab === 'custom';

    return !(hasPersonality && hasUserRole && hasScenario);
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center bg-background text-foreground">
      <div className="w-full max-w-4xl mx-auto border border-border rounded-lg bg-card p-6 sm:p-8 text-card-foreground">
        <h1 className="text-3xl font-bold mb-6">{t('hello')}</h1>
        <h2 className="text-2xl mb-8">{t('selectAvatarPersonality')}</h2>

        <Tabs defaultValue="predefined" onValueChange={switchPersonalityTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="predefined">
              {t('personalities.predefined')}
            </TabsTrigger>
            <TabsTrigger value="custom">
              {t('personalities.custom')}
            </TabsTrigger>
          </TabsList>

          {/* predefined personalities carousel */}
          <TabsContent value="predefined">
            <div className="mb-10">
              <Carousel className="w-full">
                <CarouselContent>
                  {predefinedPersonalities.map((p) => {
                    const {
                      problemSummary,
                      personalityDescription,
                    } = universalDescriptionForPersonality(p, language);


                    return (
                      <CarouselItem
                        key={p.id}
                        className="md:basis-1/2 lg:basis-1/2"
                      >
                        <Card
                          className={`cursor-pointer transition-colors rounded-xl border ${
                            selectedPersonality?.id === p.id ?
                              'border-primary ring-2 ring-primary/40' :
                              'border-border hover:border-primary/60'
                          }`}
                          onClick={() => selectPersonality(p)}
                        >
                          <CardContent className="text-center p-4">
                            <CardTitle className="text-2xl mb-2">
                              {p.name} ({p.age} {t('yearsOld')})
                            </CardTitle>
                            <div className="text-xl font-semibold mb-1">
                              {problemSummary}
                            </div>
                            <div className="h-60 overflow-y-auto">
                              {personalityDescription}
                            </div>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselPrevious/>
                <CarouselNext/>
              </Carousel>
            </div>
          </TabsContent>

          {/* CUSTOM personality form */}
          <TabsContent value="custom">
            <div className="flex flex-col gap-4 mb-10">
              <div>
                <label htmlFor="custom-personality-name" className="block mb-2">
                  {t('personalityForm.name')}
                </label>
                <Input
                  id="custom-personality-name"
                  value={customPersonality.name}
                  onChange={(e) =>
                    setCustomPersonality({ ...customPersonality, name: e.target.value })
                  }
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
                    onChange={(e) =>
                      setCustomPersonality({
                        ...customPersonality,
                        age: Number(e.target.value),
                      })
                    }
                    className="border-border"
                    placeholder={t('personalityForm.placeholder.age')}
                  />
                </div>

                <div className="flex-1">
                  <label className="block mb-2">
                    {t('personalityForm.gender')}
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant={customPersonality.gender === 'M' ? 'default' : 'outline'}
                      onClick={() =>
                        setCustomPersonality({
                          ...customPersonality,
                          gender: 'M',
                          openai_voice_name: 'onyx',
                        })
                      }
                    >
                      {t('personalityForm.genderMale')}
                    </Button>
                    <Button
                      variant={customPersonality.gender === 'F' ? 'default' : 'outline'}
                      onClick={() =>
                        setCustomPersonality({
                          ...customPersonality,
                          gender: 'F',
                          openai_voice_name: 'alloy',
                        })
                      }
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
                  value={customPersonality.problem_summary_cs ?? ''}
                  onChange={(e) =>
                    setCustomPersonality({
                      ...customPersonality,
                      problem_summary_cs: e.target.value,
                      problem_summary_en: e.target.value,
                    })
                  }
                  placeholder={t('personalityForm.placeholder.problem')}
                  className="border-border"
                />
              </div>

              <div>
                <label htmlFor="custom-description" className="block mb-2">
                  {t('personalityForm.fullDescription')}
                </label>
                <Textarea
                  id="custom-description"
                  value={customPersonality.personality_description_cs ?? ''}
                  onChange={(e) =>
                    setCustomPersonality({
                      ...customPersonality,
                      personality_description_cs: e.target.value,
                      personality_description_en: e.target.value,
                    })
                  }
                  placeholder={t('personalityForm.placeholder.description')}
                  className="h-40 border border-border"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <h2 className="text-2xl mb-8">{t('selectScenario')}</h2>

        <Tabs defaultValue={activeScenarioTab} onValueChange={(v) => setActiveScenarioTab(v as any)}>
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
            <TabsTrigger value="none">{t('scenarios.none')}</TabsTrigger>
            <TabsTrigger value="predefined">{t('scenarios.predefined')}</TabsTrigger>
            <TabsTrigger value="custom">{t('scenarios.custom')}</TabsTrigger>
          </TabsList>

          {/* predefined scenario carousel */}
          <TabsContent value="predefined">
            {scenariosForPersonality.length === 0 ? (
              <p className="text-muted-foreground mb-10">{t('scenarios.noneForPersonality')}</p>
            ) : (
              <Carousel className="w-full mb-10">
                <CarouselContent>
                  {scenariosForPersonality.map((s) => {
                    const {
                      situationDescription,
                      setting,
                    } = universalDescriptionForScenario(s, language);
                    return (
                      <CarouselItem key={s.id} className="md:basis-1/2 lg:basis-1/2">
                        <Card
                          className={`cursor-pointer transition-colors rounded-xl border ${
                            selectedScenario?.id === s.id ?
                              'border-primary ring-2 ring-primary/40' :
                              'border-border hover:border-primary/60'
                          }`}
                          onClick={() => setSelectedScenario(s)}
                        >
                          <CardContent className="p-4">
                            <div className="text-sm mb-1 italic">{setting}</div>
                            <div
                              className="h-36 overflow-y-auto text-sm">{situationDescription}</div>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselPrevious/>
                <CarouselNext/>
              </Carousel>
            )}
          </TabsContent>

          {/* custom scenario form */}
          <TabsContent value="custom">
            <div className="flex flex-col gap-4 mb-10">
              <div>
                <label htmlFor="custom-scenario-setting" className="block mb-2">
                  {t('scenarioForm.setting')}
                </label>
                <Input
                  id="custom-scenario-setting"
                  value={customScenario.setting_cs ?? ''}
                  onChange={(e) =>
                    setCustomScenario({
                      ...customScenario,
                      setting_cs: e.target.value,
                      setting_en: e.target.value,
                    })
                  }
                  className="border-border"
                  placeholder={t('scenarioForm.placeholder.setting')}
                />
              </div>
              <div>
                <label htmlFor="custom-scenario-description" className="block mb-2">
                  {t('scenarioForm.description')}
                </label>
                <Textarea
                  id="custom-scenario-description"
                  value={customScenario.situation_description_cs ?? ''}
                  onChange={(e) =>
                    setCustomScenario({
                      ...customScenario,
                      situation_description_cs: e.target.value,
                      situation_description_en: e.target.value,
                    })
                  }
                  className="h-40 border border-border"
                  placeholder={t('scenarioForm.placeholder.description')}
                />
              </div>
            </div>
          </TabsContent>

          {/* no scenario chosen */}
          <TabsContent value="none">
            <div className="mb-10 italic text-muted-foreground">{t('scenarios.noneDescription')}</div>
          </TabsContent>
        </Tabs>

        <h2 className="text-2xl mt-10">{t('roleHeading')}</h2>
        <ConversationRoleSelector
          predefinedRoles={predefinedConversationRoles}
          value={selectedUserRole ? (language === LANGUAGE.EN ? selectedUserRole.name_en : selectedUserRole.name_cs) : customUserRoleName}
          onChange={handleRoleChange}
        />

        <h2 className="text-2xl mb-4 mt-12">{t('conversationHeading')}</h2>
        <div className="flex gap-4 flex-wrap">
          {
            isVoiceCallEnabled && (<Button
              onClick={() => storeAndNavigate('/voice-call')}
              disabled={isStartButtonDisabled()}
              className="px-8 py-6 text-xl bg-green-700 hover:bg-green-600 text-white rounded-md flex items-center"
            >
              <span className="mr-2">{t('actions.startVoiceCall')}</span>
              <MdOutlinePhoneInTalk className="inline-block align-middle"/>
            </Button>
            )
          }
          {
            isVideoCallEnabled && (<Button
              onClick={() => storeAndNavigate('/video-call')}
              disabled={isStartButtonDisabled()}
              className="px-8 py-6 text-xl bg-green-700 hover:bg-green-600 text-white rounded-md flex items-center"
            >
              <span className="mr-2">{t('actions.startVideoCall')}</span>
              <FaVideo/>
            </Button>)
          }
          {
            isMessageChatEnabled && <Button
              onClick={() => storeAndNavigate('/message-chat')}
              disabled={isStartButtonDisabled()}
              className="px-8 py-6 text-xl bg-green-700 hover:bg-green-600 text-white rounded-md flex items-center"
            >
              <span className="mr-2">{t('actions.startMessageChat')}</span>
              <IoMdSend size={20}/>
            </Button>
          }

        </div>
      </div>
    </div>
  );
};


