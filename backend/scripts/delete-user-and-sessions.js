// delete-user-and-sessions.js
// Destructive: deletes sessions belonging to a user and then deletes the user.
// Usage (PowerShell): $env:USER_ID='c4540a37-...'; node scripts/delete-user-and-sessions.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = process.env.USER_ID || process.argv[2];
  if (!userId) {
    console.error('Provide USER_ID via env or first argument.');
    process.exit(1);
  }

  try {
    console.log('Deleting sessions for user:', userId);
    const deletedSessions = await prisma.session.deleteMany({ where: { userId } });
    console.log('Deleted sessions count:', deletedSessions.count);

    console.log('Deleting user:', userId);
    const deletedUser = await prisma.user.delete({ where: { id: userId } });
    console.log('Deleted user:', deletedUser.id);
  } catch (e) {
    console.error('Error during deletion:', e.message || e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
