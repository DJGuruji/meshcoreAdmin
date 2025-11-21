import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import { authOptions } from '@/lib/auth';

// Function to send email notification
async function sendRoleChangeEmail(user: any, newRole: string, adminName: string) {
  try {
    // In a real implementation, you would use a service like nodemailer or a third-party email service
    // For now, we'll just log the email content
    console.log('===== EMAIL NOTIFICATION =====');
    console.log(`To: ${user.email}`);
    console.log(`Subject: Your Role Has Been Updated`);
    console.log(`Body:`);
    console.log(`Dear ${user.name},`);
    console.log(``);
    console.log(`Your role has been changed from ${user.role} to ${newRole} by ${adminName}.`);
    console.log(``);
    console.log(`New Role: ${newRole}`);
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
      subject: 'Your Role Has Been Updated',
      text: `Dear ${user.name},

Your role has been changed from ${user.role} to ${newRole} by ${adminName}.

New Role: ${newRole}

If you have any questions, please contact support.

Best regards,
The Admin Team`
    });
    */
    
    return { success: true };
  } catch (error) {
    console.error('Failed to send role change email:', error);
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
    
    // Only super-admin can update roles
    if (session.user.role !== 'super-admin') {
      return NextResponse.json({ error: 'Only super-admins can update user roles' }, { status: 403 });
    }
    
    // Resolve the params promise
    const { id } = await params;
    
    // Prevent users from changing their own role
    if (session.user.id === id) {
      return NextResponse.json({ error: 'You cannot change your own role' }, { status: 400 });
    }
    
    await connectDB();
    
    const { role } = await request.json();
    
    // Validate role
    const validRoles = ['user', 'staff', 'admin', 'super-admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    
    // Find and update the user
    const user = await User.findById(id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Store the old role for the email
    const oldRole = user.role;
    
    // Prevent the last super-admin from being demoted
    if (user.role === 'super-admin') {
      const superAdminCount = await User.countDocuments({ role: 'super-admin' });
      if (superAdminCount <= 1 && role !== 'super-admin') {
        return NextResponse.json({ error: 'Cannot demote the last super-admin' }, { status: 400 });
      }
    }
    
    user.role = role;
    await user.save();
    
    // Send email notification
    await sendRoleChangeEmail(user, role, session.user.name || 'Super Admin');
    
    return NextResponse.json({ 
      message: 'Role updated successfully', 
      user,
      notification: {
        oldRole,
        newRole: role
      }
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}