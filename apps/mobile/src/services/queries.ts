import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { activityApi, authApi, householdApi, pactsApi } from './api';

export const queryKeys = {
  me: ['me'] as const,
  households: ['households'] as const,
  pacts: (householdId: string, filter: string) => ['pacts', householdId, filter] as const,
  pact: (householdId: string, pactId: string) => ['pact', householdId, pactId] as const,
  activity: (householdId: string) => ['activity', householdId] as const,
};

export const useMe = () => useQuery({ queryKey: queryKeys.me, queryFn: () => authApi.me().then((res) => res.data) });

export const useHouseholds = () =>
  useQuery({ queryKey: queryKeys.households, queryFn: () => householdApi.list().then((res) => res.data) });

export const useCreateHousehold = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string }) => householdApi.create(payload).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.households }),
  });
};

export const useJoinHousehold = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { inviteCode: string }) => householdApi.join(payload).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.households }),
  });
};

export const usePacts = (householdId: string, filter: string) =>
  useQuery({
    queryKey: queryKeys.pacts(householdId, filter),
    queryFn: () => pactsApi.list(householdId, filter).then((res) => res.data),
  });

export const usePact = (householdId: string, pactId: string) =>
  useQuery({
    queryKey: queryKeys.pact(householdId, pactId),
    queryFn: () => pactsApi.get(householdId, pactId).then((res) => res.data),
  });

export const useCreatePact = (householdId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => pactsApi.create(householdId, payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts(householdId, 'today') });
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts(householdId, 'tomorrow') });
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts(householdId, 'overdue') });
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts(householdId, 'unassigned') });
    },
  });
};

export const useUpdatePact = (householdId: string, pactId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => pactsApi.update(householdId, pactId, payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pact(householdId, pactId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts(householdId, 'today') });
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts(householdId, 'tomorrow') });
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts(householdId, 'overdue') });
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts(householdId, 'unassigned') });
    },
  });
};

export const useAssignToMe = (householdId: string, pactId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => pactsApi.assignToMe(householdId, pactId).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pact(householdId, pactId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts(householdId, 'unassigned') });
    },
  });
};

export const useMarkDone = (householdId: string, pactId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => pactsApi.markDone(householdId, pactId).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pact(householdId, pactId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts(householdId, 'today') });
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts(householdId, 'tomorrow') });
    },
  });
};

export const useConfirmPact = (householdId: string, pactId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => pactsApi.confirm(householdId, pactId).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pact(householdId, pactId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.activity(householdId) });
    },
  });
};

export const useDeletePact = (householdId: string, pactId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => pactsApi.remove(householdId, pactId).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts(householdId, 'today') });
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts(householdId, 'tomorrow') });
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts(householdId, 'overdue') });
      queryClient.invalidateQueries({ queryKey: queryKeys.pacts(householdId, 'unassigned') });
    },
  });
};

export const useActivity = (householdId: string, cursor?: string) =>
  useQuery({
    queryKey: queryKeys.activity(householdId),
    queryFn: () => activityApi.list(householdId, cursor).then((res) => res.data),
  });
