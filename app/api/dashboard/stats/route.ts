import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only admin and super-admin can access stats
    if (!['admin', 'super-admin'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    await connectDB();
    
    const [totalUsers, admins, staffs, superAdmins, blocked] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'staff' }),
      User.countDocuments({ role: 'super-admin' }),
      User.countDocuments({ blocked: true })
    ]);
    
    return NextResponse.json({
      totalUsers,
      admins,
      staffs,
      superAdmins,
      blocked
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
