// reconcile-users.js
// Read-only by default. If run with DELETE=true in env, it will delete prisma-only users.
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const prisma = new PrismaClient();

async function listSupabaseUsers() {
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
  throw new Error('Supabase admin user listing API not available');
}

async function main() {
  try {
    console.log('Comparing Supabase and Prisma users...');
    const sbUsers = await listSupabaseUsers();
    const pUsers = await prisma.user.findMany({ select: { id: true, email: true, username: true, createdAt: true } });

    const sbById = new Map(sbUsers.map(u => [u.id, u]));
    const sbByEmail = new Map(sbUsers.map(u => [u.email, u]));

    const prismaOnly = [];
    for (const p of pUsers) {
      if (!sbById.has(p.id) && !(p.email && sbByEmail.has(p.email))) prismaOnly.push(p);
    }

    console.log(`Prisma-only users: ${prismaOnly.length}`);
    prismaOnly.forEach(u => console.log(JSON.stringify(u)));

    if (prismaOnly.length === 0) {
      console.log('Nothing to reconcile.');
      return;
    }

    if (process.env.DELETE === 'true') {
      console.log('DELETE=true detected: deleting prisma-only users...');
      for (const u of prismaOnly) {
        try {
          await prisma.user.delete({ where: { id: u.id } });
          console.log('Deleted', u.id);
        } catch (e) {
          console.error('Failed to delete', u.id, e.message || e);
        }
      }
    } else {
      console.log('\nDry-run: no deletions performed. To delete these users, re-run with DELETE=true in the environment.');
    }
  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
