import React from 'react';
import { MdOutlinePhoneInTalk } from 'react-icons/md';
import { FaVideo } from 'react-icons/fa';
import { IoMdSend } from 'react-icons/io';
import { Button } from '../ui/button';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';

interface StartConversationButtonsProps {
  disabled: boolean;
  isVoiceCallEnabled: boolean;
  isVideoCallEnabled: boolean;
  isMessageChatEnabled: boolean;
  onStartVoiceCall: () => void;
  onStartVideoCall: () => void;
  onStartMessageChat: () => void;
}

/**
 * Action row that decides which "start ___" buttons to show based on
 * feature flags derived from `appConfig` in the parent.
 */
export const StartConversationButtons: React.FC<StartConversationButtonsProps> = ({
  disabled,
  isVoiceCallEnabled,
  isVideoCallEnabled,
  isMessageChatEnabled,
  onStartVoiceCall,
  onStartVideoCall,
  onStartMessageChat,
}) => {
  const { t } = useTypedTranslation();

  return (
    <div className="flex gap-4 flex-wrap">
      {isVoiceCallEnabled && (
        <Button
          onClick={onStartVoiceCall}
          disabled={disabled}
          className="px-8 py-6 text-xl bg-green-700 hover:bg-green-600 text-white rounded-md flex items-center"
        >
          <span className="mr-2">{t('actions.startVoiceCall')}</span>
          <MdOutlinePhoneInTalk className="inline-block align-middle" />
        </Button>
      )}
      {isVideoCallEnabled && (
        <Button
          onClick={onStartVideoCall}
          disabled={disabled}
          className="px-8 py-6 text-xl bg-green-700 hover:bg-green-600 text-white rounded-md flex items-center"
        >
          <span className="mr-2">{t('actions.startVideoCall')}</span>
          <FaVideo />
        </Button>
      )}
      {isMessageChatEnabled && (
        <Button
          onClick={onStartMessageChat}
          disabled={disabled}
          className="px-8 py-6 text-xl bg-green-700 hover:bg-green-600 text-white rounded-md flex items-center"
        >
          <span className="mr-2">{t('actions.startMessageChat')}</span>
          <IoMdSend size={20} />
        </Button>
      )}
    </div>
  );
};
