require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User = require('./models/User');
const Shop = require('./models/Shop');
const Category = require('./models/Category');
const Product = require('./models/Product');
const ShopProduct = require('./models/ShopProduct');
const Order = require('./models/Order');

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to database. Purging old sample data...');

    await User.deleteMany({});
    await Shop.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await ShopProduct.deleteMany({});
    await Order.deleteMany({});

    console.log('[Seed] Cleaned old collections. Creating Users...');

    // 1. Create Super Admin
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@bharat.com',
      password: 'admin1234',
      phone: '9876543210',
      role: 'admin',
    });

    // 2. Create Approved Seller
    const seller1 = await User.create({
      name: 'Ramesh Groceries',
      email: 'seller@bharat.com',
      password: 'seller1234',
      phone: '9811223344',
      role: 'seller',
    });

    // 3. Create Pending Seller (to test admin approval)
    const seller2 = await User.create({
      name: 'Green Valley Fresh',
      email: 'newvendor@bharat.com',
      password: 'vendor1234',
      phone: '9822334455',
      role: 'seller',
    });

    // 4. Create Customer
    const customer = await User.create({
      name: 'Rahul Sharma',
      email: 'customer@bharat.com',
      password: 'customer1234',
      phone: '9833445566',
      role: 'customer',
      addresses: [
        {
          label: 'Home',
          fullAddress: 'Flat 402, Block B, Connaught Place, New Delhi',
          city: 'New Delhi',
          pincode: '110001',
          coordinates: [77.2090, 28.6139],
          isDefault: true,
        },
        {
          label: 'Office',
          fullAddress: 'Tech Tower, 5th Floor, Barakhamba Road, New Delhi',
          city: 'New Delhi',
          pincode: '110001',
          coordinates: [77.2250, 28.6290],
          isDefault: false,
        }
      ]
    });

    console.log('[Seed] Users created. Creating Shops...');

    // Approved Shop
    const shop1 = await Shop.create({
      name: 'Bharat Express Mart (CP)',
      owner: seller1._id,
      phone: '9811223344',
      description: 'Superfast 10-15 mins delivery for all daily groceries and essentials.',
      address: {
        street: 'Shop 14, Outer Circle, Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
      },
      location: {
        type: 'Point',
        coordinates: [77.2167, 28.6328], // Connaught place
      },
      deliveryRadiusKm: 10,
      isApproved: true,
      isOpen: true,
      commissionPercent: 10,
      rating: 4.9,
      bannerImage: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1000&q=80',
    });

    // Pending Shop (needs approval by admin)
    const shop2 = await Shop.create({
      name: 'Green Valley Organics',
      owner: seller2._id,
      phone: '9822334455',
      description: '100% Organic fruits, vegetables and chemical-free dairy products.',
      address: {
        street: 'Booth 8, Sector 12 Market',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110022',
      },
      location: {
        type: 'Point',
        coordinates: [77.1950, 28.5850],
      },
      deliveryRadiusKm: 7,
      isApproved: false, // Pending admin approval
      isOpen: true,
      commissionPercent: 12,
      rating: 4.6,
      bannerImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80',
    });

    console.log('[Seed] Shops created. Creating Master Categories...');

    const categoriesData = [
      {
        name: 'Vegetables & Fruits',
        slug: 'vegetables-fruits',
        image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=300&q=80',
        icon: 'Apple',
        displayOrder: 1,
      },
      {
        name: 'Dairy, Bread & Eggs',
        slug: 'dairy-bread-eggs',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80',
        icon: 'Milk',
        displayOrder: 2,
      },
      {
        name: 'Snacks & Munchies',
        slug: 'snacks-munchies',
        image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=300&q=80',
        icon: 'Cookie',
        displayOrder: 3,
      },
      {
        name: 'Cold Drinks & Juices',
        slug: 'cold-drinks-juices',
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=300&q=80',
        icon: 'CupSoda',
        displayOrder: 4,
      },
      {
        name: 'Instant & Packaged Food',
        slug: 'instant-packaged-food',
        image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=300&q=80',
        icon: 'Soup',
        displayOrder: 5,
      },
      {
        name: 'Bath & Body Care',
        slug: 'bath-body-care',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80',
        icon: 'Sparkles',
        displayOrder: 6,
      },
    ];

    const categories = await Category.insertMany(categoriesData);
    const catMap = {};
    categories.forEach(c => { catMap[c.slug] = c._id; });

    console.log('[Seed] Categories created. Creating Master Products...');

    const productsData = [
      {
        name: 'Fresh Farm Potatoes (Aloo)',
        category: catMap['vegetables-fruits'],
        unit: '1 kg',
        brand: 'Fresh Picks',
        description: 'Locally sourced golden farm potatoes, ideal for everyday cooking and boiling.',
        image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80',
        defaultPrice: 35,
      },
      {
        name: 'Red Onions (Pyaaz)',
        category: catMap['vegetables-fruits'],
        unit: '1 kg',
        brand: 'Fresh Picks',
        description: 'Crisp and pungent red onions, freshly harvested.',
        image: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=400&q=80',
        defaultPrice: 42,
      },
      {
        name: 'Hybrid Fresh Tomatoes',
        category: catMap['vegetables-fruits'],
        unit: '1 kg',
        brand: 'Fresh Picks',
        description: 'Firm and juicy red hybrid tomatoes packed with rich nutrients.',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
        defaultPrice: 40,
      },
      {
        name: 'Amul Taaza Homogenised Toned Milk',
        category: catMap['dairy-bread-eggs'],
        unit: '500 ml',
        brand: 'Amul',
        description: 'Wholesome, pure pasteurised toned milk with 3.0% fat and 8.5% SNF.',
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80',
        defaultPrice: 28,
      },
      {
        name: 'Amul Pasteurised Butter',
        category: catMap['dairy-bread-eggs'],
        unit: '100 g',
        brand: 'Amul',
        description: 'Utterly butterly delicious salted butter made from pure milk fat.',
        image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80',
        defaultPrice: 58,
      },
      {
        name: 'Farm Fresh White Eggs (Pack of 6)',
        category: catMap['dairy-bread-eggs'],
        unit: 'Pack of 6',
        brand: 'Eggoz',
        description: 'Nutritious farm fresh graded eggs, sanitized and packed safely.',
        image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=400&q=80',
        defaultPrice: 55,
      },
      {
        name: "Lay's India's Magic Masala Chips",
        category: catMap['snacks-munchies'],
        unit: '50 g',
        brand: "Lay's",
        description: 'Crispy wafer chips tossed in exotic blend of hot Indian spices.',
        image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80',
        defaultPrice: 20,
      },
      {
        name: 'Doritos Cheese Supreme Nachos',
        category: catMap['snacks-munchies'],
        unit: '60 g',
        brand: 'Doritos',
        description: 'Crunchy triangle corn tortilla chips with bold cheesy flavour.',
        image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=400&q=80',
        defaultPrice: 30,
      },
      {
        name: 'Coca-Cola Refreshing Soda Bottle',
        category: catMap['cold-drinks-juices'],
        unit: '750 ml',
        brand: 'Coca-Cola',
        description: 'Iconic sparkling carbonated soft drink served ice cold.',
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
        defaultPrice: 40,
      },
      {
        name: 'Tropicana 100% Mixed Fruit Juice',
        category: catMap['cold-drinks-juices'],
        unit: '1 L',
        brand: 'Tropicana',
        description: 'Blend of apple, orange, pineapple, and guava with no added sugar.',
        image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=400&q=80',
        defaultPrice: 125,
      },
      {
        name: 'Maggi 2-Minute Masala Instant Noodles',
        category: catMap['instant-packaged-food'],
        unit: 'Pack of 4 (280g)',
        brand: 'Nestle',
        description: "India's favourite snack with iconic tastemaker masala and roasted spices.",
        image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=400&q=80',
        defaultPrice: 56,
      },
      {
        name: 'Dettol Original Germ Protection Liquid Handwash',
        category: catMap['bath-body-care'],
        unit: '200 ml',
        brand: 'Dettol',
        description: '100% better protection against illness causing germs with pine fragrance.',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
        defaultPrice: 99,
      },
    ];

    const products = await Product.insertMany(productsData);

    console.log('[Seed] Stocking shop inventory for Blinkit Express Mart...');

    const inventoryData = products.map((prod, index) => {
      const discount = (index % 3 === 0) ? Math.round(prod.defaultPrice * 0.9) : null;
      return {
        shop: shop1._id,
        product: prod._id,
        price: prod.defaultPrice,
        discountPrice: discount,
        stock: 25 + (index * 5),
        isAvailable: true,
      };
    });

    await ShopProduct.insertMany(inventoryData);

    console.log('[Seed] Creating demo completed & active orders...');

    // Order 1: Packing (Active)
    await Order.create({
      orderNumber: 'BHT-928410',
      customer: customer._id,
      shop: shop1._id,
      items: [
        {
          product: products[3]._id, // Milk
          name: products[3].name,
          price: 28,
          quantity: 2,
          unit: products[3].unit,
          image: products[3].image,
        },
        {
          product: products[4]._id, // Butter
          name: products[4].name,
          price: 58,
          quantity: 1,
          unit: products[4].unit,
          image: products[4].image,
        },
        {
          product: products[6]._id, // Lays
          name: products[6].name,
          price: 20,
          quantity: 2,
          unit: products[6].unit,
          image: products[6].image,
        }
      ],
      subtotal: 154,
      deliveryFee: 15,
      totalAmount: 169,
      deliveryAddress: {
        label: 'Home',
        fullAddress: 'Flat 402, Block B, Connaught Place, New Delhi',
        city: 'New Delhi',
        pincode: '110001',
        contactPhone: '9833445566',
      },
      status: 'packing',
      paymentMethod: 'ONLINE',
      paymentStatus: 'paid',
      statusHistory: [
        { status: 'placed', timestamp: new Date(Date.now() - 15 * 60 * 1000), note: 'Order placed by customer' },
        { status: 'confirmed', timestamp: new Date(Date.now() - 12 * 60 * 1000), note: 'Order confirmed by store' },
        { status: 'packing', timestamp: new Date(Date.now() - 5 * 60 * 1000), note: 'Store staff packing items in eco-friendly bag' },
      ],
    });

    // Order 2: Delivered (Past order)
    await Order.create({
      orderNumber: 'BHT-418290',
      customer: customer._id,
      shop: shop1._id,
      items: [
        {
          product: products[0]._id, // Potato
          name: products[0].name,
          price: 35,
          quantity: 2,
          unit: products[0].unit,
          image: products[0].image,
        },
        {
          product: products[1]._id, // Onion
          name: products[1].name,
          price: 42,
          quantity: 1,
          unit: products[1].unit,
          image: products[1].image,
        },
        {
          product: products[10]._id, // Maggi
          name: products[10].name,
          price: 56,
          quantity: 2,
          unit: products[10].unit,
          image: products[10].image,
        }
      ],
      subtotal: 224,
      deliveryFee: 0,
      totalAmount: 224,
      deliveryAddress: {
        label: 'Home',
        fullAddress: 'Flat 402, Block B, Connaught Place, New Delhi',
        city: 'New Delhi',
        pincode: '110001',
        contactPhone: '9833445566',
      },
      status: 'delivered',
      paymentMethod: 'COD',
      paymentStatus: 'paid',
      statusHistory: [
        { status: 'placed', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        { status: 'confirmed', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 2 * 60 * 1000) },
        { status: 'packing', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 5 * 60 * 1000) },
        { status: 'out_for_delivery', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 8 * 60 * 1000) },
        { status: 'delivered', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 14 * 60 * 1000), note: 'Delivered in 14 minutes!' },
      ],
    });

    console.log('=======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=======================================================');
    console.log('🔑 Credentials to test:');
    console.log('1. Super Admin:  admin@bharat.com    / admin1234    (Port 3002)');
    console.log('2. Approved Shop: seller@bharat.com   / seller1234   (Port 3001)');
    console.log('3. Pending Shop:  newvendor@bharat.com / vendor1234  (Port 3001)');
    console.log('4. Customer:      customer@bharat.com / customer1234 (Port 3000)');
    console.log('=======================================================');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
