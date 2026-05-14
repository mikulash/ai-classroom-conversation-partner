import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
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
import { ConversationRoleModel, PersonalityModel, ScenarioModel } from '@repo/frontend-utils/src/models';
import { PersonalityPicker } from '../../components/chat/PersonalityPicker';
import { ScenarioPicker } from '../../components/chat/ScenarioPicker';
import { StartConversationButtons } from '../../components/chat/StartConversationButtons';

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
  const navigate = useNavigate();

  const predefinedPersonalities = useMemo(
    () => predefinedPersonalitiesRaw.toSorted((a, b) => a.id - b.id),
    [predefinedPersonalitiesRaw],
  );

  // Personality state
  const [customPersonality, setCustomPersonality] = useState<Partial<PersonalityModel>>({});
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityModel>(
    predefinedPersonalities[0],
  );
  const [activePersonalityTab, setActivePersonalityTab] = useState<PersonalityTabKey>('predefined');

  // Scenario state
  const [customScenario, setCustomScenario] = useState<Partial<ScenarioModel>>({});
  const [selectedScenario, setSelectedScenario] = useState<ScenarioModel>();
  const [activeScenarioTab, setActiveScenarioTab] = useState<ScenarioTabKey>('none');

  // User role state
  const [customUserRoleName, setCustomUserRoleName] = useState<string>('');
  const [selectedUserRole, setSelectedUserRole] = useState<ConversationRoleModel | undefined>(
    predefinedConversationRoles[0],
  );

  const isVoiceCallEnabled = realtimeModelId !== null;
  const isVideoCallEnabled =
    realtimeTranscriptionModelId !== null &&
    responseModelId !== null &&
    ttsModelId !== null &&
    timestampedTranscriptionModelId !== null;
  const isMessageChatEnabled = responseModelId !== null;

  const scenariosForPersonality = useMemo(
    () => predefinedScenarios.filter((sc) => sc.involvedPersonalityId === selectedPersonality.id),
    [selectedPersonality, predefinedScenarios],
  );

  const switchPersonalityTab = (tab: PersonalityTabKey): void => {
    setActivePersonalityTab(tab);
    if (tab === 'predefined') {
      setSelectedPersonality(predefinedPersonalities[0]);
    } else {
      // Custom personalities don't have predefined scenarios attached.
      setSelectedScenario(undefined);
      setActiveScenarioTab('none');
    }
  };

  const selectPersonality = (p: PersonalityModel) => {
    setSelectedPersonality(p);
    setSelectedScenario(undefined);
    setCustomScenario((prev) => ({ ...prev, involvedPersonalityId: p.id }));
  };

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
    const hasPersonality = activePersonalityTab === 'predefined' || !!customPersonality.name;
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

        <PersonalityPicker
          personalities={predefinedPersonalities}
          activeTab={activePersonalityTab}
          onActiveTabChange={switchPersonalityTab}
          selectedPersonality={selectedPersonality}
          onSelectPersonality={selectPersonality}
          customPersonality={customPersonality}
          onCustomPersonalityChange={setCustomPersonality}
        />

        <h2 className="text-2xl mb-8">{t('selectScenario')}</h2>

        <ScenarioPicker
          scenariosForPersonality={scenariosForPersonality}
          activeTab={activeScenarioTab}
          onActiveTabChange={setActiveScenarioTab}
          selectedScenario={selectedScenario}
          onSelectScenario={setSelectedScenario}
          customScenario={customScenario}
          onCustomScenarioChange={setCustomScenario}
          hidePredefinedTab={activePersonalityTab === 'custom'}
        />

        <h2 className="text-2xl mt-10">{t('roleHeading')}</h2>
        <ConversationRoleSelector
          predefinedRoles={predefinedConversationRoles}
          value={
            selectedUserRole ?
              (language === LANGUAGE.EN ? selectedUserRole.nameEn : selectedUserRole.nameCs) :
              customUserRoleName
          }
          onChange={handleRoleChange}
        />

        <h2 className="text-2xl mb-4 mt-12">{t('conversationHeading')}</h2>
        <StartConversationButtons
          disabled={isStartButtonDisabled()}
          isVoiceCallEnabled={isVoiceCallEnabled}
          isVideoCallEnabled={isVideoCallEnabled}
          isMessageChatEnabled={isMessageChatEnabled}
          onStartVoiceCall={() => {
            storeAndNavigate('/voice-call');
          }}
          onStartVideoCall={() => {
            storeAndNavigate('/video-call');
          }}
          onStartMessageChat={() => {
            storeAndNavigate('/message-chat');
          }}
        />
      </div>
    </div>
  );
};
