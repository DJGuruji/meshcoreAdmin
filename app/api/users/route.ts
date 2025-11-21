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
    
    // Only admin and super-admin can access user list
    if (!['admin', 'super-admin'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const field = searchParams.get('field') || 'name'; // New field parameter
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 25) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
    }
    
    // Build search query based on field
    let query = {};
    if (search) {
      switch (field) {
        case 'name':
          query = { name: { $regex: search, $options: 'i' } };
          break;
        case 'email':
          query = { email: { $regex: search, $options: 'i' } };
          break;
        case 'role':
          query = { role: { $regex: search, $options: 'i' } };
          break;
        case 'accountType':
          query = { accountType: { $regex: search, $options: 'i' } };
          break;
        default:
          query = {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } }
            ]
          };
      }
    }
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Fetch users with pagination
    const users = await User.find(query)
      .select('-password -resetToken -resetTokenExpiry -emailVerificationToken -emailVerificationTokenExpiry')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const total = await User.countDocuments(query);
    
    return NextResponse.json({
      users,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}