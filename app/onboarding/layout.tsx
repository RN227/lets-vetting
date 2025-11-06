'use client';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#073F6C] fixed inset-0 overflow-hidden">
      {children}
    </div>
  );
}

