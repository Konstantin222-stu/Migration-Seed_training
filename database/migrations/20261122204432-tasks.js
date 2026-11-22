'use strict';

module.exports = {
  async up(queryInterface, Sequelize){
    await queryInterface.createTable('tasks', {
      id:{
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      category_id:{
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id',
        },
        onUpdate:'CASCADE',
        onDelete:'RESTRICT',
      },

      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      is_done: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      due_at:{
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
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

    await queryInterface.addIndex('tasks', ['category_id'])
  },
  async down(queryInterface){
    queryInterface.dropTable('tasks')
  }
}