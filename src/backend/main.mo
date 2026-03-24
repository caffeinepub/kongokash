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
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

(with migration = Migration.run)
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
    okp : Float; // New OKP balance field
  };

  type UserProfile = {
    displayName : Text;
    country : Text;
    preferredCurrency : Text; // "CDF" or "USD"
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

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let profiles = Map.empty<Principal, UserProfile>();
  let wallets = Map.empty<Principal, WalletBalance>();
  let exchangeRates = Map.empty<Text, ExchangeRate>();
  let transactions = List.empty<Transaction>();
  let stakes = Map.empty<Nat, StakeRecord>();
  let lastDailyReward = Map.empty<Principal, Int>(); // Track last daily reward claim

  var transactionId = 0;
  var stakeCounter = 0;
  var okpToCdfRate : Float = 500.0; // 1 OKP = 500 CDF

  func nextTransactionId() : Nat {
    transactionId += 1;
    transactionId;
  };

  /// Helper Functions
  func awardOkp(user : Principal, amount : Float) {
    let wallet = switch (wallets.get(user)) {
      case (null) {
        let newWallet = {
          cdf = 0.0;
          usd = 0.0;
          btc = 0.0;
          eth = 0.0;
          usdt = 0.0;
          okp = 100.0; // Initialize with 100 OKP
        };
        wallets.add(user, newWallet);
        newWallet;
      };
      case (?w) { w };
    };

    if (amount <= 0.0) { return };

    let updatedWallet = {
      wallet with okp = wallet.okp + amount;
    };
    wallets.add(user, updatedWallet);
  };

  func spendOkp(user : Principal, amount : Float) : Bool {
    let wallet = switch (wallets.get(user)) {
      case (null) {
        let newWallet = {
          cdf = 0.0;
          usd = 0.0;
          btc = 0.0;
          eth = 0.0;
          usdt = 0.0;
          okp = 100.0; // Initialize with 100 OKP
        };
        wallets.add(user, newWallet);
        newWallet;
      };
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
          okp = 100.0; // Initialize with 100 OKP
        };
        wallets.add(caller, newWallet);
        newWallet;
      };
      case (?w) { w };
    };
  };

  // Required frontend functions
  /// Get the current user's profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    profiles.get(caller);
  };

  /// Get a specific user's profile (must be owner or admin)
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
    profiles.add(caller, profile);
    if (not wallets.containsKey(caller)) {
      let wallet = {
        cdf = 0.0;
        usd = 0.0;
        btc = 0.0;
        eth = 0.0;
        usdt = 0.0;
        okp = 100.0; // Initialize with 100 OKP
      };
      wallets.add(caller, wallet);
    };
  };

  /// Profile Management
  public shared ({ caller }) func updateProfile(request : UpdateProfileRequest) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
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
        okp = 100.0; // Initialize with 100 OKP
      };
      wallets.add(caller, wallet);
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

    // Award 10 OKP
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
      btc = if (request.asset == "BTC") { wallet.btc + cryptoAmount } else {
        wallet.btc;
      };
      eth = if (request.asset == "ETH") { wallet.eth + cryptoAmount } else { wallet.eth };
      usdt = if (request.asset == "USDT") { wallet.usdt + cryptoAmount } else {
        wallet.usdt;
      };
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

    // Award 25 OKP
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
      btc = if (request.asset == "BTC") { wallet.btc - request.cryptoAmount } else {
        wallet.btc;
      };
      eth = if (request.asset == "ETH") { wallet.eth - request.cryptoAmount } else { wallet.eth };
      usdt = if (request.asset == "USDT") { wallet.usdt - request.cryptoAmount } else {
        wallet.usdt;
      };
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

    // Award 10 OKP
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

    let totalCDF = wallet.cdf + (wallet.btc * btcToCdf) + (wallet.eth * ethToCdf) + (wallet.usdt * usdtToCdf) + (wallet.usd * 2480.0) + (wallet.okp * okpToCdfRate);
    let totalUSD = wallet.usd + (wallet.btc * btcToUsd) + (wallet.eth * ethToUsd) + wallet.usdt + (wallet.cdf / 2480.0) + (wallet.okp * okpToCdfRate / 2480.0);

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

  // Get OKP to CDF rate
  public query ({ caller }) func getOkpToCdfRate() : async Float {
    okpToCdfRate;
  };

  // Set OKP to CDF rate (admin only)
  public shared ({ caller }) func setOkpToCdfRate(rate : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set OKP to CDF rate");
    };
    if (rate <= 0.0) {
      Runtime.trap("Rate must be positive");
    };
    okpToCdfRate := rate;
  };

  // Transfer OKP to another user
  public shared ({ caller }) func transferOkp(to : Principal, amount : Float) : async TransactionResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can transfer OKP");
    };
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
    if (fromWallet.okp < amount) {
      return {
        success = false;
        message = "Insufficient balance";
        newBalance = null;
      };
    };
    let toWallet = getCallerWallet(to);

    // Award 5 OKP to sender as bonus
    let updatedFromWallet = {
      fromWallet with okp = fromWallet.okp - amount + 5.0;
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

    {
      success = true;
      message = "Transfer successful, you also received 5 OKP as bonus for using OKP token!";
      newBalance = ?updatedFromWallet;
    };
  };

  // Swap OKP for CDF for merchant payments
  public shared ({ caller }) func payMerchantOkp(merchant : Principal, okpAmount : Float, convertToCdf : Bool) : async TransactionResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can pay merchants");
    };
    if (okpAmount <= 0.0) {
      return {
        success = false;
        message = "Amount must be positive";
        newBalance = null;
      };
    };
    // reload wallet with persistent state changes
    let callerWallet = getCallerWallet(caller);
    if (callerWallet.okp < okpAmount) {
      return {
        success = false;
        message = "Insufficient balance";
        newBalance = null;
      };
    };

    let merchantWallet = getCallerWallet(merchant);

    if (convertToCdf) {
      let cdfAmount = okpAmount * okpToCdfRate;
      let updatedCallerWallet = {
        callerWallet with okp = callerWallet.okp - okpAmount;
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
        message = "Payment successful, merchant received " # cdfAmount.toText() # " CDF";
        newBalance = ?updatedCallerWallet;
      };
    } else {
      // Award 5 OKP loyalty points
      let updatedCallerWallet = {
        callerWallet with okp = callerWallet.okp - okpAmount + 5.0;
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
        message = "Payment successful, merchant received " # okpAmount.toText() # " OKP and you also received 5 OKP as loyalty reward";
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

    // Update stake as claimed before updating the wallet
    let updatedStake = { stake with claimed = true };
    stakes.add(stakeId, updatedStake);

    let wallet = getCallerWallet(caller);
    let updatedWallet = {
      wallet with
      okp = wallet.okp + totalAmount;
    };
    wallets.add(caller, updatedWallet);

    { success = true; message = "Unstaking successful! You received " # totalAmount.toText() # " OKP"; newBalance = ?updatedWallet };
  };

  // Get caller's stakes
  public query ({ caller }) func getStakes() : async [StakeRecord] {
    stakes.values().toArray().filter(func(stake) { stake.userId == caller });
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
    let now = Time.now();
    let lastRewardTime = switch (lastDailyReward.get(caller)) {
      case (null) { 0 };
      case (?time) { time };
    };

    let oneDaySeconds : Int = 24 * 60 * 60;
    if (now - lastRewardTime < oneDaySeconds * 1_000_000_000) {
      return { success = false; message = "Already claimed daily reward"; amount = 0.0 };
    };

    awardOkp(caller, 50.0);
    lastDailyReward.add(caller, now);

    { success = true; message = "Daily reward claimed successfully! 50 OKP added to your wallet."; amount = 50.0 };
  };
};
