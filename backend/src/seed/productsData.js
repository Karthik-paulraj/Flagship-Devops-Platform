const bcrypt = require('bcryptjs');

const defaultUsers = [
  {
    _id: '65e000000000000000000099',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'admin',
  },
  {
    _id: '65e000000000000000000098',
    name: 'Demo Shopper',
    email: 'user@example.com',
    password: 'User@123',
    role: 'user',
  },
];

// In-memory dynamic users store for offline mode
const memoryUsers = [...defaultUsers];

// In-memory carts store
const memoryCarts = new Map();

// In-memory orders store
const memoryOrders = [];

const defaultProducts = [
  // Electronics
  {
    _id: '65e000000000000000000001',
    name: 'Aura Sound Pro Wireless ANC Headphones',
    description: 'Immersive sound with high-fidelity 40mm neodymium drivers, hybrid active noise cancellation, and up to 36 hours of battery life on a single charge.',
    price: 199.99,
    category: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 25,
    rating: 4.8,
    numReviews: 14,
    featured: true,
  },
  {
    _id: '65e000000000000000000002',
    name: 'Lumix Mechanical RGB Gaming Keyboard',
    description: 'Tactile mechanical switches with per-key RGB illumination, aircraft-grade aluminum frame, and detachable braided USB-C cable.',
    price: 119.5,
    category: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 18,
    rating: 4.6,
    numReviews: 9,
    featured: true,
  },
  {
    _id: '65e000000000000000000003',
    name: 'UltraWide Curved 34-Inch 144Hz Monitor',
    description: 'Crisp QHD 3440x1440 curved IPS panel with 1ms response time, 144Hz refresh rate, and HDR400 for stunning gaming and productivity.',
    price: 499.0,
    category: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 8,
    rating: 4.9,
    numReviews: 22,
    featured: true,
  },
  {
    _id: '65e000000000000000000004',
    name: 'Ergonomic Precision Wireless Mouse',
    description: 'Customizable DPI up to 26,000 with hyper-fast scroll wheel, ergonomic thumb rest, and multi-device Bluetooth pairing.',
    price: 69.99,
    category: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 35,
    rating: 4.5,
    numReviews: 11,
    featured: false,
  },
  {
    _id: '65e000000000000000000005',
    name: 'Smart 4K Web Camera with Dual Microphones',
    description: 'Ultra HD 4K streaming webcam with auto-framing AI, privacy shutter, and beamforming stereo microphones.',
    price: 89.99,
    category: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 15,
    rating: 4.3,
    numReviews: 7,
    featured: false,
  },

  // Fashion
  {
    _id: '65e000000000000000000006',
    name: 'Classic Vintage Denim Jacket',
    description: 'Timeless 100% organic cotton denim jacket with reinforced brass buttons, double chest pockets, and relaxed tailored fit.',
    price: 89.0,
    category: 'Fashion',
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 20,
    rating: 4.7,
    numReviews: 19,
    featured: true,
  },
  {
    _id: '65e000000000000000000007',
    name: 'Minimalist Swiss Movement Chronograph Watch',
    description: 'Sapphire crystal glass, genuine Italian leather strap, stainless steel case, and water resistance up to 50 meters.',
    price: 245.0,
    category: 'Fashion',
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 12,
    rating: 4.9,
    numReviews: 31,
    featured: true,
  },
  {
    _id: '65e000000000000000000008',
    name: 'Urban Streetwear Heavyweight Hoodie',
    description: '450 GSM ultra-soft brushed fleece hoodie with double-lined hood, kangaroo pouch, and modern relaxed silhouette.',
    price: 74.99,
    category: 'Fashion',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 40,
    rating: 4.6,
    numReviews: 15,
    featured: false,
  },
  {
    _id: '65e000000000000000000009',
    name: 'Handcrafted Heritage Leather Weekend Duffel',
    description: 'Full-grain vegetable tanned leather duffel bag with antique brass hardware, shoe compartment, and padded shoulder strap.',
    price: 189.0,
    category: 'Fashion',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 10,
    rating: 4.8,
    numReviews: 8,
    featured: false,
  },
  {
    _id: '65e00000000000000000000a',
    name: 'Polarized Aviator Sunglasses',
    description: 'UV400 protection polarized lenses with lightweight titanium frame and comfortable silicone nose pads.',
    price: 55.0,
    category: 'Fashion',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 22,
    rating: 4.4,
    numReviews: 12,
    featured: false,
  },

  // Home & Living
  {
    _id: '65e00000000000000000000b',
    name: 'Artisan Pour-Over Ceramic Coffee Dripper Set',
    description: 'Handmade ceramic dripper with heat-resistant borosilicate glass carafe and stainless steel reusable filter.',
    price: 48.0,
    category: 'Home & Living',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 15,
    rating: 4.9,
    numReviews: 27,
    featured: true,
  },
  {
    _id: '65e00000000000000000000c',
    name: 'Nordic Minimalist Oak Bedside Lamp',
    description: 'Natural solid oak base with warm dimmable LED glow, touch capacitive switch, and integrated USB charging port.',
    price: 59.99,
    category: 'Home & Living',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 14,
    rating: 4.5,
    numReviews: 10,
    featured: false,
  },
  {
    _id: '65e00000000000000000000d',
    name: 'Ultrasonic Essential Oil Aromatherapy Diffuser',
    description: 'BPA-free whisper quiet diffuser with 7 ambient color lights, 4 timer settings, and automatic shut-off safety.',
    price: 36.5,
    category: 'Home & Living',
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 30,
    rating: 4.6,
    numReviews: 16,
    featured: false,
  },
  {
    _id: '65e00000000000000000000e',
    name: 'Cast Iron Dutch Oven 6-Quart Enamel Pot',
    description: 'Heavy-duty enameled cast iron delivers superior heat distribution and retention for braising, baking artisan bread, and simmering.',
    price: 110.0,
    category: 'Home & Living',
    images: [
      'https://images.unsplash.com/photo-1584990347449-335b2e3e5898?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 11,
    rating: 4.8,
    numReviews: 24,
    featured: false,
  },
  {
    _id: '65e00000000000000000000f',
    name: 'Linen Washed Duvet Cover & Pillow Sham Set',
    description: '100% French flax linen, pre-washed for velvety softness and year-round breathable thermo-regulating comfort.',
    price: 140.0,
    category: 'Home & Living',
    images: [
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 9,
    rating: 4.7,
    numReviews: 13,
    featured: false,
  },

  // Fitness & Outdoors
  {
    _id: '65e000000000000000000010',
    name: 'HydroFlow Insulated Stainless Steel Bottle 32oz',
    description: 'Double-wall vacuum insulation keeps cold beverages ice cold for 24 hours or piping hot for 12 hours. Leak-proof straw lid included.',
    price: 34.99,
    category: 'Fitness & Outdoors',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 50,
    rating: 4.9,
    numReviews: 45,
    featured: true,
  },
  {
    _id: '65e000000000000000000011',
    name: 'Eco-Grip Non-Slip Natural Rubber Yoga Mat',
    description: '6mm high-density natural tree rubber with laser-etched alignment guides and moisture-wicking anti-microbial surface.',
    price: 68.0,
    category: 'Fitness & Outdoors',
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 28,
    rating: 4.7,
    numReviews: 19,
    featured: false,
  },
  {
    _id: '65e000000000000000000012',
    name: 'TrailBlazer Waterproof Trekking Backpack 45L',
    description: 'Ripstop nylon hiking pack with ergonomic lumbar support, integrated rain cover, and hydration bladder compatibility.',
    price: 129.0,
    category: 'Fitness & Outdoors',
    images: [
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 16,
    rating: 4.8,
    numReviews: 17,
    featured: false,
  },
  {
    _id: '65e000000000000000000013',
    name: 'Adjustable Quick-Select Dumbbell Pair 50lbs',
    description: 'Space-saving selector dumbbells adjusting from 5 to 50 lbs with an intuitive turn of the dial. Durable textured steel grips.',
    price: 299.0,
    category: 'Fitness & Outdoors',
    images: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 6,
    rating: 4.9,
    numReviews: 38,
    featured: true,
  },

  // Books & Audio
  {
    _id: '65e000000000000000000014',
    name: 'The Pragmatic Developer: Clean Architecture & Scale',
    description: 'Hardcover edition covering system design patterns, distributed architecture, and practical engineering trade-offs.',
    price: 44.95,
    category: 'Books & Audio',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 22,
    rating: 4.9,
    numReviews: 29,
    featured: true,
  },
  {
    _id: '65e000000000000000000015',
    name: 'Vintage Vinyl Turntable Hi-Fi Player',
    description: 'Belt-drive 3-speed turntable with Audio-Technica magnetic cartridge, built-in preamp, and Bluetooth transmitter.',
    price: 179.99,
    category: 'Books & Audio',
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 12,
    rating: 4.8,
    numReviews: 18,
    featured: false,
  },
  {
    _id: '65e000000000000000000016',
    name: 'Pocket E-Reader with Paperwhite Display',
    description: 'Glare-free 300 PPI front-lit display with adjustable warm light, 32GB storage, and waterproof IPX8 casing.',
    price: 139.99,
    category: 'Books & Audio',
    images: [
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 19,
    rating: 4.7,
    numReviews: 21,
    featured: false,
  },
];

module.exports = {
  defaultUsers,
  defaultProducts,
  memoryUsers,
  memoryCarts,
  memoryOrders,
};
