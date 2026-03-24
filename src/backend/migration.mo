import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";

module {
  type Transaction = {
    id : Nat;
    userId : Principal.Principal;
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

  type UserProfile = {
    displayName : Text;
    country : Text;
    preferredCurrency : Text;
  };

  type OldWalletBalance = {
    cdf : Float;
    usd : Float;
    btc : Float;
    eth : Float;
    usdt : Float;
  };

  type NewWalletBalance = {
    cdf : Float;
    usd : Float;
    btc : Float;
    eth : Float;
    usdt : Float;
    okp : Float;
  };

  type StakeRecord = {
    id : Nat;
    userId : Principal.Principal;
    amount : Float;
    startTime : Int;
    durationDays : Nat;
    rewardRate : Float;
    claimed : Bool;
  };

  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    profiles : Map.Map<Principal.Principal, UserProfile>;
    wallets : Map.Map<Principal.Principal, OldWalletBalance>;
    exchangeRates : Map.Map<Text, ExchangeRate>;
    transactions : List.List<Transaction>;
    transactionId : Nat;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    profiles : Map.Map<Principal.Principal, UserProfile>;
    wallets : Map.Map<Principal.Principal, NewWalletBalance>;
    exchangeRates : Map.Map<Text, ExchangeRate>;
    transactions : List.List<Transaction>;
    stakes : Map.Map<Nat, StakeRecord>;
    lastDailyReward : Map.Map<Principal.Principal, Int>;
    transactionId : Nat;
    stakeCounter : Nat;
    okpToCdfRate : Float;
  };

  public func run(old : OldActor) : NewActor {
    let newWallets = old.wallets.map<Principal.Principal, OldWalletBalance, NewWalletBalance>(
      func(_p, wallet) {
        {
          wallet with
          okp = 0.0;
        };
      }
    );
    {
      old with
      wallets = newWallets;
      stakes = Map.empty<Nat, StakeRecord>();
      lastDailyReward = Map.empty<Principal.Principal, Int>();
      stakeCounter = 0;
      okpToCdfRate = 500.0;
    };
  };
};
