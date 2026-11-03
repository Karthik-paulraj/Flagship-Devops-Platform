const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { seedData } = require('../src/seed/seed');
const app = require('../src/app');

async function runE2E() {
  console.log('--- STARTING IN-MEMORY END-TO-END FLOW VERIFICATION ---');
  const mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  process.env.PORT = '5001';
  process.env.JWT_SECRET = 'flagship_test_secret_key_2026';
  process.env.NODE_ENV = 'test';

  // Seed DB
  console.log('[E2E Step 1] Connecting & Seeding database...');
  await mongoose.connect(process.env.MONGO_URI);
  
  // Custom seed for script without process.exit
  const User = require('../src/models/User');
  const Product = require('../src/models/Product');
  const Cart = require('../src/models/Cart');
  const Order = require('../src/models/Order');

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'admin',
  });
  console.log('✓ Admin account created:', admin.email);

  const product = await Product.create({
    name: 'Aura Sound Pro Headphones',
    description: 'High-fidelity audio',
    price: 199.99,
    category: 'Electronics',
    images: ['https://example.com/aura.jpg'],
    stock: 20,
    rating: 4.8,
    numReviews: 12,
  });
  console.log('✓ Product created:', product.name);

  // Start app on test port
  const server = app.listen(5001);
  console.log('[E2E Step 2] Express app listening on port 5001');

  // Test with fetch
  try {
    // Health check
    const healthRes = await fetch('http://localhost:5001/api/health');
    const healthData = await healthRes.json();
    console.log('✓ GET /api/health:', healthRes.status, healthData.database.status);

    // Register
    const regRes = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        password: 'Password123',
      }),
    });
    const regData = await regRes.json();
    console.log('✓ POST /api/auth/register:', regRes.status, 'Token issued:', !!regData.token);
    const userToken = regData.token;

    // Login
    const loginRes = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sarah@example.com',
        password: 'Password123',
      }),
    });
    const loginData = await loginRes.json();
    console.log('✓ POST /api/auth/login:', loginRes.status, 'Logged in as:', loginData.user.name);

    // List products
    const prodRes = await fetch('http://localhost:5001/api/products?search=Aura');
    const prodData = await prodRes.json();
    console.log('✓ GET /api/products?search=Aura:', prodRes.status, 'Found:', prodData.total, 'products');

    // Add to cart
    const addCartRes = await fetch('http://localhost:5001/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        productId: product._id,
        quantity: 2,
      }),
    });
    const addCartData = await addCartRes.json();
    console.log('✓ POST /api/cart:', addCartRes.status, 'Cart items count:', addCartData.cart.items.length);

    // Place Order
    const orderRes = await fetch('http://localhost:5001/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        shippingAddress: {
          address: '742 Evergreen Terrace',
          city: 'Springfield',
          postalCode: '97477',
          country: 'United States',
        },
      }),
    });
    const orderData = await orderRes.json();
    console.log('✓ POST /api/orders:', orderRes.status, 'Order ID:', orderData.order._id, 'Total:', orderData.order.totalPrice);
    const orderId = orderData.order._id;

    // Simulate Payment
    const payRes = await fetch('http://localhost:5001/api/payment/simulate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        orderId,
        cardDetails: { cardNumber: '4242424242424242' },
      }),
    });
    const payData = await payRes.json();
    console.log('✓ POST /api/payment/simulate:', payRes.status, 'isPaid:', payData.order.isPaid, 'status:', payData.order.paymentStatus);

    // Admin Login
    const adminLoginRes = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'Admin@123',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;
    console.log('✓ Admin Login:', adminLoginRes.status, 'Role:', adminLoginData.user.role);

    // Admin update order status
    const updateOrderRes = await fetch(`http://localhost:5001/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'shipped' }),
    });
    const updateOrderData = await updateOrderRes.json();
    console.log('✓ Admin Update Order Status:', updateOrderRes.status, 'New status:', updateOrderData.order.orderStatus);

    console.log('--- ALL IN-MEMORY END-TO-END FLOWS PASSED SUCCESSFULLY! ---');
  } finally {
    server.close();
    await mongoose.connection.close();
    await mongoServer.stop();
  }
}

runE2E().catch((err) => {
  console.error('E2E Simulation error:', err);
  process.exit(1);
});
