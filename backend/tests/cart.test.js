const request = require('supertest');
const app = require('../src/app');
const Product = require('../src/models/Product');
const User = require('../src/models/User');
const { generateToken } = require('../src/controllers/authController');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');

let userToken;
let sampleProduct;

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  const user = await User.create({
    name: 'Cart Shopper',
    email: 'shopper@test.com',
    password: 'password123',
    role: 'user',
  });
  userToken = generateToken(user._id);

  sampleProduct = await Product.create({
    name: 'Espresso Coffee Beans',
    description: 'Dark roast whole bean',
    price: 18.5,
    category: 'Home & Living',
    images: ['https://example.com/coffee.jpg'],
    stock: 10,
  });
});

describe('Cart API (/api/cart)', () => {
  it('should add an item to the cart and return updated cart', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        productId: sampleProduct._id,
        quantity: 2,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.cart.items.length).toBe(1);
    expect(res.body.cart.items[0].quantity).toBe(2);
  });

  it('should update item quantity in cart', async () => {
    // First add
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId: sampleProduct._id, quantity: 1 });

    // Update to 4
    const res = await request(app)
      .put(`/api/cart/${sampleProduct._id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 4 });

    expect(res.statusCode).toBe(200);
    expect(res.body.cart.items[0].quantity).toBe(4);
  });

  it('should remove item from cart', async () => {
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId: sampleProduct._id, quantity: 1 });

    const deleteRes = await request(app)
      .delete(`/api/cart/${sampleProduct._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.cart.items.length).toBe(0);
  });

  it('should clear all items in the cart', async () => {
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId: sampleProduct._id, quantity: 2 });

    const clearRes = await request(app)
      .delete('/api/cart')
      .set('Authorization', `Bearer ${userToken}`);

    expect(clearRes.statusCode).toBe(200);
    expect(clearRes.body.cart.items.length).toBe(0);
  });
});
