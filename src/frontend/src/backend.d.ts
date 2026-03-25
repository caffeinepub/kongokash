import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PaymentConfig {
    tmbAccount: string;
    equityBeneficiary: string;
    equityAccount: string;
    mpesaNumber: string;
    rawbankAccount: string;
    equitySwift: string;
    airtelNumber: string;
}
export interface UserAdminView {
    principal: Principal;
    referral?: UserProfileWithReferral;
    accountStatus: string;
    role: string;
    kycStatus: string;
    walletBalance?: WalletBalance;
    profile?: UserProfile;
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
export interface OkpAdminStats {
    circulatingSupply: number;
    totalIssued: number;
    totalSupply: number;
    currentRate: number;
    totalBurned: number;
    allocations: Array<OkpAllocation>;
    totalStaked: number;
    rewardMultiplier: number;
}
export interface ExchangeRate {
    pair: string;
    buyRate: number;
    sellRate: number;
}
export interface OkpAllocation {
    name: string;
    locked: boolean;
    description: string;
    amount: number;
    percentage: number;
}
export interface ReferralStats {
    activated: bigint;
    totalOkpEarned: number;
    totalReferred: bigint;
    referrals: Array<Referral>;
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
export interface UserProfileWithReferral {
    referralCode: string;
    country: string;
    displayName: string;
    rewardClaimed: boolean;
    preferredCurrency: string;
    referredAt?: bigint;
    referredBy?: Principal;
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
export interface MobileMoneyRequest {
    id: bigint;
    status: string;
    userId: Principal;
    operator: string;
    rejectionReason: string;
    timestamp: bigint;
    txType: string;
    amountCdf: number;
    phone: string;
}
export interface KycRecord {
    status: string;
    userId: Principal;
    fullName: string;
    submittedAt: bigint;
    reviewedAt: bigint;
    phone: string;
}
export interface AdminStats {
    okpStats: OkpAdminStats;
    suspendedUsersCount: bigint;
    totalVolumeCdf: number;
    totalVolumeUsd: number;
    totalUsers: bigint;
    pendingKycCount: bigint;
    totalTransactions: bigint;
}
export interface Referral {
    activated: boolean;
    referredUser: Principal;
    rewardAmount: number;
    activatedAt: bigint;
    referredAt: bigint;
}
export interface SellCryptoRequest {
    asset: string;
    fiatCurrency: string;
    cryptoAmount: number;
}
export interface UserProfile {
    country: string;
    displayName: string;
    preferredCurrency: string;
}
export interface PortfolioValue {
    totalCDF: number;
    totalUSD: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    activateUser(user: Principal): Promise<void>;
    applyReferralCode(code: string): Promise<{
        message: string;
        success: boolean;
    }>;
    approveKyc(user: Principal): Promise<KycRecord>;
    approveMobileMoneyRequest(requestId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    buyCrypto(request: BuyCryptoRequest): Promise<TransactionResult>;
    claimDailyReward(): Promise<{
        message: string;
        success: boolean;
        amount: number;
    }>;
    claimFirstAdmin(): Promise<void>;
    depositFiat(currency: string, amount: number): Promise<void>;
    getActivatedListQuery(): Promise<Array<Principal>>;
    getAdminStats(): Promise<AdminStats>;
    getAllKyc(): Promise<Array<KycRecord>>;
    getAllMobileMoneyRequests(): Promise<Array<MobileMoneyRequest>>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getAllUserProfiles(): Promise<Array<[Principal, UserProfileWithReferral]>>;
    getAllUsers(): Promise<Array<UserAdminView>>;
    getAllWallets(): Promise<Array<[Principal, WalletBalance]>>;
    getCallerUserProfile(): Promise<UserProfileWithReferral | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExchangeRates(): Promise<Array<ExchangeRate>>;
    getMyKyc(): Promise<KycRecord>;
    getMyMobileMoneyRequests(): Promise<Array<MobileMoneyRequest>>;
    getOkpAdminStats(): Promise<OkpAdminStats>;
    getOkpBalance(): Promise<number>;
    getOkpToCdfRate(): Promise<number>;
    getPaymentConfig(): Promise<PaymentConfig>;
    getPortfolioValue(): Promise<PortfolioValue>;
    getReferralCodeQuery(): Promise<string>;
    getReferralRewardsQuery(): Promise<bigint>;
    getReferralStatsQuery(): Promise<ReferralStats>;
    getReferredListQuery(): Promise<Array<Principal>>;
    getRewardMultiplier(): Promise<number>;
    getStakes(): Promise<Array<StakeRecord>>;
    getTransactions(): Promise<Array<Transaction>>;
    getUserPortfolio(user: Principal): Promise<PortfolioValue>;
    getUserProfile(user: Principal): Promise<UserProfileWithReferral | null>;
    getWallet(): Promise<WalletBalance>;
    isAdminAssigned(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    payMerchantOkp(merchant: Principal, okpAmount: number, convertToCdf: boolean): Promise<TransactionResult>;
    rejectKyc(user: Principal): Promise<KycRecord>;
    rejectMobileMoneyRequest(requestId: bigint, reason: string): Promise<void>;
    resetPriceAdjustment(): Promise<void>;
    resetRewardMultiplier(): Promise<void>;
    saveCallerUserProfile(profile: UserProfileWithReferral): Promise<void>;
    sellCrypto(request: SellCryptoRequest): Promise<TransactionResult>;
    setExchangeRate(request: SetExchangeRateRequest): Promise<void>;
    setOkpToCdfRate(rate: number): Promise<void>;
    setPaymentConfig(config: PaymentConfig): Promise<void>;
    setRewardMultiplier(multiplier: number): Promise<void>;
    stakeOkp(amount: number, durationDays: bigint): Promise<{
        stakeId?: bigint;
        message: string;
        success: boolean;
    }>;
    submitKyc(fullName: string, phone: string): Promise<KycRecord>;
    submitMobileMoneyDeposit(phone: string, operator: string, amountCdf: number): Promise<bigint>;
    submitMobileMoneyWithdrawal(phone: string, operator: string, amountCdf: number): Promise<bigint>;
    suspendUser(user: Principal): Promise<void>;
    transferOkp(to: Principal, amount: number): Promise<TransactionResult>;
    unstakeOkp(stakeId: bigint): Promise<TransactionResult>;
    /**
     * / Profile Management
     */
    updateProfile(request: UpdateProfileRequest): Promise<void>;
}
