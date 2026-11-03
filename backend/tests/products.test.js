const request = require('supertest');
const app = require('../src/app');
const Product = require('../src/models/Product');
const User = require('../src/models/User');
const { generateToken } = require('../src/controllers/authController');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');

let adminToken;
let userToken;

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  const admin = await User.create({
    name: 'Admin Admin',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
  });
  adminToken = generateToken(admin._id);

  const regular = await User.create({
    name: 'Regular User',
    email: 'user@test.com',
    password: 'password123',
    role: 'user',
  });
  userToken = generateToken(regular._id);
});

describe('Products API (/api/products)', () => {
  it('should list products and support filtering by category and search', async () => {
    await Product.create([
      {
        name: 'Wireless Bluetooth Earbuds',
        description: 'Noise cancelling earbuds',
        price: 50,
        category: 'Electronics',
        images: ['https://example.com/earbuds.jpg'],
        stock: 10,
      },
      {
        name: 'Organic Cotton T-Shirt',
        description: 'Soft summer clothing',
        price: 25,
        category: 'Fashion',
        images: ['https://example.com/tshirt.jpg'],
        stock: 15,
      },
    ]);

    // List all
    const resAll = await request(app).get('/api/products');
    expect(resAll.statusCode).toBe(200);
    expect(resAll.body.total).toBe(2);

    // Filter by category
    const resCat = await request(app).get('/api/products?category=Electronics');
    expect(resCat.statusCode).toBe(200);
    expect(resCat.body.total).toBe(1);
    expect(resCat.body.products[0].name).toContain('Earbuds');

    // Filter by search
    const resSearch = await request(app).get('/api/products?search=cotton');
    expect(resSearch.statusCode).toBe(200);
    expect(resSearch.body.total).toBe(1);
    expect(resSearch.body.products[0].category).toBe('Fashion');
  });

  it('should allow admin to create a new product', async () => {
    const newProduct = {
      name: 'Smart Fitness Watch',
      description: 'Tracks heart rate and steps',
      price: 99.99,
      category: 'Electronics',
      images: ['https://example.com/watch.jpg'],
      stock: 20,
    };

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newProduct);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.product.name).toBe(newProduct.name);
  });

  it('should deny non-admin user from creating a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Hacker Product',
        description: 'Should not be allowed',
        price: 10,
        category: 'Electronics',
        images: ['https://example.com/hack.jpg'],
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow admin to update and delete a product', async () => {
    const product = await Product.create({
      name: 'Old Gadget',
      description: 'To be updated',
      price: 100,
      category: 'Electronics',
      images: ['https://example.com/gadget.jpg'],
      stock: 5,
    });

    // Update
    const updateRes = await request(app)
      .put(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 79.99 });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.product.price).toBe(79.99);

    // Delete
    const deleteRes = await request(app)
      .delete(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.statusCode).toBe(200);

    // Verify removed
    const getRes = await request(app).get(`/api/products/${product._id}`);
    expect(getRes.statusCode).toBe(404);
  });
});
