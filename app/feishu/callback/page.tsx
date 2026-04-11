"use client";

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { feishuAPI } from '@/lib/feishu-api';

export default function FeishuCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleCallback(code);
    }
  }, [searchParams, router]);

  const handleCallback = async (code: string) => {
    try {
      await feishuAPI.getTokenFromCode(code);
      router.push('/');
    } catch (error) {
      console.error('飞书授权失败:', error);
      router.push('/');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">正在处理飞书授权...</p>
      </div>
    </div>
  );
}