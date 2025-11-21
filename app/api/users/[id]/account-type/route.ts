import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import { authOptions } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

// Function to send email notification
async function sendAccountTypeChangeEmail(user: any, newAccountType: string, adminName: string) {
  const subject = 'Your Account Type Has Been Updated';
  const text = `Dear ${user.name},

Your account type has been changed from ${user.accountType} to ${newAccountType} by ${adminName}.

New Account Type: ${newAccountType}

If you have any questions, please contact support.

Best regards,
The Admin Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Account Type Update Notification</h2>
      <p>Dear ${user.name},</p>
      <p>Your account type has been changed from <strong>${user.accountType}</strong> to <strong>${newAccountType}</strong> by ${adminName}.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;">New Account Type: <span style="color: #4f46e5; font-weight: bold;">${newAccountType}</span></p>
      </div>
      <p>If you have any questions, please contact support.</p>
      <p>Best regards,<br>The Admin Team</p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject,
    text,
    html,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only admin and super-admin can update account types
    if (!['admin', 'super-admin'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Resolve the params promise
    const { id } = await params;
    
    // Prevent users from changing their own account type
    if (session.user.id === id) {
      return NextResponse.json({ error: 'You cannot change your own account type' }, { status: 400 });
    }
    
    await connectDB();
    
    const { accountType } = await request.json();
    
    // Validate account type
    const validAccountTypes = ['free', 'freemium', 'pro', 'ultra-pro'];
    if (!validAccountTypes.includes(accountType)) {
      return NextResponse.json({ error: 'Invalid account type' }, { status: 400 });
    }
    
    // Find and update the user
    const user = await User.findById(id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Store the old account type for the email
    const oldAccountType = user.accountType;
    
    // Prevent super-admins from having their account type changed by regular admins
    if (user.role === 'super-admin' && session.user.role !== 'super-admin') {
      return NextResponse.json({ error: 'Only super-admins can modify other super-admins' }, { status: 403 });
    }
    
    user.accountType = accountType;
    await user.save();
    
    // Send email notification
    await sendAccountTypeChangeEmail(user, accountType, session.user.name || 'Admin');
    
    return NextResponse.json({ 
      message: 'Account type updated successfully', 
      user,
      notification: {
        oldAccountType,
        newAccountType: accountType
      }
    });
  } catch (error) {
    console.error('Error updating account type:', error);
    return NextResponse.json({ error: 'Failed to update account type' }, { status: 500 });
  }
}