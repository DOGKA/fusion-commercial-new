/**
 * Migration Script: Generate Contract Access Tokens
 * 
 * This script generates contractAccessToken for existing orders that don't have one.
 * Run this script after deploying the schema changes.
 * 
 * Usage:
 * cd packages/db
 * npx ts-node scripts/generate-contract-tokens.ts
 */

import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function generateContractTokens() {
  console.log('Starting contract access token generation...');

  // Find all orders without a contractAccessToken
  // Note: Run `npx prisma generate` before running this script
  const ordersWithoutToken = await prisma.order.findMany({
    where: {
      // @ts-expect-error - Field exists after prisma generate
      contractAccessToken: null
    },
    select: {
      id: true,
      orderNumber: true
    }
  });

  console.log(`Found ${ordersWithoutToken.length} orders without contract access token`);

  if (ordersWithoutToken.length === 0) {
    console.log('No orders to update. All orders already have tokens.');
    return;
  }

  let updated = 0;
  let errors = 0;

  for (const order of ordersWithoutToken) {
    try {
      const token = randomBytes(32).toString('hex');
      
      await prisma.order.update({
        where: { id: order.id },
        // @ts-expect-error - Field exists after prisma generate
        data: { contractAccessToken: token }
      });

      updated++;
      
      if (updated % 100 === 0) {
        console.log(`Progress: ${updated}/${ordersWithoutToken.length} orders updated`);
      }
    } catch (error) {
      console.error(`Failed to update order ${order.orderNumber}:`, error);
      errors++;
    }
  }

  console.log('\n=== Migration Complete ===');
  console.log(`Successfully updated: ${updated} orders`);
  console.log(`Failed: ${errors} orders`);
}

generateContractTokens()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
