import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useReferralCode() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["referralCode"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getReferralCodeQuery();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useReferralStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["referralStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getReferralStatsQuery();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useReferralRewards() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["referralRewards"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getReferralRewardsQuery();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApplyReferralCode() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error("Non connecté");
      return actor.applyReferralCode(code);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referralStats"] });
      qc.invalidateQueries({ queryKey: ["referralRewards"] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
