// const request = require('supertest');
// const { sequelize } = require('../../config/database');
// const { Zone } = require('../../models');
// const app = require('../../index');
// const cacheService = require('../../services/cacheService');
// const { redisClient } = require('../../config/redis');

// describe('Zone API Integration Tests', () => {
  
//   beforeAll(async () => {
//     await sequelize.sync({ force: true });
    
//     if (!redisClient.isOpen) {
//       await redisClient.connect();
//     }
//   });
  
//   afterAll(async () => {
//     await sequelize.close();
//     await redisClient.quit();
//   });
  
//   beforeEach(async () => {
//     await Zone.destroy({ where: {}, force: true });
//     await cacheService.clear();
//   });
  
//   describe('GET /api/zones', () => {
    
//     it('should return all zones', async () => {
//       // Create test zones
//       await Zone.create({ name: 'Sidi Maarif', city: 'Casablanca' });
//       await Zone.create({ name: 'Anfa', city: 'Casablanca' });
      
//       const response = await request(app)
//         .get('/api/zones')
//         .expect(200);
      
//       expect(response.body.data).toHaveLength(2);
//       expect(response.body.source).toBe('database');
//     });
    
//     it('should return zones from cache on second request', async () => {
//       await Zone.create({ name: 'Gauthier', city: 'Casablanca' });
      
//       // First request - from database
//       const firstResponse = await request(app)
//         .get('/api/zones')
//         .expect(200);
      
//       expect(firstResponse.body.source).toBe('database');
      
//       // Second request - from cache
//       const secondResponse = await request(app)
//         .get('/api/zones')
//         .expect(200);
      
//       expect(secondResponse.body.source).toBe('cache');
//       expect(secondResponse.body.data).toHaveLength(1);
//     });
    
//     it('should return empty array if no zones', async () => {
//       const response = await request(app)
//         .get('/api/zones')
//         .expect(200);
      
//       expect(response.body.data).toEqual([]);
//     });
//   });
  
//   describe('GET /api/zones/:id', () => {
    
//     it('should return zone by id', async () => {
//       const zone = await Zone.create({ name: 'Maarif', city: 'Casablanca' });
      
//       const response = await request(app)
//         .get(`/api/zones/${zone.id}`)
//         .expect(200);
      
//       expect(response.body.data.name).toBe('Maarif');
//       expect(response.body.source).toBe('database');
//     });
    
//     it('should return 404 if zone not found', async () => {
//       const response = await request(app)
//         .get('/api/zones/99999')
//         .expect(404);
      
//       expect(response.body.error).toContain('not found');
//     });
    
//     it('should cache individual zone', async () => {
//       const zone = await Zone.create({ name: 'Maarif', city: 'Casablanca' });
      
//       // First request
//       await request(app).get(`/api/zones/${zone.id}`);
      
//       // Second request - from cache
//       const response = await request(app)
//         .get(`/api/zones/${zone.id}`)
//         .expect(200);
      
//       expect(response.body.source).toBe('cache');
//     });
//   });
  
//   describe('POST /api/zones', () => {
    
//     it('should create new zone', async () => {
//       const zoneData = {
//         name: 'Bourgogne',
//         city: 'Casablanca',
//         coordinates: { lat: 33.5731, lng: -7.5898 }
//       };
      
//       const response = await request(app)
//         .post('/api/zones')
//         .send(zoneData)
//         .expect(201);
      
//       expect(response.body.name).toBe('Bourgogne');
//       expect(response.body.id).toBeDefined();
//     });
    
//     it('should fail without required fields', async () => {
//       const response = await request(app)
//         .post('/api/zones')
//         .send({ city: 'Casablanca' })
//         .expect(400);
      
//       expect(response.body.error).toBeDefined();
//     });
    
//     it('should invalidate cache after creation', async () => {
//       // Create zone and populate cache
//       await Zone.create({ name: 'Zone1', city: 'Casablanca' });
//       await request(app).get('/api/zones'); // Populate cache
      
//       // Create new zone
//       await request(app)
//         .post('/api/zones')
//         .send({ name: 'Zone2', city: 'Casablanca' })
//         .expect(201);
      
//       // Get all zones - should be from database (cache invalidated)
//       const response = await request(app)
//         .get('/api/zones')
//         .expect(200);
      
//       expect(response.body.source).toBe('database');
//       expect(response.body.data).toHaveLength(2);
//     });
//   });
  
//   describe('PUT /api/zones/:id', () => {
    
//     it('should update zone', async () => {
//       const zone = await Zone.create({ name: 'OldName', city: 'Casablanca' });
      
//       const response = await request(app)
//         .put(`/api/zones/${zone.id}`)
//         .send({ name: 'NewName' })
//         .expect(200);
      
//       expect(response.body.name).toBe('NewName');
//     });
    
//     it('should invalidate cache after update', async () => {
//       const zone = await Zone.create({ name: 'Zone1', city: 'Casablanca' });
      
//       // Populate cache
//       await request(app).get(`/api/zones/${zone.id}`);
      
//       // Update zone
//       await request(app)
//         .put(`/api/zones/${zone.id}`)
//         .send({ name: 'Updated' });
      
//       // Get zone - should be from database
//       const response = await request(app)
//         .get(`/api/zones/${zone.id}`)
//         .expect(200);
      
//       expect(response.body.source).toBe('database');
//       expect(response.body.data.name).toBe('Updated');
//     });
//   });
  
//   describe('DELETE /api/zones/:id', () => {
    
//     it('should soft delete zone', async () => {
//       const zone = await Zone.create({ name: 'ToDelete', city: 'Casablanca' });
      
//       const response = await request(app)
//         .delete(`/api/zones/${zone.id}`)
//         .expect(200);
      
//       expect(response.body.message).toContain('deleted');
      
//       // Verify soft delete
//       await zone.reload();
//       expect(zone.isActive).toBe(false);
//     });
    
//     it('should return 404 if zone not found', async () => {
//       await request(app)
//         .delete('/api/zones/99999')
//         .expect(404);
//     });
//   });
// });