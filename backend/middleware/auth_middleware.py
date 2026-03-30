"""
RoleGuard — 角色權限守衛 Dependency
"""

from fastapi import Depends, HTTPException, status

from core.security import get_current_user


def require_role(allowed_role: str):
    """
    產生一個 Dependency，驗證當前使用者是否為指定角色。
    用法：Depends(require_role("her"))
    """

    async def role_guard(
        current_user: dict = Depends(get_current_user),
    ) -> dict:
        if current_user["role"] != allowed_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"此操作僅限 {allowed_role} 角色",
            )
        return current_user

    return role_guard
