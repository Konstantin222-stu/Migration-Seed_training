'use strict';

module.exports = {
  async up(queryInterface, Sequelize){
    await queryInterface.createTable('categories',{
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      code:{
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },

      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      created_at:{
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updated_at:{
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })
  },
  async down(queryInterface){
    await queryInterface.dropTable('categories')
  }
}