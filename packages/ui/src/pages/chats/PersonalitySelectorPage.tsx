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
import { ConversationRoleSelector } from '../../components/ConversationRoleSelector';
import { useAppStore } from '../../hooks/useAppStore';
import { useChatSetupStore } from '../../hooks/useChatSetupStore';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { LANGUAGE } from '@repo/frontend-utils/src/enums/Language';
import {
  createCustomPersonality,
  getScenario,
  getUserRoleName,
  PersonalityTabKey,
  ScenarioTabKey,
} from '../../lib/customConversationOptions';
import {
  universalDescriptionForPersonality,
  universalDescriptionForScenario,
} from '../../lib/universalDescriptionMoreLanguages';
import { ConversationRoleModel, PersonalityModel, ScenarioModel } from '@repo/frontend-utils/src/models';


export const PersonalitySelectorPage: React.FC = () => {
  const { t, language } = useTypedTranslation();
  const predefinedPersonalitiesRaw = useAppStore((s) => s.personalities);
  const predefinedConversationRoles = useAppStore((s) => s.conversationRoles);
  const predefinedScenarios = useAppStore((s) => s.scenarios);
  const realtimeModelId = useAppStore((s) => s.appConfig.realtimeModelId);
  const realtimeTranscriptionModelId = useAppStore((s) => s.appConfig.realtimeTranscriptionModelId);
  const responseModelId = useAppStore((s) => s.appConfig.responseModelId);
  const ttsModelId = useAppStore((s) => s.appConfig.ttsModelId);
  const timestampedTranscriptionModelId = useAppStore((s) => s.appConfig.timestampedTranscriptionModelId);
  const setChatSetup = useChatSetupStore((s) => s.setSetup);
  const predefinedPersonalities = useMemo(
    () => predefinedPersonalitiesRaw.toSorted((a, b) => a.id - b.id),
    [predefinedPersonalitiesRaw],
  );
  const navigate = useNavigate();
  const [customPersonality, setCustomPersonality] = useState<Partial<PersonalityModel>>({});
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityModel>(
    predefinedPersonalities[0],
  );
  const [activePersonalityTab, setActivePersonalityTab] = useState<PersonalityTabKey>('predefined');
  const [customScenario, setCustomScenario] = useState<Partial<ScenarioModel>>({});
  const [selectedScenario, setSelectedScenario] = useState<ScenarioModel>();
  const [activeScenarioTab, setActiveScenarioTab] = useState<ScenarioTabKey>('none');
  const isVoiceCallEnabled = realtimeModelId !== null;
  const isVideoCallEnabled =
    realtimeTranscriptionModelId !== null &&
    responseModelId !== null &&
    ttsModelId !== null &&
    timestampedTranscriptionModelId !== null;
  const isMessageChatEnabled = responseModelId !== null;

  const scenariosForPersonality = useMemo(() =>
    predefinedScenarios.filter(
      (sc) => sc.involvedPersonalityId === selectedPersonality.id,
    ), [selectedPersonality, predefinedScenarios]);

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
  const [selectedUserRole, setSelectedUserRole] = useState<ConversationRoleModel | undefined>(
    predefinedConversationRoles[0],
  );

  const handleRoleChange = (roleName: string) => {
    const found = predefinedConversationRoles.find((r) => {
      const translated = language === LANGUAGE.EN ? r.nameEn : r.nameCs;
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

  const selectPersonality = (p: PersonalityModel) => {
    setSelectedPersonality(p);
    setSelectedScenario(undefined);
    setCustomScenario({ ...customScenario, involvedPersonalityId: p.id });
  };


  const storeAndNavigate = (path: string) => {
    const finalPersonality = activePersonalityTab === 'predefined' ?
      selectedPersonality :
      createCustomPersonality(customPersonality);

    const finalUserRoleName = getUserRoleName(selectedUserRole, customUserRoleName, language);
    const finalScenario = getScenario(activeScenarioTab, selectedScenario, customScenario);

    setChatSetup({
      personality: finalPersonality,
      conversationRoleName: finalUserRoleName,
      scenario: finalScenario,
    });

    void navigate('/chat' + path);
  };


  const isStartButtonDisabled = () => {
    const hasPersonality =
            activePersonalityTab === 'predefined' ||
            !!customPersonality.name;

    const hasUserRole = !!selectedUserRole || customUserRoleName.trim() !== '';

    const hasScenario =
            activeScenarioTab === 'none' ||
            (activeScenarioTab === 'predefined' && !!selectedScenario) ||
            activeScenarioTab === 'custom';

    return !(hasPersonality && hasUserRole && hasScenario);
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto border-2 rounded-lg p-8">
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
                          role="button"
                          tabIndex={0}
                          aria-pressed={selectedPersonality.id === p.id}
                          className={`border-2 cursor-pointer transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                            selectedPersonality.id === p.id ?
                              'border-primary' :
                              'border-border hover:border-muted-foreground'
                          }`}
                          onClick={() => {
                            selectPersonality(p);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              selectPersonality(p);
                            }
                          }}
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
                  value={customPersonality.name ?? ''}
                  onChange={(e) => {
                    setCustomPersonality({ ...customPersonality, name: e.target.value });
                  }
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
                    onChange={(e) => {
                      setCustomPersonality({
                        ...customPersonality,
                        age: Number(e.target.value),
                      });
                    }
                    }
                    placeholder={t('personalityForm.placeholder.age')}
                  />
                </div>

                <div className="flex-1">
                  <span id="custom-gender-label" className="block mb-2">
                    {t('personalityForm.gender')}
                  </span>
                  <div className="flex gap-2" role="group" aria-labelledby="custom-gender-label">
                    <Button
                      variant={customPersonality.gender === 'M' ? 'default' : 'outline'}
                      aria-pressed={customPersonality.gender === 'M'}
                      onClick={() => {
                        setCustomPersonality({
                          ...customPersonality,
                          gender: 'M',
                          openaiVoiceName: 'ash',
                        });
                      }
                      }
                    >
                      {t('personalityForm.genderMale')}
                    </Button>
                    <Button
                      variant={customPersonality.gender === 'F' ? 'default' : 'outline'}
                      aria-pressed={customPersonality.gender === 'F'}
                      onClick={() => {
                        setCustomPersonality({
                          ...customPersonality,
                          gender: 'F',
                          openaiVoiceName: 'alloy',
                        });
                      }
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
                  value={customPersonality.problemSummaryCs ?? ''}
                  onChange={(e) => {
                    setCustomPersonality({
                      ...customPersonality,
                      problemSummaryCs: e.target.value,
                      problemSummaryEn: e.target.value,
                    });
                  }
                  }
                  placeholder={t('personalityForm.placeholder.problem')}
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
                    setCustomPersonality({
                      ...customPersonality,
                      personalityDescriptionCs: e.target.value,
                      personalityDescriptionEn: e.target.value,
                    });
                  }
                  }
                  placeholder={t('personalityForm.placeholder.description')}
                  className="h-40"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <h2 className="text-2xl mb-8">{t('selectScenario')}</h2>

        <Tabs value={activeScenarioTab} onValueChange={(v) => {
          setActiveScenarioTab(v as ScenarioTabKey);
        }}>
          <TabsList className={`grid w-full max-w-md mb-6 ${activePersonalityTab === 'custom' ? 'grid-cols-2' : 'grid-cols-3'}`}>
            <TabsTrigger value="none">{t('scenarios.none')}</TabsTrigger>
            {activePersonalityTab === 'predefined' && (
              <TabsTrigger value="predefined">{t('scenarios.predefined')}</TabsTrigger>
            )}
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
                          role="button"
                          tabIndex={0}
                          aria-pressed={selectedScenario?.id === s.id}
                          className={`border-2 cursor-pointer transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                            selectedScenario?.id === s.id ?
                              'border-primary' :
                              'border-border hover:border-muted-foreground'
                          }`}
                          onClick={() => {
                            setSelectedScenario(s);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedScenario(s);
                            }
                          }}
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
                  value={customScenario.settingCs ?? ''}
                  onChange={(e) => {
                    setCustomScenario({
                      ...customScenario,
                      settingCs: e.target.value,
                      settingEn: e.target.value,
                    });
                  }
                  }
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
                    setCustomScenario({
                      ...customScenario,
                      situationDescriptionCs: e.target.value,
                      situationDescriptionEn: e.target.value,
                    });
                  }
                  }
                  className="h-40"
                  placeholder={t('scenarioForm.placeholder.description')}
                />
              </div>
            </div>
          </TabsContent>

          {/* no scenario chosen */}
          <TabsContent value="none">
            <div className="mb-10 text-muted-foreground italic">{t('scenarios.noneDescription')}</div>
          </TabsContent>
        </Tabs>

        <h2 className="text-2xl mt-10">{t('roleHeading')}</h2>
        <ConversationRoleSelector
          predefinedRoles={predefinedConversationRoles}
          value={selectedUserRole ? (language === LANGUAGE.EN ? selectedUserRole.nameEn : selectedUserRole.nameCs) : customUserRoleName}
          onChange={handleRoleChange}
        />

        <h2 className="text-2xl mb-4 mt-12">{t('conversationHeading')}</h2>
        <div className="flex gap-4 flex-wrap">
          {
            isVoiceCallEnabled && (<Button
              onClick={() => {
                storeAndNavigate('/voice-call');
              }}
              disabled={isStartButtonDisabled()}
              className="px-8 py-6 text-xl bg-green-700 hover:bg-green-800 text-white rounded-md flex items-center"
            >
              <span className="mr-2">{t('actions.startVoiceCall')}</span>
              <MdOutlinePhoneInTalk className="inline-block align-middle"/>
            </Button>
            )
          }
          {
            isVideoCallEnabled && (<Button
              onClick={() => {
                storeAndNavigate('/video-call');
              }}
              disabled={isStartButtonDisabled()}
              className="px-8 py-6 text-xl bg-green-700 hover:bg-green-800 text-white rounded-md flex items-center"
            >
              <span className="mr-2">{t('actions.startVideoCall')}</span>
              <FaVideo/>
            </Button>)
          }
          {
            isMessageChatEnabled && <Button
              onClick={() => {
                storeAndNavigate('/message-chat');
              }}
              disabled={isStartButtonDisabled()}
              className="px-8 py-6 text-xl bg-green-700 hover:bg-green-800 text-white rounded-md flex items-center"
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


