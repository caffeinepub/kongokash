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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    buyCrypto(request: BuyCryptoRequest): Promise<TransactionResult>;
    depositFiat(currency: string, amount: number): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExchangeRates(): Promise<Array<ExchangeRate>>;
    getPortfolioValue(): Promise<PortfolioValue>;
    getProfile(): Promise<UserProfile | null>;
    getTransactions(): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWallet(): Promise<WalletBalance>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sellCrypto(request: SellCryptoRequest): Promise<TransactionResult>;
    setExchangeRate(request: SetExchangeRateRequest): Promise<void>;
    updateProfile(request: UpdateProfileRequest): Promise<void>;
}
