import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import { authOptions } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

// Function to send email notification
async function sendRoleChangeEmail(user: any, newRole: string, adminName: string) {
  const subject = 'Your Role Has Been Updated';
  const text = `Dear ${user.name},

Your role has been changed from ${user.role} to ${newRole} by ${adminName}.

New Role: ${newRole}

If you have any questions, please contact support.

Best regards,
The Admin Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Role Update Notification</h2>
      <p>Dear ${user.name},</p>
      <p>Your role has been changed from <strong>${user.role}</strong> to <strong>${newRole}</strong> by ${adminName}.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;">New Role: <span style="color: #4f46e5; font-weight: bold;">${newRole}</span></p>
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