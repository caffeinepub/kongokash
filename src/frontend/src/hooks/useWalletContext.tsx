import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode, createContext, useContext } from "react";
import {
  useExchangeRates,
  usePortfolioValue,
  useTransactions,
  useWallet,
} from "./useQueries";

interface WalletContextValue {
  wallet: ReturnType<typeof useWallet>["data"];
  totalCDF: number;
  totalUSD: number;
  transactions: NonNullable<ReturnType<typeof useTransactions>["data"]>;
  rates: NonNullable<ReturnType<typeof useExchangeRates>["data"]>;
  isLoading: boolean;
  refresh: () => void;
}

const WalletContext = createContext<WalletContextValue>({
  wallet: undefined,
  totalCDF: 0,
  totalUSD: 0,
  transactions: [],
  rates: [],
  isLoading: false,
  refresh: () => {},
});

export function WalletContextProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolioValue();
  const { data: transactions = [], isLoading: txLoading } = useTransactions();
  const { data: rates = [] } = useExchangeRates();

  const isLoading = walletLoading || portfolioLoading || txLoading;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["wallet"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["portfolioValue"] });
    queryClient.invalidateQueries({ queryKey: ["exchangeRates"] });
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        totalCDF: portfolio?.totalCDF ?? 0,
        totalUSD: portfolio?.totalUSD ?? 0,
        transactions,
        rates,
        isLoading,
        refresh,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  return useContext(WalletContext);
}
