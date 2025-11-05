import { AuthExample } from '@/components/auth-example';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to LetsVet</h1>
        <p className="text-xl text-gray-600 mb-8">
          Your pet health triage companion
        </p>
      </div>

      <div className="w-full max-w-md">
        <AuthExample />
      </div>
    </main>
  );
}
