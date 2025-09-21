// compare-users.js
// Read-only script to compare Supabase auth users and Prisma users table.
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const prisma = new PrismaClient();

async function listSupabaseUsers() {
  console.log('Attempting to list Supabase users via admin API...');
  // Depending on the @supabase/supabase-js version, the admin API shape may differ.
  if (supabase.auth && supabase.auth.admin && typeof supabase.auth.admin.listUsers === 'function') {
    const users = [];
    let page = 1;
    const perPage = 100;
    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      if (!data || !data.users) break;
      users.push(...data.users);
      if (data.users.length < perPage) break;
      page++;
    }
    return users;
  }

  if (supabase.admin && typeof supabase.admin.listUsers === 'function') {
    // older/other naming
    const { data, error } = await supabase.admin.listUsers();
    if (error) throw error;
    return data.users || data || [];
  }

  throw new Error('Supabase admin user listing API not found on client. Check SDK version and service role key.');
}

async function main() {
  try {
    console.log('Fetching Supabase users...');
    const sbUsers = await listSupabaseUsers();
    console.log(`Supabase users: ${sbUsers.length}`);

    console.log('Fetching Prisma users...');
    const pUsers = await prisma.user.findMany({ select: { id: true, email: true, username: true, createdAt: true } });
    console.log(`Prisma users: ${pUsers.length}`);

    const sbById = new Map(sbUsers.map(u => [u.id, u]));
    const sbByEmail = new Map(sbUsers.map(u => [u.email, u]));

    const prismaOnly = [];
    const supabaseOnly = [];

    for (const p of pUsers) {
      if (!sbById.has(p.id) && !(p.email && sbByEmail.has(p.email))) {
        prismaOnly.push(p);
      }
    }

    for (const s of sbUsers) {
      const has = pUsers.find(p => p.id === s.id || (s.email && p.email === s.email));
      if (!has) supabaseOnly.push({ id: s.id, email: s.email });
    }

    console.log('\n==== Summary ====');
    console.log(`Supabase users count: ${sbUsers.length}`);
    console.log(`Prisma users count: ${pUsers.length}`);
    console.log(`Prisma-only users (exist in app DB but not in Supabase): ${prismaOnly.length}`);
    console.log(`Supabase-only users (exist in Supabase but not in app DB): ${supabaseOnly.length}`);

    if (prismaOnly.length) {
      console.log('\n--- Prisma-only users ---');
      prismaOnly.forEach(u => console.log(JSON.stringify(u)));
    }

    if (supabaseOnly.length) {
      console.log('\n--- Supabase-only users ---');
      supabaseOnly.forEach(u => console.log(JSON.stringify(u)));
    }

    console.log('\nNote: This script is read-only. To reconcile, choose one of:');
    console.log('- Delete Prisma-only users (prisma.user.delete)');
    console.log('- Create Supabase users for Prisma-only entries (supabase.auth.admin.createUser)');
    console.log('- Or import/migrate selectively.');

  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
