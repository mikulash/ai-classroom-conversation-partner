import { LipSyncAudio } from '@repo/shared/types/talkingHead';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Loader } from 'lucide-react';
import { AVATAR_MODELS, TalkingHead } from '@repo/assets';
import { Personality } from '@repo/shared/types/supabase/supabaseTypeHelpers';
import { LANGUAGE, Language } from '@repo/shared/enums/Language';

interface AvatarTalkingHeadProps {
    language?: Language;
    personality: Personality
}

export interface AvatarTalkingHeadHandle {
    speakAudio: (audio: LipSyncAudio) => void;
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
    speakAudio: (audio: LipSyncAudio) => {
      if (headRef.current) {
        headRef.current.speakAudio(audio);
      }
    },
  }));

  const getDefaultAvatarUrl = (personality: Personality): string => {
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
        return headRef.current!;
      },
    );
  };

  useEffect(() => {
    const initializeAvatar = async () => {
      if (avatarContainerRef.current && !headRef.current) {
        try {
          const { personality } = props;
          const language = props.language || LANGUAGE.CS;

          // Initialize TalkingHead
          headRef.current = new TalkingHead(avatarContainerRef.current, {
            lipsyncModules: [language.ISO639],
            ttsEndpoint: '/gtts/',
            cameraView: 'upper',
          });

          // Determine the avatar URL to try first
          const customAvatarUrl = personality.avatar_url && personality.avatar_url.trim() !== '' ?
            personality.avatar_url :
            null;

          const defaultAvatarUrl = getDefaultAvatarUrl(personality);

          try {
            // First attempt: try custom avatar URL if it exists, otherwise use default
            const primaryAvatarUrl = customAvatarUrl || defaultAvatarUrl;
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
                throw new Error(`Failed to load both custom and default avatars. Primary: ${primaryError}. Fallback: ${fallbackError}`);
              }
            } else {
              // If we already tried the default avatar and it failed, throw the error
              throw primaryError;
            }
          }
        } catch (error) {
          console.error('Error initializing avatar:', error);
          setLoadingMessage(`Failed to load avatar: ${error}`);
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
      className="w-full h-full bg-card text-card-foreground rounded-lg shadow-md border border-border"
    >
      {!isAvatarLoaded && (
        <div className="flex items-center justify-center h-full text-foreground">
          <Loader className="animate-spin mr-2" size={20}/>
          <span>{loadingMessage}</span>
        </div>
      )}
    </div>
  );
});
AvatarTalkingHead.displayName = 'AvatarTalkingHead';
