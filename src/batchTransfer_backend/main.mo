import Principal "mo:base/Principal";
actor {
  public shared query({caller}) func whoami():async Text{
    return Principal.toText(caller);
  }
};
