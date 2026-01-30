import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

/**
 * Query keys
 */
export const queryKeys = {
  me: ['me'] as const,
  households: ['households'] as const,
  pacts: (householdId: string, filter: string) =>
    ['pacts', householdId, filter] as const,
  pact: (householdId: string, pactId: string) =>
    ['pact', householdId, pactId] as const,
  activity: (householdId: string) => ['activity', householdId] as const,
};

/**
 * Me
 */
export const useMe = () =>
  useQuery({
    queryKey: queryKeys.me,
    queryFn: () => api.get('/auth/me'),
  });

/**
 * Households
 */
export const useHouseholds = () =>
  useQuery({
    queryKey: queryKeys.households,
    queryFn: () => api.get('/households'),
  });

export const useCreateHousehold = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string }) =>
      api.post('/households', payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.households });
    },
  });
};

export const useJoinHousehold = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { inviteCode: string }) =>
      api.post('/households/join', payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.households });
    },
  });
};

/**
 * Pacts
 */
export const usePacts = (householdId: string, filter: string) =>
  useQuery({
    queryKey: queryKeys.pacts(householdId, filter),
    queryFn: () =>
      api.get(`/households/${householdId}/pacts?filter=${filter}`),
    enabled: !!householdId,
  });

export const usePact = (householdId: string, pactId: string) =>
  useQuery({
    queryKey: queryKeys.pact(householdId, pactId),
    queryFn: () =>
      api.get(`/households/${householdId}/pacts/${pactId}`),
    enabled: !!householdId && !!pactId,
  });

export const useCreatePact = (householdId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.post(`/households/${householdId}/pacts`, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pacts(householdId, 'today'),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pacts(householdId, 'tomorrow'),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pacts(householdId, 'overdue'),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pacts(householdId, 'unassigned'),
      });
    },
  });
};

export const useUpdatePact = (householdId: string, pactId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.patch(`/households/${householdId}/pacts/${pactId}`, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pact(householdId, pactId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pacts(householdId, 'today'),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pacts(householdId, 'tomorrow'),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pacts(householdId, 'overdue'),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pacts(householdId, 'unassigned'),
      });
    },
  });
};

export const useAssignToMe = (householdId: string, pactId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      api.post(`/households/${householdId}/pacts/${pactId}/assign-to-me`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pact(householdId, pactId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pacts(householdId, 'unassigned'),
      });
    },
  });
};

export const useMarkDone = (householdId: string, pactId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      api.post(`/households/${householdId}/pacts/${pactId}/mark-done`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pact(householdId, pactId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pacts(householdId, 'today'),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pacts(householdId, 'tomorrow'),
      });
    },
  });
};

export const useConfirmPact = (householdId: string, pactId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      api.post(`/households/${householdId}/pacts/${pactId}/confirm`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pact(householdId, pactId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.activity(householdId),
      });
    },
  });
};

export const useDeletePact = (householdId: string, pactId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      api.delete(`/households/${householdId}/pacts/${pactId}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pacts(householdId, 'today'),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pacts(householdId, 'tomorrow'),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pacts(householdId, 'overdue'),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pacts(householdId, 'unassigned'),
      });
    },
  });
};

/**
 * Activity
 */
export const useActivity = (householdId: string, cursor?: string) =>
  useQuery({
    queryKey: queryKeys.activity(householdId),
    queryFn: () =>
      api.get(
        `/households/${householdId}/activity${
          cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
        }`
      ),
    enabled: !!householdId,
  });
