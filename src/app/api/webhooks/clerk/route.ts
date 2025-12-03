import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { Webhook } from 'svix';

const prisma = new PrismaClient();

// Webhook secret from Clerk Dashboard
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  try {
    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Error: Missing svix headers', {
        status: 400,
      });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(webhookSecret);

    let evt: WebhookEvent;

    // Verify the webhook signature
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response('Error: Verification failed', {
        status: 400,
      });
    }

    // Handle the webhook event
    const eventType = evt.type;
    console.log(`Webhook event received: ${eventType}`);

    switch (eventType) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name } = evt.data;
        const email = email_addresses[0]?.email_address;

        if (!email) {
          console.error('No email found for user');
          return new Response('Error: No email found', { status: 400 });
        }

        try {
          // Create user in database
          const user = await prisma.user.create({
            data: {
              clerkId: id,
              email: email,
              credits: 10, // Default starting credits
            },
          });

          console.log('User created in database:', user.id);
        } catch (error) {
          console.error('Error creating user in database:', error);
          // If user already exists, ignore the error
          if ((error as any).code === 'P2002') {
            console.log('User already exists, skipping creation');
          } else {
            throw error;
          }
        }
        break;
      }

      case 'user.updated': {
        const { id, email_addresses } = evt.data;
        const email = email_addresses[0]?.email_address;

        if (!email) {
          console.error('No email found for user');
          return new Response('Error: No email found', { status: 400 });
        }

        try {
          // Update user in database
          const user = await prisma.user.update({
            where: { clerkId: id },
            data: {
              email: email,
            },
          });

          console.log('User updated in database:', user.id);
        } catch (error) {
          console.error('Error updating user in database:', error);
        }
        break;
      }

      case 'user.deleted': {
        const { id } = evt.data;

        if (!id) {
          console.error('No user ID found');
          return new Response('Error: No user ID found', { status: 400 });
        }

        try {
          // Delete user from database
          await prisma.user.delete({
            where: { clerkId: id },
          });

          console.log('User deleted from database:', id);
        } catch (error) {
          console.error('Error deleting user from database:', error);
        }
        break;
      }

      case 'organization.created': {
        const { id, name } = evt.data;
        console.log('Organization created:', { id, name });
        // You can add organization handling logic here if needed
        break;
      }

      case 'organizationMembership.created': {
        const { organization, public_user_data } = evt.data;
        console.log('User joined organization:', {
          orgId: organization.id,
          userId: public_user_data?.user_id,
        });
        // You can add organization membership logic here if needed
        break;
      }

      default:
        console.log('Unhandled webhook event type:', eventType);
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}
