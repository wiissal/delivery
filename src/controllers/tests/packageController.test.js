// const request = require('supertest');
// const { sequelize } = require('../../config/database');
// const { Package, Deliverer, Zone } = require('../../models');
// const app = require('../../index');

// describe('Package Assignment API Tests', () => {
  
//   let testZone;
//   let testDeliverer;
//   let testPackage;
  
//   beforeAll(async () => {
//     await sequelize.sync({ force: true });
//   });
  
//   afterAll(async () => {
//     await sequelize.close();
//   });
  
//   beforeEach(async () => {
//     // Clear data
//     await Package.destroy({ where: {}, force: true });
//     await Deliverer.destroy({ where: {}, force: true });
//     await Zone.destroy({ where: {}, force: true });
    
//     // Create test data
//     testZone = await Zone.create({
//       name: 'Test Zone',
//       city: 'Casablanca'
//     });
    
//     testDeliverer = await Deliverer.create({
//       name: 'Ahmed',
//       phone: '0612345678',
//       maxCapacity: 5,
//       currentCapacity: 0,
//       isAvailable: true,
//       currentZoneId: testZone.id
//     });
    
//     testPackage = await Package.create({
//       trackingNumber: 'TRK123',
//       senderName: 'Sender',
//       senderPhone: '0611111111',
//       recipientName: 'Recipient',
//       recipientPhone: '0622222222',
//       pickupAddress: 'Pickup Address',
//       deliveryAddress: 'Delivery Address',
//       status: 'pending',
//       zoneId: testZone.id
//     });
//   });
  
//   describe('GET /api/packages', () => {
    
//     it('should return all packages', async () => {
//       const response = await request(app)
//         .get('/api/packages')
//         .expect(200);
      
//       expect(response.body).toHaveLength(1);
//       expect(response.body[0].trackingNumber).toBe('TRK123');
//     });
    
//     it('should filter packages by status', async () => {
//       await Package.create({
//         trackingNumber: 'TRK456',
//         senderName: 'S',
//         senderPhone: '06',
//         recipientName: 'R',
//         recipientPhone: '06',
//         pickupAddress: 'P',
//         deliveryAddress: 'D',
//         status: 'assigned',
//         zoneId: testZone.id
//       });
      
//       const response = await request(app)
//         .get('/api/packages?status=pending')
//         .expect(200);
      
//       expect(response.body).toHaveLength(1);
//       expect(response.body[0].status).toBe('pending');
//     });
//   });
  
//   describe('POST /api/packages', () => {
    
//     it('should create new package', async () => {
//       const packageData = {
//         trackingNumber: 'NEW123',
//         senderName: 'New Sender',
//         senderPhone: '0611111111',
//         recipientName: 'New Recipient',
//         recipientPhone: '0622222222',
//         pickupAddress: 'New Pickup',
//         deliveryAddress: 'New Delivery',
//         weight: 2.5,
//         zoneId: testZone.id
//       };
      
//       const response = await request(app)
//         .post('/api/packages')
//         .send(packageData)
//         .expect(201);
      
//       expect(response.body.trackingNumber).toBe('NEW123');
//       expect(response.body.status).toBe('pending');
//     });
//   });
  
//   describe('PUT /api/packages/:id/assign', () => {
    
//     it('should assign package to deliverer successfully', async () => {
//       const response = await request(app)
//         .put(`/api/packages/${testPackage.id}/assign`)
//         .send({ delivererId: testDeliverer.id })
//         .expect(201);
      
//       expect(response.body.message).toContain('assigned successfully');
//       expect(response.body.data).toBeDefined();
      
//       // Verify in database
//       await testPackage.reload();
//       expect(testPackage.delivererId).toBe(testDeliverer.id);
//       expect(testPackage.status).toBe('assigned');
      
//       await testDeliverer.reload();
//       expect(testDeliverer.currentCapacity).toBe(1);
//     });
    
//     it('should return 404 if package not found', async () => {
//       const response = await request(app)
//         .put('/api/packages/99999/assign')
//         .send({ delivererId: testDeliverer.id })
//         .expect(404);
      
//       expect(response.body.error).toContain('not found');
//     });
    
//     it('should return 404 if deliverer not found', async () => {
//       const response = await request(app)
//         .put(`/api/packages/${testPackage.id}/assign`)
//         .send({ delivererId: 99999 })
//         .expect(404);
      
//       expect(response.body.error).toContain('not found');
//     });
    
//     it('should return 409 if deliverer at max capacity', async () => {
//       await testDeliverer.update({
//         currentCapacity: 5,
//         maxCapacity: 5
//       });
      
//       const response = await request(app)
//         .put(`/api/packages/${testPackage.id}/assign`)
//         .send({ delivererId: testDeliverer.id })
//         .expect(409);
      
//       expect(response.body.error).toContain('max capacity');
//     });
    
//     it('should return 409 if package already assigned', async () => {
//       await testPackage.update({ status: 'assigned' });
      
//       const response = await request(app)
//         .put(`/api/packages/${testPackage.id}/assign`)
//         .send({ delivererId: testDeliverer.id })
//         .expect(409);
      
//       expect(response.body.error).toContain('already assigned');
//     });
    
//     it('should return 409 if deliverer not available', async () => {
//       await testDeliverer.update({ isAvailable: false });
      
//       const response = await request(app)
//         .put(`/api/packages/${testPackage.id}/assign`)
//         .send({ delivererId: testDeliverer.id })
//         .expect(409);
      
//       expect(response.body.error).toContain('not available');
//     });
//   });
  
//   describe('PUT /api/packages/:id/auto-assign', () => {
    
//     it('should auto-assign to best available deliverer', async () => {
//       const response = await request(app)
//         .put(`/api/packages/${testPackage.id}/auto-assign`)
//         .expect(201);
      
//       expect(response.body.message).toContain('auto-assigned successfully');
      
//       await testPackage.reload();
//       expect(testPackage.delivererId).toBe(testDeliverer.id);
//     });
    
//     it('should return 404 if no deliverer available', async () => {
//       await testDeliverer.update({ isAvailable: false });
      
//       const response = await request(app)
//         .put(`/api/packages/${testPackage.id}/auto-assign`)
//         .expect(404);
      
//       expect(response.body.error).toContain('No available deliverer');
//     });
    
//     it('should choose deliverer with lowest capacity', async () => {
//       // Create another deliverer with higher capacity
//       const deliverer2 = await Deliverer.create({
//         name: 'Mohamed',
//         phone: '0699999999',
//         maxCapacity: 5,
//         currentCapacity: 3,
//         isAvailable: true,
//         currentZoneId: testZone.id
//       });
      
//       const response = await request(app)
//         .put(`/api/packages/${testPackage.id}/auto-assign`)
//         .expect(201);
      
//       await testPackage.reload();
//       // Should assign to testDeliverer (capacity 0) not deliverer2 (capacity 3)
//       expect(testPackage.delivererId).toBe(testDeliverer.id);
//     });
//   });
  
//   describe('Concurrent Assignment (Race Condition Test)', () => {
    
//     it('should prevent double assignment with concurrent requests', async () => {
//       // Create deliverer with only 1 capacity
//       const deliverer = await Deliverer.create({
//         name: 'Limited',
//         phone: '0688888888',
//         maxCapacity: 1,
//         currentCapacity: 0,
//         isAvailable: true,
//         currentZoneId: testZone.id
//       });
      
//       // Create 3 packages
//       const package1 = await Package.create({
//         trackingNumber: 'CONC1',
//         senderName: 'S', senderPhone: '06',
//         recipientName: 'R', recipientPhone: '06',
//         pickupAddress: 'P', deliveryAddress: 'D',
//         status: 'pending', zoneId: testZone.id
//       });
      
//       const package2 = await Package.create({
//         trackingNumber: 'CONC2',
//         senderName: 'S', senderPhone: '06',
//         recipientName: 'R', recipientPhone: '06',
//         pickupAddress: 'P', deliveryAddress: 'D',
//         status: 'pending', zoneId: testZone.id
//       });
      
//       const package3 = await Package.create({
//         trackingNumber: 'CONC3',
//         senderName: 'S', senderPhone: '06',
//         recipientName: 'R', recipientPhone: '06',
//         pickupAddress: 'P', deliveryAddress: 'D',
//         status: 'pending', zoneId: testZone.id
//       });
      
//       // Send 3 concurrent requests
//       const requests = [
//         request(app).put(`/api/packages/${package1.id}/assign`).send({ delivererId: deliverer.id }),
//         request(app).put(`/api/packages/${package2.id}/assign`).send({ delivererId: deliverer.id }),
//         request(app).put(`/api/packages/${package3.id}/assign`).send({ delivererId: deliverer.id })
//       ];
      
//       const responses = await Promise.all(requests);
      
//       // Count success and failures
//       const successCount = responses.filter(r => r.status === 201).length;
//       const failCount = responses.filter(r => r.status === 409).length;
      
//       // ONLY 1 should succeed (201), 2 should fail (409)
//       expect(successCount).toBe(1);
//       expect(failCount).toBe(2);
      
//       // Verify deliverer capacity is exactly 1
//       await deliverer.reload();
//       expect(deliverer.currentCapacity).toBe(1);
//     });
//   });
// });