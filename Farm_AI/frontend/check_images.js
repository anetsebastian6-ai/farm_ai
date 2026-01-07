const https = require('https');

const products = [
    { id: 1, name: 'Fresh Tomatoes', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80' },
    { id: 2, name: 'Red Apples', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80' },
    { id: 3, name: 'Organic Spinach', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80' },
    { id: 4, name: 'Fresh Milk', image: 'https://www.bing.com/th/id/OIP.OoLMD1kaGE-oT4i-T43pMQHaHa?auto=format&fit=crop&w=600&q=80' },
    { id: 5, name: 'Bananas', image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86279?auto=format&fit=crop&w=600&q=80' },
    { id: 6, name: 'Whole Wheat', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80' },
    { id: 7, name: 'Carrots', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80' },
    { id: 8, name: 'Eggs', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80' },
    { id: 9, name: 'Potatoes', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80' },
    { id: 10, name: 'Oranges', image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80' },
    { id: 11, name: 'Broccoli', image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=600&q=80' },
    { id: 12, name: 'Amul Butter', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80' },
    { id: 13, name: 'Rice', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80' },
    { id: 14, name: 'Grapes', image: 'https://images.unsplash.com/photo-1537640538965-1756e22e6cc1?auto=format&fit=crop&w=600&q=80' },
    { id: 15, name: 'Onions', image: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80' },
    { id: 16, name: 'Cheese Block', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80' },
    { id: 17, name: 'Bell Peppers', image: 'https://images.unsplash.com/photo-1563565375-f3fdf5d6c469?auto=format&fit=crop&w=600&q=80' },
    { id: 18, name: 'Cucumber', image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=600&q=80' },
    { id: 19, name: 'Strawberries', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80' },
    { id: 20, name: 'Blueberries', image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=600&q=80' },
    { id: 21, name: 'Garlic', image: 'https://images.unsplash.com/photo-1615456937402-b3626af44a72?auto=format&fit=crop&w=600&q=80' },
    { id: 22, name: 'Ginger', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80' },
    { id: 23, name: 'Yogurt', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80' },
    { id: 24, name: 'Honey', image: 'https://images.unsplash.com/photo-1587049352851-8d4e8918dcb1?auto=format&fit=crop&w=600&q=80' },
    { id: 25, name: 'Lentils', image: 'https://images.unsplash.com/photo-1591465001581-d42204566f1c?auto=format&fit=crop&w=600&q=80' },
    { id: 26, name: 'Cabbage', image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=600&q=80' },
    { id: 27, name: 'Cauliflower', image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3d54?auto=format&fit=crop&w=600&q=80' },
    { id: 28, name: 'Mango', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80' },
    { id: 29, name: 'Pineapple', image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80' },
    { id: 30, name: 'Coconut', image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=600&q=80' },
];

async function checkImage(url) {
    return new Promise((resolve) => {
        const req = https.request(url, { method: 'HEAD' }, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.end();
    });
}

async function checkAll() {
    console.log('Checking images...');
    for (const p of products) {
        const isValid = await checkImage(p.image);
        if (!isValid) {
            console.log(`BROKEN: ${p.id} - ${p.name}`);
        } else {
            console.log(`OK: ${p.id} - ${p.name}`);
        }
    }
}

checkAll();
