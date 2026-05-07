// app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  // Instantly push anyone who visits the root URL straight to the login page
  redirect('/login');
}