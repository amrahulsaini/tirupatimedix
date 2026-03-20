export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  strength: string;
  price: number;
  mrp: number;
  inStock: boolean;
  rating: number;
  reviews: number;
  description: string;
  usage: string;
};

export const storeAddress =
  "Mahalaxmi Market, shop no. 9 first floor, Hotel Navjeevan gali, outsode suraj pole, Udaipur, Rajasthan 313001";

export const categories = [
  {
    name: "Daily Wellness",
    description: "Multivitamins, minerals, and immunity boosters.",
  },
  {
    name: "Pain Relief",
    description: "Fast-acting tablets, gels, and support care.",
  },
  {
    name: "Diabetes Care",
    description: "Trusted medicines and sugar-management products.",
  },
  {
    name: "Cardiac Health",
    description: "Prescription-backed heart and blood pressure care.",
  },
  {
    name: "Digestive Health",
    description: "Acidity, gut-care, and digestive comfort medicines.",
  },
  {
    name: "Skin & Hair",
    description: "Dermatology and nutritional support essentials.",
  },
] as const;

export const products: Product[] = [
  {
    id: 1,
    slug: "paracef-650-tablet",
    name: "Paracef 650 Tablet",
    category: "Pain Relief",
    strength: "650 mg",
    price: 38,
    mrp: 45,
    inStock: true,
    rating: 4.6,
    reviews: 184,
    description:
      "Helps reduce fever and mild to moderate pain with dependable relief.",
    usage: "As directed by physician. Do not exceed prescribed dosage.",
  },
  {
    id: 2,
    slug: "gluco-safe-m2",
    name: "Gluco Safe M2",
    category: "Diabetes Care",
    strength: "500 mg",
    price: 126,
    mrp: 149,
    inStock: true,
    rating: 4.5,
    reviews: 126,
    description:
      "Oral anti-diabetic combination that supports healthy blood glucose control.",
    usage: "Take with meals, only under physician guidance.",
  },
  {
    id: 3,
    slug: "cardioplus-at",
    name: "CardioPlus AT",
    category: "Cardiac Health",
    strength: "75 mg",
    price: 189,
    mrp: 230,
    inStock: true,
    rating: 4.7,
    reviews: 92,
    description:
      "Combination therapy often used for cardiac and blood-thinning support.",
    usage: "Prescription medicine. Use exactly as advised.",
  },
  {
    id: 4,
    slug: "vita-immuno-c",
    name: "Vita Immuno C",
    category: "Daily Wellness",
    strength: "1000 mg",
    price: 299,
    mrp: 360,
    inStock: true,
    rating: 4.8,
    reviews: 204,
    description:
      "Effervescent vitamin C supplement with zinc for daily immunity care.",
    usage: "Dissolve one tablet in water daily after food.",
  },
  {
    id: 5,
    slug: "acidocare-dsr",
    name: "AcidoCare DSR",
    category: "Digestive Health",
    strength: "30 mg",
    price: 142,
    mrp: 168,
    inStock: true,
    rating: 4.4,
    reviews: 87,
    description:
      "Helps in acid reflux and indigestion by balancing gastric acidity.",
    usage: "Best taken before meals on empty stomach as prescribed.",
  },
  {
    id: 6,
    slug: "joint-flex-gel",
    name: "Joint Flex Gel",
    category: "Pain Relief",
    strength: "Topical Gel",
    price: 165,
    mrp: 199,
    inStock: true,
    rating: 4.3,
    reviews: 64,
    description:
      "Topical gel for local muscle stiffness and minor joint discomfort.",
    usage: "Apply thin layer over affected area 2-3 times a day.",
  },
  {
    id: 7,
    slug: "derma-biotin-plus",
    name: "Derma Biotin Plus",
    category: "Skin & Hair",
    strength: "Nutraceutical",
    price: 449,
    mrp: 525,
    inStock: true,
    rating: 4.6,
    reviews: 58,
    description:
      "Biotin, collagen, and antioxidant blend for skin and hair support.",
    usage: "One capsule daily after meals for best results.",
  },
  {
    id: 8,
    slug: "bp-control-5",
    name: "BP Control 5",
    category: "Cardiac Health",
    strength: "5 mg",
    price: 96,
    mrp: 112,
    inStock: true,
    rating: 4.5,
    reviews: 77,
    description:
      "Supports blood pressure management as part of regular treatment.",
    usage: "Take at same time daily as instructed by doctor.",
  },
  {
    id: 9,
    slug: "gut-flora-probiotic",
    name: "Gut Flora Probiotic",
    category: "Digestive Health",
    strength: "5 Billion CFU",
    price: 375,
    mrp: 420,
    inStock: true,
    rating: 4.7,
    reviews: 114,
    description:
      "Probiotic capsules to restore healthy gut microbiome and digestion.",
    usage: "Take one capsule after a major meal.",
  },
  {
    id: 10,
    slug: "coldrelief-dx-syrup",
    name: "ColdRelief DX Syrup",
    category: "Daily Wellness",
    strength: "100 ml",
    price: 118,
    mrp: 140,
    inStock: true,
    rating: 4.2,
    reviews: 143,
    description:
      "Multi-symptom cough and cold syrup for temporary relief.",
    usage: "Measure with cup and follow recommended dosage.",
  },
  {
    id: 11,
    slug: "calci-d3-max",
    name: "Calci D3 Max",
    category: "Daily Wellness",
    strength: "60 tablets",
    price: 258,
    mrp: 310,
    inStock: true,
    rating: 4.8,
    reviews: 168,
    description:
      "Calcium plus vitamin D3 formula for bone and muscle strength.",
    usage: "One tablet daily after lunch or dinner.",
  },
  {
    id: 12,
    slug: "sugar-check-strips",
    name: "Sugar Check Strips",
    category: "Diabetes Care",
    strength: "50 strips",
    price: 549,
    mrp: 620,
    inStock: false,
    rating: 4.6,
    reviews: 95,
    description:
      "Compatible glucose test strips for quick at-home sugar monitoring.",
    usage: "Use with compatible glucometer only.",
  },
];

export const featuredSlugs = [
  "paracef-650-tablet",
  "vita-immuno-c",
  "gluco-safe-m2",
  "cardioplus-at",
  "gut-flora-probiotic",
  "calci-d3-max",
] as const;
