"""Test admin login locally"""
import asyncio
import sys
sys.path.insert(0, '.')

from app.database import AsyncSessionLocal
from app.models.user import User
from app.core.security import verify_password
from sqlalchemy import select


async def test_admin_login():
    """Test admin login"""
    username = "admin"
    password = "admin123"
    
    async with AsyncSessionLocal() as db:
        # Find admin user
        result = await db.execute(
            select(User).where(User.username == username)
        )
        admin = result.scalar_one_or_none()
        
        if not admin:
            print(f"❌ User '{username}' not found in database!")
            print("\n💡 You need to create an admin user first.")
            print("   Run: python create_admin.py")
            return
        
        print(f"✅ User '{username}' found in database:")
        print(f"   ID: {admin.id}")
        print(f"   Username: {admin.username}")
        print(f"   Email: {admin.email}")
        print(f"   Display Name: {admin.display_name}")
        print(f"   Role: {admin.role}")
        print(f"   Is Active: {admin.is_active}")
        print(f"   Has Password: {admin.hashed_password is not None}")
        
        # Test password
        if admin.hashed_password:
            password_valid = verify_password(password, admin.hashed_password)
            print(f"\n🔐 Password '{password}' is {'✅ VALID' if password_valid else '❌ INVALID'}")
            
            if not password_valid:
                print("\n💡 The password in the database doesn't match 'admin123'")
                print("   You may need to reset the admin password.")
        else:
            print("\n❌ Admin user has no password set!")


if __name__ == '__main__':
    asyncio.run(test_admin_login())

