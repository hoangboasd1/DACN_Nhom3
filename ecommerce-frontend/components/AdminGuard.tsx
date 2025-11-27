'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminGuardProps {
  children: React.ReactNode;
}

function base64UrlDecode(input: string) {
  // JWT payload là base64url -> chuyển sang base64 chuẩn
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = input.length % 4;
  if (pad) input += '='.repeat(4 - pad);
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(input), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

function decodeJwtPayload<T = any>(token: string): T | null {
  try {
    const clean = token.startsWith('Bearer ') ? token.slice(7) : token;
    const parts = clean.split('.');
    if (parts.length < 2) return null;
    const json = base64UrlDecode(parts[1]);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function extractRoles(payload: any): string[] {
  if (!payload) return [];
  // Hỗ trợ nhiều cách đặt claim role
  const candidates = [
    payload.role,
    payload.roles,
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
    payload['roles'] // đề phòng lib khác
  ];
  const flat = ([] as any[]).concat(
    ...candidates
      .filter((v) => v !== undefined && v !== null)
      .map((v) => (Array.isArray(v) ? v : [v]))
  );
  return flat.map((r) => String(r).trim());
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const stored = localStorage.getItem('token');
        if (!stored) {
          router.replace('/admin-login');
          return;
        }

        const payload = decodeJwtPayload(stored);
        if (!payload) {
          localStorage.removeItem('token');
          router.replace('/admin-login');
          return;
        }

        // Kiểm tra hạn token (exp là giây epoch)
        const now = Math.floor(Date.now() / 1000);
        if (typeof payload.exp === 'number' && payload.exp < now) {
          localStorage.removeItem('token');
          router.replace('/admin-login');
          return;
        }

        // (tuỳ chọn) Kiểm tra not-before nếu có
        if (typeof payload.nbf === 'number' && payload.nbf > now) {
          localStorage.removeItem('token');
          router.replace('/admin-login');
          return;
        }

        // Lấy roles và kiểm tra "Admin" hoặc "admin"
        const roles = extractRoles(payload);
        const normalizedRoles = roles.map((r) => r.toLowerCase());
        if (!normalizedRoles.includes('admin')) {
          localStorage.removeItem('token');
          router.replace('/admin-login');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Admin guard error:', error);
        localStorage.removeItem('token');
        router.replace('/admin-login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return <>{children}</>;
}
