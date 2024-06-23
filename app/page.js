// src/app/page.js

import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>Welcome to the Dummy Web App</h1>
      <Link href="/login">Go to Login Page</Link>
    </div>
  );
}
