import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();
import pool from './pool.js';

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const adminPass = await bcrypt.hash('nmlozi@265', 10);
    const agentPass = await bcrypt.hash('agent123', 10);
    const userPass = await bcrypt.hash('user123', 10);

    const users = await client.query(`
      INSERT INTO users (name, email, password_hash, role, phone) VALUES
        ('Noel Mlozi', 'noelmlozi265@gmail.com', $1, 'admin', '+265 999 00 00 01'),
        ('Grace Banda', 'grace@nobleestates.mw', $2, 'agent', '+265 888 10 20 30'),
        ('Peter Nkhoma', 'peter@nobleestates.mw', $3, 'agent', '+265 999 40 50 60'),
        ('Chisomo Phiri', 'chisomo@gmail.com', $4, 'user', '+265 881 70 80 90')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, name, role
    `, [adminPass, agentPass, agentPass, userPass]);

    const allUsers = await client.query(`SELECT id, name, email FROM users WHERE email IN ('noelmlozi265@gmail.com', 'grace@nobleestates.mw', 'peter@nobleestates.mw', 'chisomo@gmail.com')`);
    const userMap = {};
    for (const u of allUsers.rows) userMap[u.email] = u;

    const grace = userMap['grace@nobleestates.mw'];
    const peter = userMap['peter@nobleestates.mw'];
    const chisomo = userMap['chisomo@gmail.com'];

    const props = [
      { user_id: grace.id, title: 'Modern 3-Bedroom House in Area 43', desc: 'Beautiful modern house in the heart of Lilongwe. Open plan living with modern kitchen, tiled floors, spacious garden, and secure parking. Walking distance to shopping centres.', price: 185000000, type: 'buy', beds: 3, baths: 2, sqft: 1800, addr: 'Plot 12, Area 43', city: 'Lilongwe', state: 'Central Region', zip: '', lat: -13.9833, lng: 33.7833 },
      { user_id: grace.id, title: 'Luxury Villa in Blantyre CBD', desc: 'Stunning luxury villa in the heart of Blantyre. 5 bedrooms all en-suite, infinity pool, landscaped garden, staff quarters, and double garage. Premium finishes throughout.', price: 450000000, type: 'buy', beds: 5, baths: 5, sqft: 4500, addr: '15 Hannover Avenue', city: 'Blantyre', state: 'Southern Region', zip: '', lat: -15.7861, lng: 35.0058 },
      { user_id: peter.id, title: '2-Bedroom Apartment in Mzuzu', desc: 'Well-maintained 2-bedroom apartment in a quiet Mzuzu neighborhood. Tiled floors, fitted kitchen, reliable water supply, and secure compound. Ideal for a small family.', price: 850000, type: 'rent', beds: 2, baths: 1, sqft: 750, addr: 'Plot 8, Luwinga', city: 'Mzuzu', state: 'Northern Region', zip: '', lat: -11.4656, lng: 34.0207 },
      { user_id: grace.id, title: '4-Bedroom House with Lake View', desc: 'Spacious family home in Mangochi with stunning lake views. Large veranda, mature garden, borehole, and solar backup. Perfect holiday home or permanent residence.', price: 210000000, type: 'buy', beds: 4, baths: 3, sqft: 2800, addr: 'Plot 7, Lake Road', city: 'Mangochi', state: 'Southern Region', zip: '', lat: -14.4596, lng: 35.2521 },
      { user_id: peter.id, title: 'Studio near Mzuzu University', desc: 'Affordable studio unit near Mzuzu University. Furnished with basic amenities. Ideal for students or young professionals. Water and electricity included.', price: 350000, type: 'rent', beds: 0, baths: 1, sqft: 350, addr: 'Area 1B, Luwinga', city: 'Mzuzu', state: 'Northern Region', zip: '', lat: -11.4500, lng: 34.0300 },
      { user_id: grace.id, title: 'Executive Home in Zomba', desc: 'Elegant executive home near Zomba Plateau. Fireplace, wooden floors, spacious living areas, self-contained guest wing, and beautiful garden with mountain views.', price: 175000000, type: 'buy', beds: 4, baths: 3, sqft: 3200, addr: '22 Plateau Road', city: 'Zomba', state: 'Southern Region', zip: '', lat: -15.3875, lng: 35.3188 },
      { user_id: peter.id, title: '3-Bedroom Townhouse in Lilongwe', desc: 'Modern townhouse in a gated community in Lilongwe. 24-hour security, clubhouse access, borehole water, and solar backup. Open plan living with granite kitchen.', price: 1500000, type: 'rent', beds: 3, baths: 2, sqft: 1500, addr: 'Golf Estate, Area 47', city: 'Lilongwe', state: 'Central Region', zip: '', lat: -13.9700, lng: 33.7700 },
      { user_id: grace.id, title: 'Lakefront Cottage in Salima', desc: 'Charming lakefront cottage with private beach access. Thatched roof, outdoor braai area, and tropical garden. Ideal weekend getaway or rental investment.', price: 95000000, type: 'buy', beds: 2, baths: 1, sqft: 1000, addr: 'Plot 5, Senga Bay', city: 'Salima', state: 'Central Region', zip: '', lat: -13.7800, lng: 34.4300 },
      { user_id: peter.id, title: '1-Bedroom Flat in Blantyre', desc: 'Well-located 1-bedroom flat in Blantyre near shopping centres and transport routes. Fitted kitchen, tiled bathroom, and secure parking. Perfect for a single professional.', price: 500000, type: 'rent', beds: 1, baths: 1, sqft: 500, addr: 'Flat 3, Chichiri', city: 'Blantyre', state: 'Southern Region', zip: '', lat: -15.8000, lng: 35.0100 },
      { user_id: grace.id, title: 'Spacious Family Home in Kasungu', desc: 'Large 4-bedroom family home in Kasungu with servant quarters, borehole, vegetable garden, and solar system. Quiet neighbourhood close to schools and market.', price: 120000000, type: 'buy', beds: 4, baths: 2, sqft: 2400, addr: 'Plot 10, Kasungu Town', city: 'Kasungu', state: 'Central Region', zip: '', lat: -13.0333, lng: 33.4833 },
      { user_id: peter.id, title: 'Econo Lodge in Machinga', desc: 'Budget-friendly lodge-style accommodation in Machinga. 8 self-contained rooms with shared kitchen and lounge. Ideal investment for tourism.', price: 65000000, type: 'buy', beds: 8, baths: 8, sqft: 3600, addr: 'Liwonde Road', city: 'Machinga', state: 'Southern Region', zip: '', lat: -15.1700, lng: 35.3000 },
      { user_id: grace.id, title: 'Farmhouse in Dedza', desc: 'Beautiful farmhouse sitting on 5 acres in Dedza. Coffee and macadamia plantation, 3-bedroom main house, staff house, and storage facilities. Breathtaking highland views.', price: 280000000, type: 'buy', beds: 3, baths: 2, sqft: 2200, addr: 'Dedza Mountain Rd', city: 'Dedza', state: 'Central Region', zip: '', lat: -14.3667, lng: 34.3333 },
      { user_id: peter.id, title: 'Guest House in Nkhata Bay', desc: 'Well-established guest house in Nkhata Bay with 6 rooms, restaurant, and bar. Direct lake access and stunning sunset views. Turnkey business opportunity.', price: 180000000, type: 'buy', beds: 6, baths: 6, sqft: 4000, addr: 'Bay Road', city: 'Nkhata Bay', state: 'Northern Region', zip: '', lat: -11.6069, lng: 34.2961 },
      { user_id: grace.id, title: 'New 2-Bedroom House in Thyolo', desc: 'Newly built 2-bedroom house in Thyolo tea-growing region. Quality finishes, tiled throughout, modern bathroom, and fenced yard. Quiet rural setting.', price: 55000000, type: 'buy', beds: 2, baths: 1, sqft: 1000, addr: 'Thyolo Boma', city: 'Thyolo', state: 'Southern Region', zip: '', lat: -16.0667, lng: 35.1333 },
      { user_id: peter.id, title: 'Office Space in Lilongwe City Centre', desc: 'Prime commercial office space in downtown Lilongwe. Open plan with 3 private offices, boardroom, kitchen, and reception. Ideal for a growing business.', price: 2000000, type: 'rent', beds: 0, baths: 2, sqft: 1200, addr: '3rd Floor, Capital Mall', city: 'Lilongwe', state: 'Central Region', zip: '', lat: -13.9850, lng: 33.7850 },
    ];

    const propertyIds = [];
    for (const p of props) {
      const result = await client.query(
        `INSERT INTO properties (user_id, title, description, price, type, bedrooms, bathrooms, area_sqft, address, city, state, zip, lat, lng, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id`,
        [p.user_id, p.title, p.desc, p.price, p.type, p.beds, p.baths, p.sqft, p.addr, p.city, p.state, p.zip, p.lat, p.lng, 'active']
      );
      propertyIds.push(result.rows[0].id);
    }

    const imageUrls = [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
    ];

    for (const pid of propertyIds) {
      const primary = imageUrls[Math.floor(Math.random() * imageUrls.length)];
      await client.query(
        'INSERT INTO property_images (property_id, url, is_primary) VALUES ($1, $2, TRUE)',
        [pid, primary]
      );
      const extra = imageUrls.filter(u => u !== primary).slice(0, 2);
      for (const url of extra) {
        await client.query(
          'INSERT INTO property_images (property_id, url, is_primary) VALUES ($1, $2, FALSE)',
          [pid, url]
        );
      }
    }

    await client.query('COMMIT');
    console.log('Seed completed successfully!');
    console.log(`Created ${users.rows.length} users and ${props.length} properties.`);
    console.log('\nLogin credentials:');
    console.log('  Admin:  noelmlozi265@gmail.com / nmlozi@265');
    console.log('  Agent:  grace@nobleestates.mw / agent123');
    console.log('  Agent:  peter@nobleestates.mw / agent123');
    console.log('  User:   chisomo@gmail.com / user123');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
};

seed();
