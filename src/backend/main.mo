import Array "mo:core/Array";
import List "mo:core/List";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";


import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Make every change relative to the old state, using migration

actor {
  module Transaction {
    public func compare(transaction1 : Transaction, transaction2 : Transaction) : Order.Order {
      Int.compare(transaction1.timestamp, transaction2.timestamp);
    };
  };

  module ExchangeRate {
    public func compare(exchangeRate1 : ExchangeRate, exchangeRate2 : ExchangeRate) : Order.Order {
      Text.compare(exchangeRate1.pair, exchangeRate2.pair);
    };
  };

  module MobileMoneyRequest {
    public func compare(mobileMoneyRequest1 : MobileMoneyRequest, mobileMoneyRequest2 : MobileMoneyRequest) : Order.Order {
      Int.compare(mobileMoneyRequest1.timestamp, mobileMoneyRequest2.timestamp);
    };
  };

  type Transaction = {
    id : Nat;
    userId : Principal;
    txType : Text;
    asset : Text;
    cryptoAmount : Float;
    fiatAmount : Float;
    fiatCurrency : Text;
    paymentMethod : Text;
    status : Text;
    timestamp : Int;
  };

  type TransactionInput = {
    userId : Principal;
    txType : Text;
    asset : Text;
    cryptoAmount : Float;
    fiatAmount : Float;
    fiatCurrency : Text;
    paymentMethod : Text;
    status : Text;
    timestamp : Int;
  };

  type ExchangeRate = {
    pair : Text;
    buyRate : Float;
    sellRate : Float;
  };

  type WalletBalance = {
    cdf : Float;
    usd : Float;
    btc : Float;
    eth : Float;
    usdt : Float;
    okp : Float;
  };

  type UserProfile = {
    displayName : Text;
    country : Text;
    preferredCurrency : Text;
  };

  type TransactionResult = {
    success : Bool;
    message : Text;
    newBalance : ?WalletBalance;
  };

  type PortfolioValue = {
    totalCDF : Float;
    totalUSD : Float;
  };

  type StakeRecord = {
    id : Nat;
    userId : Principal;
    amount : Float;
    startTime : Int;
    durationDays : Nat;
    rewardRate : Float;
    claimed : Bool;
  };

  type OkpAllocation = {
    name : Text;
    percentage : Float;
    amount : Float;
    description : Text;
    locked : Bool;
  };

  type OkpAdminStats = {
    totalSupply : Float;       // Cap total (1 milliard OKP)
    totalIssued : Float;       // OKP mintés jusqu'ici
    circulatingSupply : Float; // totalIssued - totalStaked - totalBurned
    totalStaked : Float;       // OKP actuellement verrouillés
    totalBurned : Float;       // OKP détruits
    currentRate : Float;       // Taux OKP/CDF effectif
    rewardMultiplier : Float;  // Multiplicateur de récompense actuel
    allocations : [OkpAllocation]; // Distribution initiale
  };

  module FiatCurrency {
    public type FiatCurrency = {
      #cdf;
      #usd;
    };

    public func fromText(text : Text) : ?FiatCurrency {
      switch (text) {
        case ("CDF") { ?#cdf };
        case ("USD") { ?#usd };
        case (_) { null };
      };
    };

    public func toText(currency : FiatCurrency) : Text {
      switch (currency) {
        case (#cdf) { "CDF" };
        case (#usd) { "USD" };
      };
    };
  };

  module CryptoAsset {
    public type CryptoAsset = {
      #btc;
      #eth;
      #usdt;
    };

    public func fromText(text : Text) : ?CryptoAsset {
      switch (text) {
        case ("BTC") { ?#btc };
        case ("ETH") { ?#eth };
        case ("USDT") { ?#usdt };
        case (_) { null };
      };
    };

    public func toText(asset : CryptoAsset) : Text {
      switch (asset) {
        case (#btc) { "BTC" };
        case (#eth) { "ETH" };
        case (#usdt) { "USDT" };
      };
    };
  };

  type UpdateProfileRequest = {
    displayName : Text;
    country : Text;
    preferredCurrency : Text;
  };

  type SetExchangeRateRequest = {
    pair : Text;
    buyRate : Float;
    sellRate : Float;
  };

  type BuyCryptoRequest = {
    asset : Text;
    fiatCurrency : Text;
    fiatAmount : Float;
    paymentMethod : Text;
  };

  type SellCryptoRequest = {
    asset : Text;
    cryptoAmount : Float;
    fiatCurrency : Text;
  };

  //Admin dashboard types

  type AdminStats = {
    totalUsers : Nat;
    totalTransactions : Nat;
    totalVolumeCdf : Float;
    totalVolumeUsd : Float;
    pendingKycCount : Nat;
    suspendedUsersCount : Nat;
    okpStats : OkpAdminStats;
  };

  type UserAdminView = {
    principal : Principal;
    profile : ?UserProfile;
    kycStatus : Text;
    accountStatus : Text; // "active" or "suspended"
    role : Text;          // "guest", "user", "admin"
    walletBalance : ?WalletBalance;
  };

  type KycRecord = {
    userId : Principal;
    fullName : Text;
    phone : Text;
    status : Text; // "pending", "approved", "rejected"
    submittedAt : Int;
    reviewedAt : Int;
  };

  type MobileMoneyRequest = {
    id : Nat;
    userId : Principal;
    operator : Text; // "airtel" or "mpesa"
    phone : Text;
    amountCdf : Float;
    txType : Text; // "deposit" or "withdrawal"
    status : Text; // "pending"/"approved"/"rejected"
    timestamp : Int;
    rejectionReason : Text;
  };

  type MobileMoneyRequestInput = {
    userId : Principal;
    operator : Text; // "airtel" or "mpesa"
    phone : Text;
    amountCdf : Float;
    txType : Text;
    status : Text;
    timestamp : Int;
    rejectionReason : Text;
  };

  type PaymentConfig = {
    airtelNumber : Text;
    mpesaNumber : Text;
    equityAccount : Text;
    equityBeneficiary : Text;
    equitySwift : Text;
    rawbankAccount : Text;
    tmbAccount : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let profiles = Map.empty<Principal, UserProfile>();
  let wallets = Map.empty<Principal, WalletBalance>();
  let exchangeRates = Map.empty<Text, ExchangeRate>();
  let transactions = List.empty<Transaction>();
  let stakes = Map.empty<Nat, StakeRecord>();
  let lastDailyReward = Map.empty<Principal, Int>();

  var transactionId = 0;
  var stakeCounter = 0;
  var mobileMoneyRequests = Map.empty<Nat, MobileMoneyRequest>();
  var mobileMoneyRequestId = 0;

  // Prix OKP/CDF : taux de base configurable + ajustement dynamique basé sur l'usage
  var okpToCdfRate : Float = 50.0;    // Taux de base admin-configurable
  var okpPriceAdjustment : Float = 0.0; // Ajustement accumulé selon l'usage

  // Statistiques globales de la supply
  let OKP_TOTAL_SUPPLY : Float = 1_000_000_000.0; // Cap max 1 milliard
  let OKP_BURN_RATE : Float = 0.015;            // 1.5% burn par transaction
  let OKP_HALVING_INTERVAL : Float = 50_000_000.0; // Halvening tous les 50M OKP mintés

  var totalOkpIssued : Float = 0.0;  // Total OKP mintés (rewards + initialisation)
  var totalOkpBurned : Float = 0.0;  // Total OKP détruits
  var okpTxVolume : Float = 0.0;     // Volume cumulé de transactions OKP
  var rewardMultiplierOverride : ?Float = null;
  var paymentConfig : PaymentConfig = {
    airtelNumber = "";
    mpesaNumber = "";
    equityAccount = "";
    equityBeneficiary = "";
    equitySwift = "EQBLCGDX";
    rawbankAccount = "";
    tmbAccount = "";
  };

  let kycRecords = Map.empty<Principal, KycRecord>();
  let userStatus = Map.empty<Principal, Text>();

  func nextTransactionId() : Nat {
    transactionId += 1;
    transactionId;
  };

  func nextMobileMoneyRequestId() : Nat {
    mobileMoneyRequestId += 1;
    mobileMoneyRequestId;
  };

  /// Check if user is suspended
  func isUserSuspended(user : Principal) : Bool {
    switch (userStatus.get(user)) {
      case (?status) { status == "suspended" };
      case (null) { false };
    };
  };

  /// Enforce that user is not suspended
  func requireNotSuspended(caller : Principal) {
    if (isUserSuspended(caller)) {
      Runtime.trap("Account suspended: Contact administrator");
    };
  };

  /// Taux effectif = taux de base + ajustement dynamique
  func getEffectiveOkpRate() : Float {
    okpToCdfRate + okpPriceAdjustment;
  };

  /// Multiplicateur de récompense : halvening tous les 500k OKP mintés
  func internalGetRewardMultiplier() : Float {
    if (rewardMultiplierOverride != null) {
      return switch (rewardMultiplierOverride) {
        case (null) { 1.0 };
        case (?multiplier) { multiplier };
      };
    };

    let halvings = totalOkpIssued / OKP_HALVING_INTERVAL;
    if (halvings < 1.0) { 1.0 }
    else if (halvings < 2.0) { 0.5 }
    else if (halvings < 4.0) { 0.25 }
    else if (halvings < 8.0) { 0.125 }
    else { 0.0625 };
  };

  /// Calcul du total OKP actuellement verrouillés dans des stakes actifs
  func computeTotalStaked() : Float {
    var total : Float = 0.0;
    for (stake in stakes.values()) {
      if (not stake.claimed) {
        total += stake.amount;
      };
    };
    total;
  };

  func awardOkp(user : Principal, baseAmount : Float) {
    // Vérifier la limite de supply
    if (totalOkpIssued >= OKP_TOTAL_SUPPLY) { return };

    // Appliquer le multiplicateur déclinant
    let multiplier = internalGetRewardMultiplier();
    let amount = baseAmount * multiplier;
    if (amount <= 0.0) { return };

    // Ne pas dépasser le cap total
    let actualAmount = Float.min(amount, OKP_TOTAL_SUPPLY - totalOkpIssued);

    let wallet = switch (wallets.get(user)) {
      case (null) {
        let newWallet = {
          cdf = 0.0;
          usd = 0.0;
          btc = 0.0;
          eth = 0.0;
          usdt = 0.0;
          okp = 0.0;
        };
        wallets.add(user, newWallet);
        newWallet;
      };
      case (?w) { w };
    };

    let updatedWallet = {
      wallet with okp = wallet.okp + actualAmount;
    };
    wallets.add(user, updatedWallet);
    totalOkpIssued += actualAmount;
  };

  func spendOkp(user : Principal, amount : Float) : Bool {
    let wallet = switch (wallets.get(user)) {
      case (null) { return false };
      case (?w) { w };
    };

    if (amount <= 0.0) { return false };
    if (wallet.okp < amount) { return false };

    let updatedWallet = {
      wallet with okp = wallet.okp - amount;
    };
    wallets.add(user, updatedWallet);
    true;
  };

  func getCallerWallet(caller : Principal) : WalletBalance {
    switch (wallets.get(caller)) {
      case (null) {
        let newWallet = {
          cdf = 0.0;
          usd = 0.0;
          btc = 0.0;
          eth = 0.0;
          usdt = 0.0;
          okp = 0.0;
        };
        wallets.add(caller, newWallet);
        newWallet;
      };
      case (?w) { w };
    };
  };

  // Mobile Money
  func createMobileMoneyRequest(input : MobileMoneyRequestInput) : MobileMoneyRequest {
    {
      input with id = nextMobileMoneyRequestId();
    };
  };

  public shared ({ caller }) func submitMobileMoneyDeposit(phone : Text, operator : Text, amountCdf : Float) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit mobile money deposits");
    };
    requireNotSuspended(caller);

    if (operator != "airtel" and operator != "mpesa") {
      Runtime.trap("Invalid operator: Must be \"airtel\" or \"mpesa\"");
    };
    if (amountCdf <= 0.0) {
      Runtime.trap("Amount must be positive");
    };

    let request = createMobileMoneyRequest({
      userId = caller;
      operator;
      phone;
      amountCdf;
      txType = "deposit";
      status = "pending";
      timestamp = Time.now();
      rejectionReason = "";
    });

    mobileMoneyRequests.add(request.id, request);
    request.id;
  };

  public shared ({ caller }) func submitMobileMoneyWithdrawal(phone : Text, operator : Text, amountCdf : Float) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit mobile money withdrawals");
    };
    requireNotSuspended(caller);

    if (operator != "airtel" and operator != "mpesa") {
      Runtime.trap("Invalid operator: Must be \"airtel\" or \"mpesa\"");
    };
    if (amountCdf <= 0.0) {
      Runtime.trap("Amount must be positive");
    };

    let wallet = getCallerWallet(caller);
    if (wallet.cdf < amountCdf) {
      Runtime.trap("Insufficient CDF balance");
    };

    let updatedWallet = {
      wallet with cdf = wallet.cdf - amountCdf;
    };
    wallets.add(caller, updatedWallet);

    let request = createMobileMoneyRequest({
      userId = caller;
      operator;
      phone;
      amountCdf;
      txType = "withdrawal";
      status = "pending";
      timestamp = Time.now();
      rejectionReason = "";
    });

    mobileMoneyRequests.add(request.id, request);
    request.id;
  };

  public shared ({ caller }) func approveMobileMoneyRequest(requestId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can approve mobile money requests");
    };

    let ?request = mobileMoneyRequests.get(requestId) else {
      Runtime.trap("Mobile money request not found");
    };

    if (request.status != "pending") {
      Runtime.trap("Request is not pending");
    };

    let approvedRequest = { request with status = "approved" };
    mobileMoneyRequests.add(requestId, approvedRequest);

    if (request.txType == "deposit") {
      let wallet = switch (wallets.get(request.userId)) {
        case (null) {
          let newWallet = {
            cdf = request.amountCdf;
            usd = 0.0;
            btc = 0.0;
            eth = 0.0;
            usdt = 0.0;
            okp = 0.0;
          };
          wallets.add(request.userId, newWallet);
          newWallet;
        };
        case (?w) { w };
      };

      let updatedWallet = {
        wallet with cdf = wallet.cdf + request.amountCdf;
      };
      wallets.add(request.userId, updatedWallet);
    };
  };

  public shared ({ caller }) func rejectMobileMoneyRequest(requestId : Nat, reason : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can reject mobile money requests");
    };

    let ?request = mobileMoneyRequests.get(requestId) else {
      Runtime.trap("Mobile money request not found");
    };

    if (request.status != "pending") {
      Runtime.trap("Request is not pending");
    };

    let rejectedRequest = {
      request with status = "rejected"; rejectionReason = reason;
    };
    mobileMoneyRequests.add(requestId, rejectedRequest);

    if (request.txType == "withdrawal") {
      let wallet = switch (wallets.get(request.userId)) {
        case (null) {
          let newWallet = {
            cdf = request.amountCdf;
            usd = 0.0;
            btc = 0.0;
            eth = 0.0;
            usdt = 0.0;
            okp = 0.0;
          };
          wallets.add(request.userId, newWallet);
          newWallet;
        };
        case (?w) { w };
      };

      let updatedWallet = {
        wallet with cdf = wallet.cdf + request.amountCdf;
      };
      wallets.add(request.userId, updatedWallet);
    };
  };

  public query ({ caller }) func getMyMobileMoneyRequests() : async [MobileMoneyRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view requests");
    };
    mobileMoneyRequests.values().toArray().filter(func(req) { req.userId == caller }).sort().reverse();
  };

  public query ({ caller }) func getAllMobileMoneyRequests() : async [MobileMoneyRequest] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all requests");
    };
    mobileMoneyRequests.values().toArray().sort().reverse();
  };

  //Required frontend functions

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    requireNotSuspended(caller);
    profiles.add(caller, profile);
    if (not wallets.containsKey(caller)) {
      let wallet = {
        cdf = 0.0;
        usd = 0.0;
        btc = 0.0;
        eth = 0.0;
        usdt = 0.0;
        okp = 0.0;
      };
      wallets.add(caller, wallet);
      // Récompense d'inscription : 100 OKP (soumis au multiplicateur)
      awardOkp(caller, 100.0);
    };
  };

  /// Profile Management
  public shared ({ caller }) func updateProfile(request : UpdateProfileRequest) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    requireNotSuspended(caller);
    let profile = {
      displayName = request.displayName;
      country = request.country;
      preferredCurrency = request.preferredCurrency;
    };
    profiles.add(caller, profile);
    if (not wallets.containsKey(caller)) {
      let wallet = {
        cdf = 0.0;
        usd = 0.0;
        btc = 0.0;
        eth = 0.0;
        usdt = 0.0;
        okp = 0.0;
      };
      wallets.add(caller, wallet);
      awardOkp(caller, 100.0);
    };
  };

  public query ({ caller }) func getProfile() : async ?UserProfile {
    profiles.get(caller);
  };

  /// Wallet Management
  public query ({ caller }) func getWallet() : async WalletBalance {
    let wallet = getCallerWallet(caller);
    wallet;
  };

  public shared ({ caller }) func depositFiat(currency : Text, amount : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can deposit fiat");
    };
    requireNotSuspended(caller);
    if (amount <= 0) {
      Runtime.trap("Amount must be positive");
    };
    let wallet = getCallerWallet(caller);
    let updatedWallet = {
      wallet with
      cdf = wallet.cdf + (if (currency == "CDF") { amount } else { 0.0 });
      usd = wallet.usd + (if (currency == "USD") { amount } else { 0.0 });
    };

    let depositTransaction = {
      id = nextTransactionId();
      userId = caller;
      txType = "deposit";
      asset = currency;
      cryptoAmount = 0.0;
      fiatAmount = amount;
      fiatCurrency = currency;
      paymentMethod = "unverified";
      status = "pending";
      timestamp = Time.now();
    };

    wallets.add(caller, updatedWallet);
    transactions.add(depositTransaction);

    // Récompense dépôt : 10 OKP (soumis au multiplicateur)
    awardOkp(caller, 10.0);
  };

  /// Exchange Rate Management
  public query ({ caller }) func getExchangeRates() : async [ExchangeRate] {
    exchangeRates.values().toArray().sort();
  };

  public shared ({ caller }) func setExchangeRate(request : SetExchangeRateRequest) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set exchange rates");
    };
    if (request.buyRate <= 0.0 or request.sellRate <= 0.0) {
      Runtime.trap("Rates must be positive");
    };

    let rate = {
      pair = request.pair;
      buyRate = request.buyRate;
      sellRate = request.sellRate;
    };
    exchangeRates.add(request.pair, rate);
  };

  /// Transaction Helper Functions
  func createTransaction(input : TransactionInput) : Transaction {
    {
      input with id = nextTransactionId();
    };
  };

  func getExchangeRate(pair : Text) : ExchangeRate {
    switch (exchangeRates.get(pair)) {
      case (null) {
        Runtime.trap("Exchange rate not found for pair: " # pair);
      };
      case (?rate) { rate };
    };
  };

  func validateBuyRequest(request : BuyCryptoRequest) : Bool {
    request.fiatAmount > 0.0;
  };

  func validateSellRequest(request : SellCryptoRequest) : Bool {
    request.cryptoAmount > 0.0;
  };

  // Buy Crypto
  public shared ({ caller }) func buyCrypto(request : BuyCryptoRequest) : async TransactionResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can buy crypto");
    };
    requireNotSuspended(caller);
    if (not validateBuyRequest(request)) {
      return {
        success = false;
        message = "Invalid request";
        newBalance = null;
      };
    };

    let wallet = getCallerWallet(caller);
    let currencyBalance = if (request.fiatCurrency == "CDF") {
      wallet.cdf;
    } else {
      wallet.usd;
    };
    if (currencyBalance < request.fiatAmount) {
      return {
        success = false;
        message = "Insufficient balance";
        newBalance = null;
      };
    };

    let pair = request.asset # "/" # request.fiatCurrency;
    let rate = getExchangeRate(pair);
    let cryptoAmount = request.fiatAmount / rate.buyRate;

    let updatedWallet = {
      cdf = if (request.fiatCurrency == "CDF") { wallet.cdf - request.fiatAmount } else { wallet.cdf };
      usd = if (request.fiatCurrency == "USD") { wallet.usd - request.fiatAmount } else { wallet.usd };
      btc = if (request.asset == "BTC") { wallet.btc + cryptoAmount } else { wallet.btc };
      eth = if (request.asset == "ETH") { wallet.eth + cryptoAmount } else { wallet.eth };
      usdt = if (request.asset == "USDT") { wallet.usdt + cryptoAmount } else { wallet.usdt };
      okp = wallet.okp;
    };

    let transaction = createTransaction({
      userId = caller;
      txType = "buy";
      asset = request.asset;
      cryptoAmount;
      fiatAmount = request.fiatAmount;
      fiatCurrency = request.fiatCurrency;
      paymentMethod = request.paymentMethod;
      status = "completed";
      timestamp = Time.now();
    });

    wallets.add(caller, updatedWallet);
    transactions.add(transaction);

    // Récompense achat : 25 OKP (soumis au multiplicateur déclinant)
    awardOkp(caller, 25.0);

    {
      success = true;
      message = "Purchase successful";
      newBalance = ?updatedWallet;
    };
  };

  // Sell Crypto
  public shared ({ caller }) func sellCrypto(request : SellCryptoRequest) : async TransactionResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can sell crypto");
    };
    requireNotSuspended(caller);
    if (not validateSellRequest(request)) {
      return {
        success = false;
        message = "Invalid request";
        newBalance = null;
      };
    };

    let wallet = getCallerWallet(caller);
    let cryptoBalance = switch (request.asset) {
      case ("BTC") { wallet.btc };
      case ("ETH") { wallet.eth };
      case ("USDT") { wallet.usdt };
      case (_) { 0.0 };
    };
    if (cryptoBalance < request.cryptoAmount) {
      return {
        success = false;
        message = "Insufficient balance";
        newBalance = null;
      };
    };

    let pair = request.asset # "/" # request.fiatCurrency;
    let rate = getExchangeRate(pair);
    let fiatAmount = request.cryptoAmount * rate.sellRate;

    let updatedWallet = {
      cdf = if (request.fiatCurrency == "CDF") { wallet.cdf + fiatAmount } else { wallet.cdf };
      usd = if (request.fiatCurrency == "USD") { wallet.usd + fiatAmount } else { wallet.usd };
      btc = if (request.asset == "BTC") { wallet.btc - request.cryptoAmount } else { wallet.btc };
      eth = if (request.asset == "ETH") { wallet.eth - request.cryptoAmount } else { wallet.eth };
      usdt = if (request.asset == "USDT") { wallet.usdt - request.cryptoAmount } else { wallet.usdt };
      okp = wallet.okp;
    };

    let transaction = createTransaction({
      userId = caller;
      txType = "sell";
      asset = request.asset;
      cryptoAmount = request.cryptoAmount;
      fiatAmount;
      fiatCurrency = request.fiatCurrency;
      paymentMethod = "wallet";
      status = "completed";
      timestamp = Time.now();
    });

    wallets.add(caller, updatedWallet);
    transactions.add(transaction);

    // Récompense vente : 10 OKP (soumis au multiplicateur)
    awardOkp(caller, 10.0);

    {
      success = true;
      message = "Sale successful";
      newBalance = ?updatedWallet;
    };
  };

  // Get Transactions
  public query ({ caller }) func getTransactions() : async [Transaction] {
    transactions.toArray().filter(func(tx) { tx.userId == caller }).sort().reverse().sliceToArray(0, 50);
  };

  // Get Portfolio Value
  public query ({ caller }) func getPortfolioValue() : async PortfolioValue {
    let wallet = getCallerWallet(caller);
    let rates = exchangeRates.values().toArray();
    let btcToCdf = switch (rates.find(func(rate) { rate.pair == "BTC/CDF" })) {
      case (?rate) { rate.sellRate };
      case (null) { 145000000.0 };
    };
    let ethToCdf = switch (rates.find(func(rate) { rate.pair == "ETH/CDF" })) {
      case (?rate) { rate.sellRate };
      case (null) { 9000000.0 };
    };
    let usdtToCdf = switch (rates.find(func(rate) { rate.pair == "USDT/CDF" })) {
      case (?rate) { rate.sellRate };
      case (null) { 2480.0 };
    };
    let btcToUsd = switch (rates.find(func(rate) { rate.pair == "BTC/USD" })) {
      case (?rate) { rate.sellRate };
      case (null) { 39920.0 };
    };
    let ethToUsd = switch (rates.find(func(rate) { rate.pair == "ETH/USD" })) {
      case (?rate) { rate.sellRate };
      case (null) { 2500.0 };
    };

    let effectiveRate = getEffectiveOkpRate();
    let totalCDF = wallet.cdf + (wallet.btc * btcToCdf) + (wallet.eth * ethToCdf) + (wallet.usdt * usdtToCdf) + (wallet.usd * 2480.0) + (wallet.okp * effectiveRate);
    let totalUSD = wallet.usd + (wallet.btc * btcToUsd) + (wallet.eth * ethToUsd) + wallet.usdt + (wallet.cdf / 2480.0) + (wallet.okp * effectiveRate / 2480.0);

    {
      totalCDF;
      totalUSD;
    };
  };

  // Get OKP balance
  public query ({ caller }) func getOkpBalance() : async Float {
    let wallet = getCallerWallet(caller);
    wallet.okp;
  };

  // Get OKP to CDF rate (taux effectif = base + ajustement usage)
  public query ({ caller }) func getOkpToCdfRate() : async Float {
    getEffectiveOkpRate();
  };

  // Set OKP to CDF rate de base (admin only)
  public shared ({ caller }) func setOkpToCdfRate(rate : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set OKP to CDF rate");
    };
    if (rate <= 0.0) {
      Runtime.trap("Rate must be positive");
    };
    okpToCdfRate := rate;
  };

  // Réinitialiser l'ajustement dynamique du prix (admin only)
  public shared ({ caller }) func resetPriceAdjustment() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reset price adjustment");
    };
    okpPriceAdjustment := 0.0;
  };

  // Allocations de la distribution initiale
  func getInitialAllocations() : [OkpAllocation] {
    [
      { name = "Communauté"; percentage = 40.0; amount = OKP_TOTAL_SUPPLY * 0.40; description = "Récompenses et incentives communautaires"; locked = false },
      { name = "Équipe";     percentage = 20.0; amount = OKP_TOTAL_SUPPLY * 0.20; description = "Blocage 2 ans (vesting)"; locked = true },
      { name = "Liquidité";  percentage = 15.0; amount = OKP_TOTAL_SUPPLY * 0.15; description = "Liquidité & partenaires stratégiques"; locked = false },
      { name = "Investisseurs"; percentage = 10.0; amount = OKP_TOTAL_SUPPLY * 0.10; description = "Tour de financement initial"; locked = false },
      { name = "Marketing";  percentage = 10.0; amount = OKP_TOTAL_SUPPLY * 0.10; description = "Adoption & croissance"; locked = false },
      { name = "Réserve";    percentage = 5.0;  amount = OKP_TOTAL_SUPPLY * 0.05; description = "Réserve & développement"; locked = false },
    ]
  };

  // Stats admin OKP (publiques pour transparence)
  public query func getOkpAdminStats() : async OkpAdminStats {
    let totalStaked = computeTotalStaked();
    let circulatingSupply = totalOkpIssued - totalStaked - totalOkpBurned;
    {
      totalSupply = OKP_TOTAL_SUPPLY;
      totalIssued = totalOkpIssued;
      circulatingSupply = Float.max(0.0, circulatingSupply);
      totalStaked;
      totalBurned = totalOkpBurned;
      currentRate = getEffectiveOkpRate();
      rewardMultiplier = internalGetRewardMultiplier();
      allocations = getInitialAllocations();
    };
  };

  // Transfer OKP to another user (avec burn 1.5%)
  public shared ({ caller }) func transferOkp(to : Principal, amount : Float) : async TransactionResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can transfer OKP");
    };
    requireNotSuspended(caller);
    if (caller == to) {
      return {
        success = false;
        message = "Cannot transfer to yourself";
        newBalance = null;
      };
    };
    if (amount <= 0.0) {
      return {
        success = false;
        message = "Amount must be positive";
        newBalance = null;
      };
    };
    let fromWallet = getCallerWallet(caller);
    let burnAmount = amount * OKP_BURN_RATE;
    let totalDeducted = amount + burnAmount;
    if (fromWallet.okp < totalDeducted) {
      return {
        success = false;
        message = "Insufficient balance (including 1.5% burn)";
        newBalance = null;
      };
    };
    let toWallet = getCallerWallet(to);

    let updatedFromWallet = {
      fromWallet with okp = fromWallet.okp - totalDeducted;
    };
    let updatedToWallet = {
      toWallet with okp = toWallet.okp + amount;
    };
    let transaction = createTransaction({
      userId = caller;
      txType = "transfer";
      asset = "OKP";
      cryptoAmount = amount;
      fiatAmount = 0.0;
      fiatCurrency = "OKP";
      paymentMethod = "wallet";
      status = "completed";
      timestamp = Time.now();
    });

    wallets.add(caller, updatedFromWallet);
    wallets.add(to, updatedToWallet);
    transactions.add(transaction);

    // Mise à jour statistiques burn et volume
    totalOkpBurned += burnAmount;
    okpTxVolume += amount;
    okpPriceAdjustment += okpTxVolume * 0.00001;

    {
      success = true;
      message = "Transfer successful. " # burnAmount.toText() # " OKP burned.";
      newBalance = ?updatedFromWallet;
    };
  };

  // Swap OKP for CDF for merchant payments (avec burn 1.5%)
  public shared ({ caller }) func payMerchantOkp(merchant : Principal, okpAmount : Float, convertToCdf : Bool) : async TransactionResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can pay merchants");
    };
    requireNotSuspended(caller);
    if (okpAmount <= 0.0) {
      return {
        success = false;
        message = "Amount must be positive";
        newBalance = null;
      };
    };
    let callerWallet = getCallerWallet(caller);
    let burnAmount = okpAmount * OKP_BURN_RATE;
    let totalDeducted = okpAmount + burnAmount;

    if (callerWallet.okp < totalDeducted) {
      return {
        success = false;
        message = "Insufficient balance (including 1.5% burn)";
        newBalance = null;
      };
    };

    let merchantWallet = getCallerWallet(merchant);

    // Mise à jour burn + volume
    totalOkpBurned += burnAmount;
    okpTxVolume += okpAmount;
    okpPriceAdjustment += okpTxVolume * 0.00001;

    if (convertToCdf) {
      let cdfAmount = okpAmount * getEffectiveOkpRate();
      let updatedCallerWallet = {
        callerWallet with okp = callerWallet.okp - totalDeducted;
      };
      let updatedMerchantWallet = {
        merchantWallet with cdf = merchantWallet.cdf + cdfAmount;
      };
      let transaction = createTransaction({
        userId = caller;
        txType = "payment";
        asset = "OKP";
        cryptoAmount = okpAmount;
        fiatAmount = cdfAmount;
        fiatCurrency = "CDF";
        paymentMethod = "swap";
        status = "completed";
        timestamp = Time.now();
      });

      wallets.add(caller, updatedCallerWallet);
      wallets.add(merchant, updatedMerchantWallet);
      transactions.add(transaction);

      return {
        success = true;
        message = "Payment successful, merchant received " # cdfAmount.toText() # " CDF. " # burnAmount.toText() # " OKP burned.";
        newBalance = ?updatedCallerWallet;
      };
    } else {
      let updatedCallerWallet = {
        callerWallet with okp = callerWallet.okp - totalDeducted;
      };
      let updatedMerchantWallet = {
        merchantWallet with okp = merchantWallet.okp + okpAmount;
      };
      let transaction = createTransaction({
        userId = caller;
        txType = "payment";
        asset = "OKP";
        cryptoAmount = okpAmount;
        fiatAmount = 0.0;
        fiatCurrency = "OKP";
        paymentMethod = "wallet";
        status = "completed";
        timestamp = Time.now();
      });

      wallets.add(merchant, updatedMerchantWallet);
      wallets.add(caller, updatedCallerWallet);
      transactions.add(transaction);

      return {
        success = true;
        message = "Payment successful, merchant received " # okpAmount.toText() # " OKP. " # burnAmount.toText() # " OKP burned.";
        newBalance = ?updatedCallerWallet;
      };
    };
  };

  // Stake OKP
  public shared ({ caller }) func stakeOkp(amount : Float, durationDays : Nat) : async {
    success : Bool;
    message : Text;
    stakeId : ?Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can stake OKP");
    };
    requireNotSuspended(caller);
    let wallet = getCallerWallet(caller);
    if (amount <= 0.0) {
      return {
        success = false;
        message = "Amount must be positive";
        stakeId = null;
      };
    };
    if (wallet.okp < amount) {
      return { success = false; message = "Insufficient OKP balance"; stakeId = null };
    };

    let validDurations = [30, 90, 180];
    if (validDurations.find(func(x) { x == durationDays }) == null) {
      return { success = false; message = "Invalid duration"; stakeId = null };
    };

    let rewardRate = switch (durationDays) {
      case (30) { 0.10 };
      case (90) { 0.15 };
      case (180) { 0.20 };
      case (_) { return { success = false; message = "Invalid duration"; stakeId = null } };
    };

    let updatedWallet = {
      wallet with
      okp = wallet.okp - amount;
    };
    let stakeId = stakeCounter;
    let stakeRecord = {
      id = stakeId;
      userId = caller;
      amount;
      startTime = Time.now();
      durationDays;
      rewardRate;
      claimed = false;
    };

    wallets.add(caller, updatedWallet);
    stakes.add(stakeId, stakeRecord);
    stakeCounter += 1;

    { success = true; message = "Staking successful! Expect " # (amount * rewardRate).toText() # " OKP reward at end of " # durationDays.toText() # " days."; stakeId = ?stakeId };
  };

  // Unstake OKP
  public shared ({ caller }) func unstakeOkp(stakeId : Nat) : async TransactionResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unstake OKP");
    };
    requireNotSuspended(caller);
    let ?stake = stakes.get(stakeId) else {
      return { success = false; message = "Stake not found"; newBalance = null };
    };

    if (stake.userId != caller) {
      Runtime.trap("Unauthorized: Only stake owner can unstake");
    };

    if (stake.claimed) {
      return { success = false; message = "Stake already claimed"; newBalance = null };
    };

    let durationSeconds = stake.durationDays * 24 * 60 * 60;
    let elapsedSeconds = (Time.now() - stake.startTime) / 1_000_000_000;
    if (elapsedSeconds < durationSeconds) {
      return { success = false; message = "Stake duration not yet reached"; newBalance = null };
    };

    let rewardAmount = stake.amount * stake.rewardRate;
    let totalAmount = stake.amount + rewardAmount;

    let updatedStake = { stake with claimed = true };
    stakes.add(stakeId, updatedStake);

    let wallet = getCallerWallet(caller);
    let updatedWallet = {
      wallet with
      okp = wallet.okp + totalAmount;
    };
    wallets.add(caller, updatedWallet);

    // Les récompenses de staking comptent aussi comme OKP émis
    totalOkpIssued += rewardAmount;

    { success = true; message = "Unstaking successful! You received " # totalAmount.toText() # " OKP"; newBalance = ?updatedWallet };
  };

  // Get caller's stakes
  public query ({ caller }) func getStakes() : async [StakeRecord] {
    stakes.values().toArray().filter(
      func(stake) { stake.userId == caller }
    );
  };

  // Claim daily reward
  public shared ({ caller }) func claimDailyReward() : async {
    success : Bool;
    message : Text;
    amount : Float;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can claim daily rewards");
    };
    requireNotSuspended(caller);
    let now = Time.now();
    let lastRewardTime = switch (lastDailyReward.get(caller)) {
      case (null) {
        0;
      };
      case (?time) { time };
    };

    let oneDaySeconds : Int = 24 * 60 * 60;
    if (now - lastRewardTime < oneDaySeconds * 1_000_000_000) {
      return { success = false; message = "Already claimed daily reward"; amount = 0.0 };
    };

    // Base 50 OKP, soumis au multiplicateur déclinant
    let multiplier = internalGetRewardMultiplier();
    let actualAmount = 50.0 * multiplier;
    awardOkp(caller, 50.0);
    lastDailyReward.add(caller, now);

    { success = true; message = "Daily reward claimed! " # actualAmount.toText() # " OKP added to your wallet."; amount = actualAmount };
  };

  // Admin dashboard functions

  public query ({ caller }) func getAdminStats() : async AdminStats {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view stats");
    };

    let totalUsers = profiles.size();
    let userStatuses = userStatus.toArray();
    let suspendedUserCount = userStatuses.filter(
      func((_, status)) { status == "suspended" }
    ).size();

    let walletArray = wallets.values().toArray();
    let allTransactions = transactions.toArray();
    let totalVolumeCdf = walletArray.foldLeft(
      allTransactions.foldLeft(0.0, func(accum, tx) { accum + tx.fiatAmount }),
      func(accum, wallet) {
        accum + wallet.cdf;
      },
    );
    let totalVolumeUsd = walletArray.foldLeft(
      allTransactions.foldLeft(0.0, func(accum, tx) { accum + tx.fiatAmount }),
      func(accum, wallet) {
        accum + wallet.usd;
      },
    );

    let kycCount = kycRecords.values().toArray().size();
    let pendingKycCount = kycRecords.values().toArray().filter(
      func(kyc) { kyc.status == "pending" }
    ).size();

    {
      totalUsers;
      suspendedUsersCount = suspendedUserCount;
      totalVolumeCdf;
      totalVolumeUsd;
      totalTransactions = transactions.size();
      pendingKycCount;
      okpStats = {
        totalSupply = OKP_TOTAL_SUPPLY;
        totalIssued = totalOkpIssued;
        circulatingSupply = Float.max(0.0, totalOkpIssued - totalOkpBurned);
        totalBurned = totalOkpBurned;
        totalStaked = computeTotalStaked();
        currentRate = getEffectiveOkpRate();
        rewardMultiplier = internalGetRewardMultiplier();
        allocations = getInitialAllocations();
      };
    };
  };

  public query ({ caller }) func getAllUsers() : async [UserAdminView] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view users");
    };

    let allPrincipals = profiles.keys().toArray();
    allPrincipals.map(
      func(user) {
        {
          principal = user;
          kycStatus = switch (kycRecords.get(user)) {
            case (null) { "missing" };
            case (?record) { record.status };
          };
          profile = profiles.get(user);
          accountStatus = switch (userStatus.get(user)) {
            case (null) { "active" };
            case (?status) { status };
          };
          role = switch (AccessControl.getUserRole(accessControlState, user)) {
            case (#admin) { "admin" };
            case (#user) { "user" };
            case (#guest) { "guest" };
          };
          walletBalance = wallets.get(user);
        };
      }
    );
  };

  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all transactions");
    };
    transactions.toArray();
  };

  // KYC management
  public shared ({ caller }) func submitKyc(fullName : Text, phone : Text) : async KycRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit KYC");
    };
    requireNotSuspended(caller);

    let record = {
      userId = caller;
      fullName;
      phone;
      status = "pending";
      submittedAt = Time.now();
      reviewedAt = 0;
    };
    kycRecords.add(caller, record);
    record;
  };

  public shared ({ caller }) func approveKyc(user : Principal) : async KycRecord {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can approve KYC");
    };

    let ?kyc = kycRecords.get(user) else {
      Runtime.trap("KYC record not found for user");
    };

    let updatedRecord = {
      kyc with status = "approved"; reviewedAt = Time.now();
    };
    kycRecords.add(user, updatedRecord);
    updatedRecord;
  };

  public shared ({ caller }) func rejectKyc(user : Principal) : async KycRecord {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can reject KYC");
    };

    let ?kyc = kycRecords.get(user) else {
      Runtime.trap("KYC record not found for user");
    };

    let updatedRecord = { kyc with status = "rejected"; reviewedAt = Time.now() };
    kycRecords.add(user, updatedRecord);
    updatedRecord;
  };

  public query ({ caller }) func getMyKyc() : async KycRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view KYC records");
    };
    let ?kycRecord = kycRecords.get(caller) else {
      Runtime.trap("KYC record not found");
    };
    kycRecord;
  };

  // User status management
  public shared ({ caller }) func suspendUser(user : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can suspend users");
    };
    userStatus.add(user, "suspended");
  };

  public shared ({ caller }) func activateUser(user : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can activate users");
    };
    userStatus.add(user, "active");
  };

  // Reward multiplier configuration
  public shared ({ caller }) func setRewardMultiplier(multiplier : Float) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set reward multiplier");
    };
    rewardMultiplierOverride := ?multiplier;
  };

  public shared ({ caller }) func resetRewardMultiplier() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can reset reward multiplier");
    };
    rewardMultiplierOverride := null;
  };

  public query ({ caller }) func getRewardMultiplier() : async Float {
    internalGetRewardMultiplier();
  };

  public shared ({ caller }) func getUserPortfolio(user : Principal) : async PortfolioValue {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view user portfolios");
    };
    let wallet = switch (wallets.get(user)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?w) { w };
    };
    let rates = exchangeRates.values().toArray();
    let btcToCdf = switch (rates.find(func(rate) { rate.pair == "BTC/CDF" })) {
      case (?rate) { rate.sellRate };
      case (null) { 145000000.0 };
    };
    let ethToCdf = switch (rates.find(func(rate) { rate.pair == "ETH/CDF" })) {
      case (?rate) { rate.sellRate };
      case (null) { 9000000.0 };
    };
    let usdtToCdf = switch (rates.find(func(rate) { rate.pair == "USDT/CDF" })) {
      case (?rate) { rate.sellRate };
      case (null) { 2480.0 };
    };
    let btcToUsd = switch (rates.find(func(rate) { rate.pair == "BTC/USD" })) {
      case (?rate) { rate.sellRate };
      case (null) { 39920.0 };
    };
    let ethToUsd = switch (rates.find(func(rate) { rate.pair == "ETH/USD" })) {
      case (?rate) { rate.sellRate };
      case (null) { 2500.0 };
    };

    let effectiveRate = getEffectiveOkpRate();
    let totalCDF = wallet.cdf + (wallet.btc * btcToCdf) + (wallet.eth * ethToCdf) + (wallet.usdt * usdtToCdf) + (wallet.usd * 2480.0) + (wallet.okp * effectiveRate);
    let totalUSD = wallet.usd + (wallet.btc * btcToUsd) + (wallet.eth * ethToUsd) + wallet.usdt + (wallet.cdf / 2480.0) + (wallet.okp * effectiveRate / 2480.0);

    {
      totalCDF;
      totalUSD;
    };
  };

  public query ({ caller }) func getAllKyc() : async [KycRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view KYC records");
    };
    kycRecords.values().toArray();
  };

  public query ({ caller }) func getAllWallets() : async [(Principal, WalletBalance)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all wallets");
    };
    wallets.toArray();
  };

  public query ({ caller }) func getAllUserProfiles() : async [(Principal, UserProfile)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all user profiles");
    };
    profiles.toArray();
  };

  // Payment config
  public query func getPaymentConfig() : async PaymentConfig {
    paymentConfig
  };

  public shared ({ caller }) func setPaymentConfig(config : PaymentConfig) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update payment config");
    };
    paymentConfig := config;
  };

  // First-run admin setup
  public query func isAdminAssigned() : async Bool {
    accessControlState.adminAssigned
  };

  public shared ({ caller }) func claimFirstAdmin() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Vous devez etre connecte pour devenir administrateur");
    };
    if (accessControlState.adminAssigned) {
      Runtime.trap("Un administrateur a deja ete assigne");
    };
    accessControlState.userRoles.add(caller, #admin);
    accessControlState.adminAssigned := true;
  };
};

