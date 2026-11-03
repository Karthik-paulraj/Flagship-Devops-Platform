const request = require('supertest');
const app = require('../src/app');
const Product = require('../src/models/Product');
const User = require('../src/models/User');
const { generateToken } = require('../src/controllers/authController');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');

let userToken;
let adminToken;
let testProduct;

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  const user = await User.create({
    name: 'Order Shopper',
    email: 'shopper@order.com',
    password: 'password123',
    role: 'user',
  });
  userToken = generateToken(user._id);

  const admin = await User.create({
    name: 'Admin Boss',
    email: 'admin@order.com',
    password: 'password123',
    role: 'admin',
  });
  adminToken = generateToken(admin._id);

  testProduct = await Product.create({
    name: 'Running Shoes Pro',
    description: 'Lightweight marathon shoes',
    price: 120,
    category: 'Fitness & Outdoors',
    images: ['https://example.com/shoes.jpg'],
    stock: 10,
  });
});

describe('Orders & Simulated Payment API (/api/orders & /api/payment)', () => {
  const shippingAddress = {
    address: '123 Tech Boulevard',
    city: 'San Francisco',
    postalCode: '94105',
    country: 'United States',
  };

  it('should create an order and decrement product stock', async () => {
    // Add product to cart first
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId: testProduct._id, quantity: 2 });

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ shippingAddress });

    expect(orderRes.statusCode).toBe(201);
    expect(orderRes.body.success).toBe(true);
    expect(orderRes.body.order.orderItems.length).toBe(1);
    expect(orderRes.body.order.orderItems[0].quantity).toBe(2);
    expect(orderRes.body.order.totalPrice).toBeGreaterThan(0);

    // Verify stock decremented from 10 to 8
    const updatedProduct = await Product.findById(testProduct._id);
    expect(updatedProduct.stock).toBe(8);

    // Verify cart is now empty
    const cartRes = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${userToken}`);
    expect(cartRes.body.cart.items.length).toBe(0);
  });

  it('should process simulated payment for an order', async () => {
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        shippingAddress,
        orderItems: [
          {
            product: testProduct._id,
            name: testProduct.name,
            quantity: 1,
            price: testProduct.price,
            image: testProduct.images[0],
          },
        ],
      });

    const orderId = orderRes.body.order._id;

    // Simulate payment
    const payRes = await request(app)
      .post('/api/payment/simulate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        orderId,
        cardDetails: { cardNumber: '4242424242424242' },
      });

    expect(payRes.statusCode).toBe(200);
    expect(payRes.body.success).toBe(true);
    expect(payRes.body.order.isPaid).toBe(true);
    expect(payRes.body.order.paymentStatus).toBe('completed');
    expect(payRes.body.order.paymentResult.status).toBe('succeeded');
  });

  it('should allow admin to list orders and update order status', async () => {
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        shippingAddress,
        orderItems: [
          {
            product: testProduct._id,
            name: testProduct.name,
            quantity: 1,
            price: testProduct.price,
            image: testProduct.images[0],
          },
        ],
      });

    const orderId = orderRes.body.order._id;

    // Admin lists orders
    const allOrdersRes = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(allOrdersRes.statusCode).toBe(200);
    expect(allOrdersRes.body.orders.length).toBe(1);

    // Admin updates order status
    const updateStatusRes = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'shipped' });

    expect(updateStatusRes.statusCode).toBe(200);
    expect(updateStatusRes.body.order.orderStatus).toBe('shipped');
  });
});
