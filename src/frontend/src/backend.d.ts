import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PortfolioValue {
    totalCDF: number;
    totalUSD: number;
}
export interface SetExchangeRateRequest {
    pair: string;
    buyRate: number;
    sellRate: number;
}
export interface UpdateProfileRequest {
    country: string;
    displayName: string;
    preferredCurrency: string;
}
export interface TransactionResult {
    newBalance?: WalletBalance;
    message: string;
    success: boolean;
}
export interface WalletBalance {
    btc: number;
    cdf: number;
    eth: number;
    okp: number;
    usd: number;
    usdt: number;
}
export interface ExchangeRate {
    pair: string;
    buyRate: number;
    sellRate: number;
}
export interface SellCryptoRequest {
    asset: string;
    fiatCurrency: string;
    cryptoAmount: number;
}
export interface BuyCryptoRequest {
    paymentMethod: string;
    asset: string;
    fiatAmount: number;
    fiatCurrency: string;
}
export interface StakeRecord {
    id: bigint;
    durationDays: bigint;
    startTime: bigint;
    userId: Principal;
    claimed: boolean;
    rewardRate: number;
    amount: number;
}
export interface UserProfile {
    country: string;
    displayName: string;
    preferredCurrency: string;
}
export interface Transaction {
    id: bigint;
    status: string;
    paymentMethod: string;
    asset: string;
    userId: Principal;
    timestamp: bigint;
    fiatAmount: number;
    txType: string;
    fiatCurrency: string;
    cryptoAmount: number;
}
export interface OkpAllocation {
    name: string;
    percentage: number;
    amount: number;
    description: string;
    locked: boolean;
}
export interface OkpAdminStats {
    totalSupply: number;
    totalIssued: number;
    circulatingSupply: number;
    totalStaked: number;
    totalBurned: number;
    currentRate: number;
    rewardMultiplier: number;
    allocations: OkpAllocation[];
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    buyCrypto(request: BuyCryptoRequest): Promise<TransactionResult>;
    claimDailyReward(): Promise<{
        message: string;
        success: boolean;
        amount: number;
    }>;
    depositFiat(currency: string, amount: number): Promise<void>;
    /**
     * / Get the current user's profile
     */
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Exchange Rate Management
     */
    getExchangeRates(): Promise<Array<ExchangeRate>>;
    getOkpBalance(): Promise<number>;
    getOkpToCdfRate(): Promise<number>;
    getOkpAdminStats(): Promise<OkpAdminStats>;
    getPortfolioValue(): Promise<PortfolioValue>;
    getProfile(): Promise<UserProfile | null>;
    getStakes(): Promise<Array<StakeRecord>>;
    getTransactions(): Promise<Array<Transaction>>;
    /**
     * / Get a specific user's profile (must be owner or admin)
     */
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    /**
     * / Wallet Management
     */
    getWallet(): Promise<WalletBalance>;
    isCallerAdmin(): Promise<boolean>;
    payMerchantOkp(merchant: Principal, okpAmount: number, convertToCdf: boolean): Promise<TransactionResult>;
    resetPriceAdjustment(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sellCrypto(request: SellCryptoRequest): Promise<TransactionResult>;
    setExchangeRate(request: SetExchangeRateRequest): Promise<void>;
    setOkpToCdfRate(rate: number): Promise<void>;
    stakeOkp(amount: number, durationDays: bigint): Promise<{
        stakeId?: bigint;
        message: string;
        success: boolean;
    }>;
    transferOkp(to: Principal, amount: number): Promise<TransactionResult>;
    unstakeOkp(stakeId: bigint): Promise<TransactionResult>;
    /**
     * / Profile Management
     */
    updateProfile(request: UpdateProfileRequest): Promise<void>;
}
