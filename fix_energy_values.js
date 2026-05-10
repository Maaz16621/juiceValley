const admin = require('firebase-admin');
const serviceAccount = require('./juicevalley-33052-firebase-adminsdk-fbsvc-dcaab3344d.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixEnergyValues() {
  try {
    const productsSnapshot = await db.collection('products').get();
    let count = 0;

    console.log(`Checking ${productsSnapshot.size} products...`);

    for (const productDoc of productsSnapshot.docs) {
      const data = productDoc.data();
      if (data.energyValue && typeof data.energyValue === 'string') {
        // Strip ' kcal' or 'kcal' and convert to number if possible
        let newValue = data.energyValue.replace(/kcal/gi, '').trim();
        
        if (newValue !== data.energyValue) {
          await db.collection('products').doc(productDoc.id).update({
            energyValue: newValue
          });
          console.log(`Updated product ${data.name}: ${data.energyValue} -> ${newValue}`);
          count++;
        }
      }
    }

    console.log(`\nFinished! Updated ${count} products.`);
    process.exit(0);
  } catch (error) {
    console.error('Error fixing energy values:', error);
    process.exit(1);
  }
}

fixEnergyValues();
