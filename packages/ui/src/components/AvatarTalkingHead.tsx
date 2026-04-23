import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Loader } from 'lucide-react';
import { AVATAR_MODELS, TalkingHead } from '@repo/assets';
import { TextToSpeechTimestampedResponseDto } from '@repo/frontend-utils/src/clients/generated';
import { Language } from '@repo/frontend-utils/src/enums/Language';
import { PersonalityModel } from '@repo/frontend-utils/src/models';

interface AvatarTalkingHeadProps {
    language: Language;
    personality: PersonalityModel
}

type TalkingHeadSpeechAudio = Omit<TextToSpeechTimestampedResponseDto, 'audio'> & {
    audio: ArrayBuffer[];
};

export interface AvatarTalkingHeadHandle {
    speakAudio: (audio: TextToSpeechTimestampedResponseDto) => void;
}

function b64ToArrayBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const length = binary.length;
  const buffer = new ArrayBuffer(length);
  const view = new Uint8Array(buffer);

  for (let index = 0; index < length; index += 1) {
    view[index] = binary.charCodeAt(index);
  }

  return buffer;
}

function toTalkingHeadSpeechAudio(audio: TextToSpeechTimestampedResponseDto): TalkingHeadSpeechAudio {
  return {
    ...audio,
    audio: audio.audio.map(b64ToArrayBuffer),
  };
}

export const AvatarTalkingHead = forwardRef<
    AvatarTalkingHeadHandle,
    AvatarTalkingHeadProps
>((props, ref) => {
  const avatarContainerRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<TalkingHead | null>(null);
  const [isAvatarLoaded, setIsAvatarLoaded] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading avatar...');

  // Expose the speakAudio function to the parent
  useImperativeHandle(ref, () => ({
    speakAudio: (audio: TextToSpeechTimestampedResponseDto) => {
      if (headRef.current) {
        headRef.current.speakAudio(toTalkingHeadSpeechAudio(audio));
      }
    },
  }));

  const getDefaultAvatarUrl = (personality: PersonalityModel): string => {
    return personality.sex === 'M' ? AVATAR_MODELS.MALE_TEEN : AVATAR_MODELS.FEMALE_TEEN;
  };

  const loadAvatar = async (avatarUrl: string, language: Language, isRetry = false): Promise<void> => {
    if (!headRef.current || !avatarContainerRef.current) {
      throw new Error('Avatar container or TalkingHead not initialized');
    }

    const loadingPrefix = isRetry ? 'Loading default avatar' : 'Loading avatar';

    const completeUrl = avatarUrl.endsWith('.glb') ? avatarUrl : `${avatarUrl}.glb`;

    await headRef.current.showAvatar(
      {
        url: completeUrl,
        body: props.personality.sex,
        avatarMood: 'neutral',
        lipsyncLang: language.ISO639,
      },
      (ev: {
                lengthComputable: boolean;
                loaded: number;
                total: number;
            }) => {
        if (ev.lengthComputable) {
          const percent = Math.min(
            100,
            Math.round((ev.loaded / ev.total) * 100),
          );
          setLoadingMessage(`${loadingPrefix} ${percent}%`);
        }
        if (!headRef.current) {
          throw new Error('Head reference is null during avatar loading');
        }
        return headRef.current;
      },
    );
  };

  useEffect(() => {
    const initializeAvatar = async () => {
      if (avatarContainerRef.current && !headRef.current) {
        try {
          const { personality, language } = props;

          // Initialize TalkingHead
          headRef.current = new TalkingHead(avatarContainerRef.current, {
            lipsyncModules: [language.ISO639],
            ttsEndpoint: '/gtts/',
            cameraView: 'upper',
          });

          // Determine the avatar URL to try first
          const customAvatarUrl = personality.avatarUrl && personality.avatarUrl.trim() !== '' ?
            personality.avatarUrl :
            null;

          const defaultAvatarUrl = getDefaultAvatarUrl(personality);

          try {
            // First attempt: try custom avatar URL if it exists, otherwise use default
            const primaryAvatarUrl = customAvatarUrl ?? defaultAvatarUrl;
            await loadAvatar(primaryAvatarUrl, language, false);
            setIsAvatarLoaded(true);
          } catch (primaryError) {
            console.warn('Failed to load primary avatar:', primaryError);

            // Second attempt: if we tried a custom avatar and it failed, try the default
            if (customAvatarUrl && customAvatarUrl !== defaultAvatarUrl) {
              try {
                console.log('Attempting to load default avatar as fallback...');
                setLoadingMessage('Loading default avatar...');
                await loadAvatar(defaultAvatarUrl, language, true);
                setIsAvatarLoaded(true);
              } catch (fallbackError) {
                console.error('Failed to load fallback avatar:', fallbackError);
                throw new Error(`Failed to load both custom and default avatars. Primary: ${String(primaryError)}. Fallback: ${String(fallbackError)}`);
              }
            } else {
              // If we already tried the default avatar and it failed, throw the error
              throw primaryError;
            }
          }
        } catch (error) {
          console.error('Error initializing avatar:', error);
          setLoadingMessage(`Failed to load avatar: ${String(error)}`);
        }
      }
    };

    void initializeAvatar();

    // Cleanup
    return () => {
      if (headRef.current) {
        headRef.current.stop();
      }
    };
  }, [props.language]);

  return (
    <div
      ref={avatarContainerRef}
      style={{ maxHeight: '550px' }}
      className="w-full h-full bg-gray-900 rounded-lg shadow-md"
    >
      {!isAvatarLoaded && (
        <div className="flex items-center justify-center h-full text-white">
          <Loader className="animate-spin mr-2" size={20}/>
          <span>{loadingMessage}</span>
        </div>
      )}
    </div>
  );
});
AvatarTalkingHead.displayName = 'AvatarTalkingHead';
