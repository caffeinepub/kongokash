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

  var transactionId = 0;

  func nextTransactionId() : Nat {
    transactionId += 1;
    transactionId;
  };

  // Required frontend functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
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
    profiles.add(caller, profile);
    if (not wallets.containsKey(caller)) {
      let wallet = {
        cdf = 0.0;
        usd = 0.0;
        btc = 0.0;
        eth = 0.0;
        usdt = 0.0;
      };
      wallets.add(caller, wallet);
    };
  };

  // Profile Management
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
      };
      wallets.add(caller, wallet);
    };
  };

  public query ({ caller }) func getProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(caller);
  };

  // Wallet Management
  public query ({ caller }) func getWallet() : async WalletBalance {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view wallets");
    };
    switch (wallets.get(caller)) {
      case (null) {
        Runtime.trap("Wallet not found");
      };
      case (?wallet) { wallet };
    };
  };

  public shared ({ caller }) func depositFiat(currency : Text, amount : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can deposit fiat");
    };
    switch (wallets.get(caller)) {
      case (null) {
        let newWallet = {
          cdf = if (currency == "CDF") { amount } else { 0.0 };
          usd = if (currency == "USD") { amount } else { 0.0 };
          btc = 0.0;
          eth = 0.0;
          usdt = 0.0;
        };
        wallets.add(caller, newWallet);
      };
      case (?wallet) {
        let updatedWallet = {
          wallet with
          cdf = wallet.cdf + (if (currency == "CDF") { amount } else { 0.0 });
          usd = wallet.usd + (if (currency == "USD") { amount } else { 0.0 });
        };
        wallets.add(caller, updatedWallet);
      };
    };
  };

  // Exchange Rate Management
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

  // Transaction Helper Functions
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
      return {
        success = false;
        message = "Unauthorized: Only users can buy crypto";
        newBalance = null;
      };
    };
    if (not validateBuyRequest(request)) {
      return {
        success = false;
        message = "Invalid request";
        newBalance = null;
      };
    };

    let wallet = switch (wallets.get(caller)) {
      case (null) {
        return {
          success = false;
          message = "Wallet not found";
          newBalance = null;
        };
      };
      case (?w) { w };
    };

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
      cdf = if (request.fiatCurrency == "CDF") { wallet.cdf - request.fiatAmount } else {
        wallet.cdf
      };
      usd = if (request.fiatCurrency == "USD") { wallet.usd - request.fiatAmount } else {
        wallet.usd
      };
      btc = if (request.asset == "BTC") { wallet.btc + cryptoAmount } else {
        wallet.btc;
      };
      eth = if (request.asset == "ETH") { wallet.eth + cryptoAmount } else {
        wallet.eth;
      };
      usdt = if (request.asset == "USDT") { wallet.usdt + cryptoAmount } else {
        wallet.usdt;
      };
    };
    wallets.add(caller, updatedWallet);

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
    transactions.add(transaction);

    {
      success = true;
      message = "Purchase successful";
      newBalance = ?updatedWallet;
    };
  };

  // Sell Crypto
  public shared ({ caller }) func sellCrypto(request : SellCryptoRequest) : async TransactionResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return {
        success = false;
        message = "Unauthorized: Only users can sell crypto";
        newBalance = null;
      };
    };
    if (not validateSellRequest(request)) {
      return {
        success = false;
        message = "Invalid request";
        newBalance = null;
      };
    };

    let wallet = switch (wallets.get(caller)) {
      case (null) {
        return {
          success = false;
          message = "Wallet not found";
          newBalance = null;
        };
      };
      case (?w) { w };
    };

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
      cdf = if (request.fiatCurrency == "CDF") { wallet.cdf + fiatAmount } else {
        wallet.cdf
      };
      usd = if (request.fiatCurrency == "USD") { wallet.usd + fiatAmount } else {
        wallet.usd
      };
      btc = if (request.asset == "BTC") { wallet.btc - request.cryptoAmount } else {
        wallet.btc;
      };
      eth = if (request.asset == "ETH") { wallet.eth - request.cryptoAmount } else {
        wallet.eth;
      };
      usdt = if (request.asset == "USDT") { wallet.usdt - request.cryptoAmount } else {
        wallet.usdt;
      };
    };
    wallets.add(caller, updatedWallet);

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
    transactions.add(transaction);

    {
      success = true;
      message = "Sale successful";
      newBalance = ?updatedWallet;
    };
  };

  // Get Transactions
  public query ({ caller }) func getTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    transactions.toArray().filter(func(tx) { tx.userId == caller }).sort().reverse().sliceToArray(0, 50);
  };

  // Get Portfolio Value
  public query ({ caller }) func getPortfolioValue() : async PortfolioValue {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view portfolio value");
    };
    switch (wallets.get(caller)) {
      case (null) {
        Runtime.trap("Wallet not found");
      };
      case (?wallet) {
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

        let totalCDF = wallet.cdf + (wallet.btc * btcToCdf) + (wallet.eth * ethToCdf) + (wallet.usdt * usdtToCdf) + (wallet.usd * 2480.0);
        let totalUSD = wallet.usd + (wallet.btc * btcToUsd) + (wallet.eth * ethToUsd) + wallet.usdt + (wallet.cdf / 2480.0);

        {
          totalCDF;
          totalUSD;
        };
      };
    };
  };
};
