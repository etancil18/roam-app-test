'use client';

import { Suspense } from 'react';
import LoginPage from './LoginPage';

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading login...</div>}>
      <LoginPage />
    </Suspense>
  );
}
