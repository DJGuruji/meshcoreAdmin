import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import { authOptions } from '@/lib/auth';

// Function to send email notification
async function sendAccountTypeChangeEmail(user: any, newAccountType: string, adminName: string) {
  try {
    // In a real implementation, you would use a service like nodemailer or a third-party email service
    // For now, we'll just log the email content
    console.log('===== EMAIL NOTIFICATION =====');
    console.log(`To: ${user.email}`);
    console.log(`Subject: Your Account Type Has Been Updated`);
    console.log(`Body:`);
    console.log(`Dear ${user.name},`);
    console.log(``);
    console.log(`Your account type has been changed from ${user.accountType} to ${newAccountType} by ${adminName}.`);
    console.log(``);
    console.log(`New Account Type: ${newAccountType}`);
    console.log(``);
    console.log(`If you have any questions, please contact support.`);
    console.log(``);
    console.log(`Best regards,`);
    console.log(`The Admin Team`);
    console.log('=============================');
    
    // In a real implementation, you would send the actual email here
    // Example with nodemailer:
    /*
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
      // transporter configuration
    });
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'Your Account Type Has Been Updated',
      text: `Dear ${user.name},

Your account type has been changed from ${user.accountType} to ${newAccountType} by ${adminName}.

New Account Type: ${newAccountType}

If you have any questions, please contact support.

Best regards,
The Admin Team`
    });
    */
    
    return { success: true };
  } catch (error) {
    console.error('Failed to send account type change email:', error);
    return { success: false, error: 'Failed to send email notification' };
  }
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