const { sequelize } = require('../config/database');
const { Package, Deliverer } = require('../models');

class DispatcherService {
   async assignPackageToDeliverer(packageId, delivererId) {
    const transaction = await sequelize.transaction({
      isolationLevel: sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED
    });
    try {
      //  Lock the deliverer row (FOR UPDATE)
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
      //  Check availability and capacity with locked row
      if (!deliverer.isAvailable) {
        await transaction.rollback();
        return {
          success: false,
          error: 'Deliverer is not available',
          code: 409
        };
      }
      //  Lock the package row
      const package = await Package.findByPk(packageId, {
        lock: transaction.LOCK.UPDATE,
        transaction
      });
      
      if (!package) {
        await transaction.rollback();
        return {
          success: false,
          error: 'Package not found',
          code: 404
        };
      }
      
      if (package.status !== 'pending') {
        await transaction.rollback();
        return {
          success: false,
          error: 'Package already assigned',
          code: 409
        };
      }
      //  Perform the assignment (both updates in same transaction)
      await package.update({
        delivererId,
        status: 'assigned'
      }, { transaction });
      
      await deliverer.increment('currentCapacity', { 
        by: 1, 
        transaction 
      });
       // Commit transaction
      await transaction.commit();
      
      console.log(` Package ${packageId} assigned to Deliverer ${delivererId}`);
      
      return {
        success: true,
        data: {
          package,
          deliverer
        }
      };
      } catch (error) {
      // Rollback on any error
      await transaction.rollback();
      console.error(' Assignment failed:', error.message);
      
      return {
        success: false,
        error: 'Assignment failed: ' + error.message,
        code: 500
      };
    }
  }
  //find the available deliverer in a zone 
   async findBestDeliverer(zoneId) {
      try {
      const deliverer = await Deliverer.findOne({
        where: {
          currentZoneId: zoneId,
          isAvailable: true,
          currentCapacity: {
            [sequelize.Op.lt]: sequelize.col('maxCapacity')
          }
        },
        order: [
          ['currentCapacity', 'ASC'], // Prefer deliverers with less load
          ['createdAt', 'ASC']
        ]
      });
      
      return deliverer;
       } catch (error) {
      console.error(' Find best deliverer failed:', error.message);
      return null;
    }
  }

  
  //auto assign package to best available deliverer
  async autoAssignPackage(packageId) {
    try {
      const package = await Package.findByPk(packageId);
      
      if (!package) {
        return {
          success: false,
          error: 'Package not found',
          code: 404
        };
      }
      //find the best deliverer in the zone 
       const deliverer = await this.findBestDeliverer(package.zoneId);
      
      if (!deliverer) {
        return {
          success: false,
          error: 'No available deliverer in this zone',
          code: 404
        };
      }
      // assign with transaction locking 
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
