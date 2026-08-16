const Product = require("../models/Product");

const dummyProducts = [
  {
    name: "THE SUMMER DUO",
    category: "Ittars collections",
    gender: "Ittars collections",
    price: 2749.00,
    discount: 649.00,
    rating: 5,
    description: "A combination of our freshest scents designed to keep you refreshed throughout the hot summer months. Experience the ultimate cooling and long-lasting fragrance duo.",
    fragranceNotes: ["Citrus", "Marine", "White Musk", "Amber"],
    concentration: "Eau de Parfum",
    size: "50ml x 2",
    images: ["https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600"],
    featured: true,
    bestSeller: false,
    newArrival: false
  },
  {
    name: "sadifragrances TESTER BOX",
    category: "Ittars collections",
    gender: "Ittars collections",
    price: 1899.00,
    discount: 600.00,
    rating: 4.8,
    description: "Not sure which scent is yours? Try our Sadi Fragrances Tester Box containing 5 of our best-selling fragrances in mini vials. Find your signature scent.",
    fragranceNotes: ["Assorted Premium Notes"],
    concentration: "Discovery Set",
    size: "5ml x 5",
    images: ["https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600"],
    featured: false,
    bestSeller: false,
    newArrival: false
  },
  {
    name: "ROYAL OUD",
    category: "men",
    gender: "men",
    price: 3800.00,
    discount: 700.00,
    rating: 4.9,
    description: "A rich, woody, and luxurious oriental fragrance. Royal Oud blends precious agarwood with notes of leather, patchouli, and warm spices for an majestic presence.",
    fragranceNotes: ["Oud", "Leather", "Patchouli", "Warm Spices"],
    concentration: "Eau de Parfum",
    size: "100ml",
    images: ["https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600"],
    featured: false,
    bestSeller: true,
    newArrival: false
  },
  {
    name: "NIGHTFALL INTENSE",
    category: "men",
    gender: "men",
    price: 2999.00,
    discount: 600.00,
    rating: 4.7,
    description: "Sensual and mysterious. Nightfall Intense is designed for the modern man who owns the night. A captivating blend of black pepper, cardamom, and dark amber.",
    fragranceNotes: ["Black Pepper", "Cardamom", "Dark Amber", "Vanilla"],
    concentration: "Eau de Parfum",
    size: "80ml",
    images: ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600"],
    featured: false,
    bestSeller: false,
    newArrival: true
  },
  {
    name: "VELVET ROSE",
    category: "women",
    gender: "women",
    price: 2850.00,
    discount: 600.00,
    rating: 5,
    description: "An elegant floral fragrance capturing the essence of Turkish rose, jasmine, and fresh peony on a base of sweet vanilla and white amber.",
    fragranceNotes: ["Turkish Rose", "Jasmine", "Peony", "Vanilla"],
    concentration: "Eau de Parfum",
    size: "50ml",
    images: ["https://images.unsplash.com/photo-1588405748373-122b2321bc31?auto=format&fit=crop&q=80&w=600"],
    featured: false,
    bestSeller: false,
    newArrival: false
  },
  {
    name: "CELESTIAL UNISEX",
    category: "unisex",
    gender: "unisex",
    price: 3100.00,
    discount: 700.00,
    rating: 4.6,
    description: "A modern, shared fragrance that transcends boundaries. Celestial Unisex features notes of crisp bergamot, green tea, sandalwood, and light musk.",
    fragranceNotes: ["Bergamot", "Green Tea", "Sandalwood", "Musk"],
    concentration: "Eau de Parfum",
    size: "75ml",
    images: ["https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&q=80&w=600"],
    featured: false,
    bestSeller: false,
    newArrival: false
  },
  {
    name: "GOLDEN CITRUS",
    category: "our-collection",
    gender: "our-collection",
    price: 2599.00,
    discount: 600.00,
    rating: 4.5,
    description: "Bright, zesty, and energizing. Golden Citrus opens with lemon and grapefruit, leading into a floral heart of orange blossom and a subtle woody trail.",
    fragranceNotes: ["Lemon", "Grapefruit", "Orange Blossom", "Cedarwood"],
    concentration: "Eau de Parfum",
    size: "50ml",
    images: ["https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=600"],
    featured: false,
    bestSeller: false,
    newArrival: false
  },
  {
    name: "AMBER DUSK",
    category: "new-arrivals",
    gender: "unisex",
    price: 2950.00,
    discount: 650.00,
    rating: 4.8,
    description: "Warm, cozy, and alluring. Amber Dusk blends creamy vanilla, benzoin, and labdanum with soft spices for a fragrance that envelopes you in luxury.",
    fragranceNotes: ["Vanilla", "Benzoin", "Amber", "Soft Spices"],
    concentration: "Eau de Parfum",
    size: "50ml",
    images: ["https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600"],
    featured: false,
    bestSeller: false,
    newArrival: true
  }
];

const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) {
      console.log("Products database already populated.");
      return;
    }

    await Product.insertMany(dummyProducts);
    console.log("Dummy products seeded successfully into MongoDB.");
  } catch (error) {
    console.error("Failed seeding products database", error);
  }
};

module.exports = seedProducts;
