const admin = require('firebase-admin');
const serviceAccount = require('./juicevalley-33052-firebase-adminsdk-fbsvc-dcaab3344d.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const categories = [
  { name: 'Squeezed', description: '100% freshly squeezed fruit and vegetable juices.' },
  { name: 'Blends', description: 'Delicious fruit and vegetable smoothie blends.' },
  { name: 'Vital Cleanse', description: 'Functional juices designed for detox and wellness.' },
  { name: 'Cake', description: 'Healthy and nutritious desserts and cakes.' },
  { name: 'Shake', description: 'Protein-packed shakes and meal replacements.' }
];

const products = [
  // Squeezed
  {
    categoryName: 'Squeezed',
    name: 'Fresh Orange',
    description: '100% Pure freshly squeezed oranges, packed with Vitamin C.',
    price: 4.5,
    energyValue: '120 kcal',
    ingredients: ['Orange'],
    sizePrices: {
      S: { enabled: true, price: 3.5 },
      M: { enabled: true, price: 4.5 },
      L: { enabled: true, price: 5.5 }
    }
  },
  {
    categoryName: 'Squeezed',
    name: 'Apple Spark',
    description: 'Crisp and refreshing freshly squeezed green apples.',
    price: 4.5,
    energyValue: '130 kcal',
    ingredients: ['Green Apple'],
    sizePrices: {
      S: { enabled: true, price: 3.5 },
      M: { enabled: true, price: 4.5 },
      L: { enabled: true, price: 5.5 }
    }
  },
  {
    categoryName: 'Squeezed',
    name: 'Carrot Glow',
    description: 'Sweet and earthy freshly squeezed carrots for a healthy glow.',
    price: 4.5,
    energyValue: '95 kcal',
    ingredients: ['Carrot'],
    sizePrices: {
      S: { enabled: true, price: 3.5 },
      M: { enabled: true, price: 4.5 },
      L: { enabled: true, price: 5.5 }
    }
  },
  // Blends
  {
    categoryName: 'Blends',
    name: 'Berry Blast',
    description: 'A powerful mix of antioxidant-rich berries and banana.',
    price: 6.5,
    energyValue: '210 kcal',
    ingredients: ['Strawberry', 'Blueberry', 'Raspberry', 'Banana', 'Apple Juice'],
    sizePrices: {
      S: { enabled: true, price: 5.5 },
      M: { enabled: true, price: 6.5 },
      L: { enabled: true, price: 7.5 }
    }
  },
  {
    categoryName: 'Blends',
    name: 'Tropical Twist',
    description: 'Exotic mango and pineapple blend with a hint of coconut.',
    price: 6.5,
    energyValue: '230 kcal',
    ingredients: ['Mango', 'Pineapple', 'Coconut Milk', 'Banana'],
    sizePrices: {
      S: { enabled: true, price: 5.5 },
      M: { enabled: true, price: 6.5 },
      L: { enabled: true, price: 7.5 }
    }
  },
  {
    categoryName: 'Blends',
    name: 'Green Power',
    description: 'A nutrient-dense blend of leafy greens and refreshing fruits.',
    price: 6.5,
    energyValue: '180 kcal',
    ingredients: ['Spinach', 'Kale', 'Green Apple', 'Ginger', 'Lemon'],
    sizePrices: {
      S: { enabled: true, price: 5.5 },
      M: { enabled: true, price: 6.5 },
      L: { enabled: true, price: 7.5 }
    }
  },
  // Vital Cleanse
  {
    categoryName: 'Vital Cleanse',
    name: 'Detox Green',
    description: 'Hydrating cucumber and celery blend for a deep body detox.',
    price: 7.5,
    energyValue: '80 kcal',
    ingredients: ['Cucumber', 'Celery', 'Parsley', 'Spinach', 'Lemon', 'Ginger'],
    sizePrices: {
      S: { enabled: true, price: 6.5 },
      M: { enabled: true, price: 7.5 },
      L: { enabled: true, price: 8.5 }
    }
  },
  {
    categoryName: 'Vital Cleanse',
    name: 'Beet It',
    description: 'Energizing beetroot and carrot blend to boost your stamina.',
    price: 7.5,
    energyValue: '110 kcal',
    ingredients: ['Beetroot', 'Carrot', 'Ginger', 'Apple', 'Lemon'],
    sizePrices: {
      S: { enabled: true, price: 6.5 },
      M: { enabled: true, price: 7.5 },
      L: { enabled: true, price: 8.5 }
    }
  },
  {
    categoryName: 'Vital Cleanse',
    name: 'Turmeric Glow',
    description: 'Anti-inflammatory turmeric and ginger blend for immunity.',
    price: 7.5,
    energyValue: '140 kcal',
    ingredients: ['Orange', 'Turmeric', 'Ginger', 'Black Pepper', 'Honey'],
    sizePrices: {
      S: { enabled: true, price: 6.5 },
      M: { enabled: true, price: 7.5 },
      L: { enabled: true, price: 8.5 }
    }
  },
  // Cake
  {
    categoryName: 'Cake',
    name: 'Carrot Cake',
    description: 'Healthy wholemeal carrot cake with crunchy walnuts.',
    price: 5.0,
    energyValue: '320 kcal',
    ingredients: ['Carrot', 'Wholemeal Flour', 'Walnuts', 'Cinnamon', 'Honey', 'Egg'],
    sizePrices: {
      S: { enabled: false, price: '' },
      M: { enabled: true, price: 5.0 },
      L: { enabled: false, price: '' }
    }
  },
  {
    categoryName: 'Cake',
    name: 'Chocolate Avocado Cake',
    description: 'Decadent chocolate cake made healthy with avocado.',
    price: 5.5,
    energyValue: '350 kcal',
    ingredients: ['Avocado', 'Cocoa Powder', 'Maple Syrup', 'Almond Flour', 'Egg'],
    sizePrices: {
      S: { enabled: false, price: '' },
      M: { enabled: true, price: 5.5 },
      L: { enabled: false, price: '' }
    }
  },
  // Shake
  {
    categoryName: 'Shake',
    name: 'Vanilla Protein',
    description: 'Smooth vanilla whey protein shake for muscle recovery.',
    price: 7.0,
    energyValue: '260 kcal',
    ingredients: ['Whey Protein', 'Vanilla Extract', 'Almond Milk', 'Banana'],
    sizePrices: {
      S: { enabled: true, price: 6.0 },
      M: { enabled: true, price: 7.0 },
      L: { enabled: true, price: 8.0 }
    }
  },
  {
    categoryName: 'Shake',
    name: 'Choco Peanut Butter',
    description: 'Rich chocolate and creamy peanut butter protein shake.',
    price: 7.5,
    energyValue: '380 kcal',
    ingredients: ['Protein Powder', 'Cocoa Powder', 'Peanut Butter', 'Oats', 'Milk'],
    sizePrices: {
      S: { enabled: true, price: 6.5 },
      M: { enabled: true, price: 7.5 },
      L: { enabled: true, price: 8.5 }
    }
  }
];

async function insertData() {
  try {
    const categoryMap = {};

    console.log('Inserting categories...');
    for (const cat of categories) {
      // Check if category already exists
      const catQuery = await db.collection('categories').where('name', '==', cat.name).get();
      let catId;
      if (catQuery.empty) {
        const docRef = await db.collection('categories').add({
          ...cat,
          imageUrl: ''
        });
        catId = docRef.id;
        console.log(`Added category: ${cat.name} (${catId})`);
      } else {
        catId = catQuery.docs[0].id;
        console.log(`Category exists: ${cat.name} (${catId})`);
      }
      categoryMap[cat.name] = catId;
    }

    console.log('\nInserting products...');
    for (const prod of products) {
      const { categoryName, ...productData } = prod;
      const categoryId = categoryMap[categoryName];

      if (!categoryId) {
        console.error(`Category not found for product: ${prod.name}`);
        continue;
      }

      // Check if product already exists
      const prodQuery = await db.collection('products')
        .where('name', '==', prod.name)
        .where('categoryId', '==', categoryId)
        .get();

      if (prodQuery.empty) {
        await db.collection('products').add({
          ...productData,
          categoryId,
          isDiscontinued: false,
          imageUrl: ''
        });
        console.log(`Added product: ${prod.name}`);
      } else {
        console.log(`Product exists: ${prod.name}`);
      }
    }

    console.log('\nData insertion complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error inserting data:', error);
    process.exit(1);
  }
}

insertData();
