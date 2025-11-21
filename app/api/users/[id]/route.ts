import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only admin and super-admin can delete users
    if (!['admin', 'super-admin'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Resolve the params promise
    const { id } = await params;
    
    // Prevent users from deleting themselves
    if (session.user.id === id) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }
    
    await connectDB();
    
    // Find and delete the user
    const user = await User.findById(id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Prevent super-admins from being deleted by regular admins
    if (user.role === 'super-admin' && session.user.role !== 'super-admin') {
      return NextResponse.json({ error: 'Only super-admins can delete other super-admins' }, { status: 403 });
    }
    
    await User.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}