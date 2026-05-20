export const shopContact = {
  name: "PrecisionSwaps.co",
  poweredBy: "Last Stop Swaps",
  address: "5334 Wythe Cove",
  cityState: "Memphis, TN",
  phone: "901-720-5171",
};

export const pricingTiers = [
  { label: "LS Swaps", price: "$2,500", note: "Base LS engine swap labor" },
  { label: "Cammed LS Swap", price: "$3,500", note: "Cammed LS labor setup" },
  {
    label: "Forced-Induction LS Swap",
    price: "$6,000",
    note: "Boost-ready LS labor planning",
  },
  { label: "LS Harness Install", price: "$1,000", note: "Harness install labor" },
  {
    label: "LS Swap Gone Wrong Fix",
    price: "Starting at $1,000",
    note: "Recovery work after stalled or incorrect installs",
  },
  { label: "Stock LT Swap", price: "$4,000", note: "Base LT engine swap labor" },
  { label: "Cammed LT Swap", price: "$5,000", note: "Cammed LT labor setup" },
  {
    label: "LT4 / Forced-Induction LT Swap",
    price: "$6,500-$7,500",
    note: "Higher-complexity LT forced-induction setup",
  },
];

export const cleanupServices = [
  { label: "Engine Clean & Paint", price: "$300" },
  { label: "Engine Bay Clean & Paint", price: "$300" },
  { label: "Wiring Cleanup", price: "$500" },
  { label: "Lighting System Check", price: "$500" },
];

export const shopPolicies = [
  "Full deposit is required before work begins.",
  "All parts must be present before swap starts.",
  "Pickup is billed at $1/mile plus trailer cost.",
  "Storage is $400/month after 72 hours.",
  "Late pickup is $25/day after 72 hours.",
  "Stalled projects incur $400/month storage.",
  "Mechanical issues are billed separately.",
  "Typical total build cost is $7,500-$10,000.",
];

export const warrantySummary =
  "Warranty coverage is limited to 90 days for wiring only when the issue is caused by shop error.";
