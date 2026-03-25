import Map "mo:core/Map";
import Text "mo:core/Text";
import Char "mo:core/Char";
import Principal "mo:core/Principal";

module {
  type OldUserProfile = {
    displayName : Text;
    country : Text;
    preferredCurrency : Text;
  };

  type NewUserProfileWithReferral = {
    displayName : Text;
    country : Text;
    preferredCurrency : Text;
    referralCode : Text;
    referredBy : ?Principal.Principal;
    referredAt : ?Int;
    rewardClaimed : Bool;
  };

  type OldActor = {
    profiles : Map.Map<Principal.Principal, OldUserProfile>;
  };

  type NewActor = {
    profiles : Map.Map<Principal.Principal, NewUserProfileWithReferral>;
  };

  func generateReferralCode(user : Principal.Principal) : Text {
    let base = user.toText();
    let chars = base.toArray().map(
      func(c) {
        if (c == '-' or c == ':') { 'X' } else { c };
      }
    );
    let code = Text.fromArray(chars);
    if (code.size() < 8) { "2VXSXFAE" } else {
      Text.fromArray(code.toArray().sliceToArray(0, 8));
    };
  };

  public func run(old : OldActor) : NewActor {
    let newProfiles = old.profiles.map<Principal.Principal, OldUserProfile, NewUserProfileWithReferral>(
      func(user, oldProfile) {
        { oldProfile with
          referralCode = generateReferralCode(user);
          referredBy = null;
          referredAt = null;
          rewardClaimed = false;
        };
      }
    );
    { profiles = newProfiles };
  };
};

