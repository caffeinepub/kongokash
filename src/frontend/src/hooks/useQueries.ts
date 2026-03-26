import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BuyCryptoRequest,
  SellCryptoRequest,
  UpdateProfileRequest,
} from "../backend";
import { useActor } from "./useActor";

export function useExchangeRates() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["exchangeRates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExchangeRates();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useWallet() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getWallet();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePortfolioValue() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["portfolioValue"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPortfolioValue();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBuyCrypto() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (request: BuyCryptoRequest) => {
      if (!actor) throw new Error("Non connecté");
      return actor.buyCrypto(request);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["portfolioValue"] });
    },
  });
}

export function useSellCrypto() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (request: SellCryptoRequest) => {
      if (!actor) throw new Error("Non connecté");
      return actor.sellCrypto(request);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["portfolioValue"] });
    },
  });
}

export function useDepositFiat() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      currency,
      amount,
    }: { currency: string; amount: number }) => {
      if (!actor) throw new Error("Non connecté");
      return actor.depositFiat(currency, amount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (request: UpdateProfileRequest) => {
      if (!actor) throw new Error("Non connecté");
      return actor.updateProfile(request);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// ─── External Transfers ──────────────────────────────────────────────────────

export function useMyExternalTransfers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["externalTransfers"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getMyExternalTransfers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllExternalTransfers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allExternalTransfers"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllExternalTransfers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useNetworkFees() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["networkFees"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getNetworkFees();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitExternalTransfer() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      asset,
      amount,
      toAddress,
      network,
    }: {
      asset: string;
      amount: number;
      toAddress: string;
      network: string;
    }) => {
      if (!actor) throw new Error("Non connecté");
      return (actor as any).submitExternalTransfer(
        asset,
        amount,
        toAddress,
        network,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["externalTransfers"] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

export function useUpdateExternalTransferStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: string }) => {
      if (!actor) throw new Error("Non connecté");
      return (actor as any).updateExternalTransferStatus(id, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allExternalTransfers"] });
    },
  });
}

export function useSetNetworkFee() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ network, fee }: { network: string; fee: number }) => {
      if (!actor) throw new Error("Non connecté");
      return (actor as any).setNetworkFee(network, fee);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["networkFees"] });
    },
  });
}
