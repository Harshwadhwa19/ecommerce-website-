require('dotenv').config();
const dns = require('dns');

// Configure DNS overrides for MongoDB Atlas SRV resolution
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

const adminUser = {
  name: 'J.G. Jeans Admin',
  shopName: 'J.G. Jeans Head Office',
  phone: '9324537061', // Main contact phone
  email: 'admin@jgjeans.com',
  password: 'adminpassword123', // Will be hashed via pre-save hook
  role: 'admin'
};

const products = [
  {
    name: 'Cax & King Classic Indigo Denim',
    brand: 'Cax & King',
    type: 'Jeans',
    pricePerPiece: 380,
    moq: 50,
    piecesPerBundle: 5,
    sizes: [28, 30, 32, 34, 36],
    colors: [
      { name: 'Indigo Blue', hexCode: '#2e5894', stock: 100 },
      { name: 'Dark Indigo', hexCode: '#0d1b3e', stock: 100 }
    ],
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop'],
    description: 'High-durability classic stretchable denim jeans for wholesale retailers. Made from premium quality combed cotton with double-stitched seams.'
  },
  {
    name: '7 GRM Heavy Washed Jeans',
    brand: '7 GRM',
    type: 'Jeans',
    pricePerPiece: 420,
    moq: 60,
    piecesPerBundle: 5,
    sizes: [28, 30, 32, 34, 36],
    colors: [
      { name: 'Ice Blue', hexCode: '#add8e6', stock: 100 },
      { name: 'Light Blue', hexCode: '#87cefa', stock: 100 }
    ],
    images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop'],
    description: 'Heavy stonewash design with subtle distress markers. Excellent durability and comfort fit, highly popular among youth.'
  },
  {
    name: 'CK2 Slim Fit Dark Black Jeans',
    brand: 'CK2',
    type: 'Jeans',
    pricePerPiece: 360,
    moq: 50,
    piecesPerBundle: 5,
    sizes: [28, 30, 32, 34, 36],
    colors: [
      { name: 'Jet Black', hexCode: '#111111', stock: 100 },
      { name: 'Charcoal', hexCode: '#36454f', stock: 100 }
    ],
    images: ['https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&auto=format&fit=crop'],
    description: 'Classic dark black jeans, minimal fades. Ideal for formal as well as semi-formal wear, built with stretch Lycra blend.'
  },
  {
    name: 'Cax & King Khaki Cotton Trousers',
    brand: 'Cax & King',
    type: 'Trousers',
    pricePerPiece: 395,
    moq: 50,
    piecesPerBundle: 5,
    sizes: [28, 30, 32, 34, 36],
    colors: [
      { name: 'Khaki', hexCode: '#f0e68c', stock: 100 },
      { name: 'Beige', hexCode: '#f5f5dc', stock: 100 }
    ],
    images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop'],
    description: 'Premium combed cotton flat-front trousers. Excellent stitching detail with premium pockets and heavy zip closure.'
  },
  {
    name: '7 GRM Olive Green Chinos',
    brand: '7 GRM',
    type: 'Trousers',
    pricePerPiece: 410,
    moq: 50,
    piecesPerBundle: 5,
    sizes: [28, 30, 32, 34, 36],
    colors: [
      { name: 'Olive Green', hexCode: '#808000', stock: 100 },
      { name: 'Forest Green', hexCode: '#228b22', stock: 100 }
    ],
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop'],
    description: 'Soft-washed comfort chinos. Perfect for casual wear, lightweight and extremely breathable fabric.'
  },
  {
    name: 'CK2 Premium Grey Formals',
    brand: 'CK2',
    type: 'Trousers',
    pricePerPiece: 450,
    moq: 50,
    piecesPerBundle: 5,
    sizes: [28, 30, 32, 34, 36],
    colors: [
      { name: 'Dark Grey', hexCode: '#36454f', stock: 100 },
      { name: 'Light Grey', hexCode: '#d3d3d3', stock: 100 }
    ],
    images: ['https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&auto=format&fit=crop'],
    description: 'Formal regular-fit trousers for wholesale distributors. Wrinkle-free fabric with high longevity and clean stitch line.'
  },
  {
    name: 'Cax & King Stonewashed Cargo Pants',
    brand: 'Cax & King',
    type: 'Trousers',
    pricePerPiece: 480,
    moq: 50,
    piecesPerBundle: 5,
    sizes: [28, 30, 32, 34, 36],
    colors: [
      { name: 'Olive Green', hexCode: '#808000', stock: 100 },
      { name: 'Camel', hexCode: '#c19a6b', stock: 100 },
      { name: 'Black', hexCode: '#000000', stock: 100 }
    ],
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop'],
    description: 'Heavy duty multi-pocket cargo pants. Designed for rugged wear, reinforced double stitch lining.'
  },
  {
    name: '7 GRM Ice Blue Summer Denim',
    brand: '7 GRM',
    type: 'Jeans',
    pricePerPiece: 430,
    moq: 50,
    piecesPerBundle: 5,
    sizes: [28, 30, 32, 34, 36],
    colors: [
      { name: 'Ice Blue', hexCode: '#add8e6', stock: 100 }
    ],
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop'],
    description: 'Light wash denim for summer collection. Very soft stretch material, premium styling.'
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Seed: Connected to Database...');

    // Non-destructive seeding: check if admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create(adminUser);
      console.log('Seed: Admin user created successfully.');
    } else {
      console.log('Seed: Admin user already exists. Skipping creation.');
    }

    // Non-destructive seeding: check if products exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.create(products);
      console.log('Seed: Sample products seeded successfully.');
    } else {
      console.log('Seed: Products already exist in catalogue. Skipping product seeding.');
    }

    console.log('Seed process completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err.message);
    process.exit(1);
  }
};

seedDatabase();
