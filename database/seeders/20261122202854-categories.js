'use strict';

const categories = [
  {
    code: 'inbox',
    name: 'входящие'
  },
  {
    code: 'work',
    name: 'работа',
  },
  {
    code: 'personal',
    name: 'персонально'
  }
]

module.exports = {
  async up(queryInterface){
    const now = new Date();

    for(const category of categories){
      await queryInterface.bulkInsert(
        'categories',
        [{
          ...category,
          created_at: now,
          updated_at: now,
        }],
        {
          ignoreDuplicates: true,
        }
      )
    }
  },

  async down(queryInterface){
    await queryInterface.bulkDelete('categories', {
      code: categories.map((category)=> category.code)
    })
  }
}



