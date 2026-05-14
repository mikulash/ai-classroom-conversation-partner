import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosProgressEvent } from 'axios';
import { personalityClient } from '@repo/frontend-utils/src/clients/db/personality.client';
import { PersonalityModel } from '@repo/frontend-utils/src/models';
import {
  CreatePersonalityDto,
  UpdatePersonalityDto,
} from '@repo/frontend-utils/src/clients/generated';
import { queryKeys } from './queryKeys';
import { unwrap } from './unwrap';
import { useAppStore } from '../useAppStore';

const fetchAllPersonalities = async (): Promise<PersonalityModel[]> => {
  const data = unwrap(await personalityClient.all());
  return data.toSorted((a, b) => a.id - b.id);
};

/**
 * Personalities query.
 *
 * The chat selector page reads personalities from `useAppStore` for now,
 * so this hook also pushes fresh data into the store on success. Once
 * the selector migrates to react-query the sync can be removed.
 */
export const usePersonalities = () => {
  const setPersonalities = useAppStore((state) => state.setPersonalities);
  const query = useQuery({
    queryKey: queryKeys.personalities.all,
    queryFn: fetchAllPersonalities,
  });

  useEffect(() => {
    if (query.data) setPersonalities(query.data);
  }, [query.data, setPersonalities]);

  return query;
};

export const useCreatePersonality = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePersonalityDto) => personalityClient.insert(input).then(unwrap),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.personalities.all });
    },
  });
};

export const useUpdatePersonality = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdatePersonalityDto }) =>
      personalityClient.update(id, input).then(unwrap),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.personalities.all });
    },
  });
};

export const useDeletePersonality = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => personalityClient.delete(id).then(unwrap),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.personalities.all });
    },
  });
};

export const useRemovePersonalityAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => personalityClient.removeAvatar(id).then(unwrap),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.personalities.all });
    },
  });
};

/**
 * Avatar upload is intentionally NOT invalidating personalities — the
 * uploaded URL is staged on the form and only persisted by the parent
 * `useUpdatePersonality` / `useCreatePersonality` call.
 *
 * Result type is declared inline because `AvatarUploadModel` is not
 * exported from the underlying client.
 */
interface UploadedAvatar {
  avatarUrl: string;
}

export const useUploadPersonalityAvatar = () =>
  useMutation<UploadedAvatar, Error, { file: File; onProgress?:(progressEvent: AxiosProgressEvent) => void }>({
    mutationFn: ({ file, onProgress }) =>
      personalityClient.uploadAvatarFile(file, onProgress).then(unwrap),
  });
