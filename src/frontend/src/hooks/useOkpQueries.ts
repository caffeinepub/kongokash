import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useOkpBalance() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["okpBalance"],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getOkpBalance();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOkpToCdfRate() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["okpToCdfRate"],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getOkpToCdfRate();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useStakes() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stakes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStakes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStakeOkp() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      amount,
      durationDays,
    }: { amount: number; durationDays: bigint }) => {
      if (!actor) throw new Error("Non connecté");
      return actor.stakeOkp(amount, durationDays);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["okpBalance"] });
      qc.invalidateQueries({ queryKey: ["stakes"] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

export function useUnstakeOkp() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (stakeId: bigint) => {
      if (!actor) throw new Error("Non connecté");
      return actor.unstakeOkp(stakeId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["okpBalance"] });
      qc.invalidateQueries({ queryKey: ["stakes"] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["okpAdminStats"] });
    },
  });
}

export function useTransferOkp() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ to, amount }: { to: Principal; amount: number }) => {
      if (!actor) throw new Error("Non connecté");
      return actor.transferOkp(to, amount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["okpBalance"] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["okpAdminStats"] });
    },
  });
}

export function usePayMerchantOkp() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      merchant,
      okpAmount,
      convertToCdf,
    }: {
      merchant: Principal;
      okpAmount: number;
      convertToCdf: boolean;
    }) => {
      if (!actor) throw new Error("Non connecté");
      return actor.payMerchantOkp(merchant, okpAmount, convertToCdf);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["okpBalance"] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["okpAdminStats"] });
    },
  });
}

export function useClaimDailyReward() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Non connecté");
      return actor.claimDailyReward();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["okpBalance"] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["okpAdminStats"] });
    },
  });
}

export function useOkpAdminStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["okpAdminStats"],
    queryFn: async () => {
      if (!actor) return null;
      return (actor as any).getOkpAdminStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}

export function useTeamVestingStatus() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["teamVestingStatus"],
    queryFn: async () => {
      if (!actor) return null;
      return (actor as any).getTeamVestingStatus();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useClaimTeamVesting() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Non connecté");
      return (actor as any).claimTeamVesting();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teamVestingStatus"] });
      qc.invalidateQueries({ queryKey: ["okpBalance"] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

export function useInitTeamVesting() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      beneficiary: import("@icp-sdk/core/principal").Principal,
    ) => {
      if (!actor) throw new Error("Non connecté");
      return (actor as any).initTeamVesting(beneficiary);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teamVestingStatus"] });
    },
  });
}
