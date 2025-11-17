"""Check admin user in database"""
import asyncio
from app.database import AsyncSessionLocal
from app.models.user import User
from sqlalchemy import select


async def check():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.username == 'admin'))
        admin = result.scalar_one_or_none()
        
        if admin:
            print('✅ Admin found:')
            print(f'   Username: {admin.username}')
            print(f'   Email: {admin.email}')
            print(f'   Role: {admin.role}')
            print(f'   Has password: {admin.hashed_password is not None}')
            print(f'   Is active: {admin.is_active}')
        else:
            print('❌ Admin user not found in database!')


if __name__ == '__main__':
    asyncio.run(check())

