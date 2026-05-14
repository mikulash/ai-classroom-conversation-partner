import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { scenarioClient } from '@repo/frontend-utils/src/clients/db/scenario.client';
import { ScenarioModel } from '@repo/frontend-utils/src/models';
import {
  CreateScenarioDto,
  UpdateScenarioDto,
} from '@repo/frontend-utils/src/clients/generated';
import { queryKeys } from './queryKeys';
import { unwrap } from './unwrap';
import { useAppStore } from '../useAppStore';

const fetchAllScenarios = async (): Promise<ScenarioModel[]> => {
  const data = unwrap(await scenarioClient.all());
  return data.toSorted((a, b) => a.id - b.id);
};

export const useScenarios = () => {
  const setScenarios = useAppStore((state) => state.setScenarios);
  const query = useQuery({
    queryKey: queryKeys.scenarios.all,
    queryFn: fetchAllScenarios,
  });

  useEffect(() => {
    if (query.data) setScenarios(query.data);
  }, [query.data, setScenarios]);

  return query;
};

export const useCreateScenario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateScenarioDto) => scenarioClient.insert(input).then(unwrap),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.scenarios.all });
    },
  });
};

export const useUpdateScenario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateScenarioDto }) =>
      scenarioClient.update(id, input).then(unwrap),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.scenarios.all });
    },
  });
};

export const useDeleteScenario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => scenarioClient.delete(id).then(unwrap),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.scenarios.all });
    },
  });
};
