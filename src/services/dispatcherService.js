const { sequelize } = require('../config/database');
const { Package, Deliverer } = require('../models');
const {op} = require('sequelize');
class DispatcherService {
  
  /**
   * Smart assignment with transaction locking
   * Prevents race conditions when multiple packages try to assign to same deliverer
   */
  async assignPackageToDeliverer(packageId, delivererId) {
    const transaction = await sequelize.transaction({
      isolationLevel: 'READ COMMITTED'
    });
    
    try {
      // 1. Lock the deliverer row (FOR UPDATE)
      const deliverer = await Deliverer.findByPk(delivererId, {
        lock: transaction.LOCK.UPDATE,
        transaction
      });
      
      if (!deliverer) {
        await transaction.rollback();
        return {
          success: false,
          error: 'Deliverer not found',
          code: 404
        };
      }
      
      // 2. Check availability and capacity with locked row
      if (!deliverer.isAvailable) {
        await transaction.rollback();
        return {
          success: false,
          error: 'Deliverer is not available',
          code: 409
        };
      }
      
      if (deliverer.currentCapacity >= deliverer.maxCapacity) {
        await transaction.rollback();
        return {
          success: false,
          error: 'Deliverer at max capacity',
          code: 409
        };
      }
      
      // 3. Lock the package row
      const pkg = await Package.findByPk(packageId, {
        lock: transaction.LOCK.UPDATE,
        transaction
      });
      
      if (!pkg) {
        await transaction.rollback();
        return {
          success: false,
          error: 'Package not found',
          code: 404
        };
      }
      
      if (pkg.status !== 'pending') {
        await transaction.rollback();
        return {
          success: false,
          error: 'Package already assigned',
          code: 409
        };
      }
      
      // 4. Perform the assignment (both updates in same transaction)
      await pkg.update({
        delivererId,
        status: 'assigned'
      }, { transaction });
      
      await deliverer.increment('currentCapacity', { 
        by: 1, 
        transaction 
      });
      
      // 5. Commit transaction
      await transaction.commit();
      
      console.log(`✅ Package ${packageId} assigned to Deliverer ${delivererId}`);
      
      return {
        success: true,
        data: {
          package: pkg,
          deliverer
        }
      };
      
    } catch (error) {
      // Rollback on any error
      await transaction.rollback();
      console.error('❌ Assignment failed:', error.message);
      
      return {
        success: false,
        error: 'Assignment failed: ' + error.message,
        code: 500
      };
    }
  }
  
  /**
   * Find best available deliverer in a zone
   */
  async findBestDeliverer(zoneId) {
    try {
      const deliverer = await Deliverer.findOne({
        where: {
          currentZoneId: zoneId,
          isAvailable: true,
          currentCapacity: {
            [Op.lt]: sequelize.col('maxCapacity')
          }
        },
        order: [
          ['currentCapacity', 'ASC'], // Prefer deliverers with less load
          ['createdAt', 'ASC']
        ]
      });
      
      return deliverer;
    } catch (error) {
      console.error('❌ Find best deliverer failed:', error.message);
      return null;
    }
  }
  
  /**
   * Auto-assign package to best available deliverer
   */
  async autoAssignPackage(packageId) {
    try {
      const pkg = await Package.findByPk(packageId);
      
      if (!pkg) {
        return {
          success: false,
          error: 'Package not found',
          code: 404
        };
      }
      
      // Find best deliverer in the zone
      const deliverer = await this.findBestDeliverer(pkg.zoneId);
      
      if (!deliverer) {
        return {
          success: false,
          error: 'No available deliverer in this zone',
          code: 404
        };
      }
      
      // Assign with transaction locking
      return await this.assignPackageToDeliverer(packageId, deliverer.id);
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 500
      };
    }
  }
}

module.exports = new DispatcherService();