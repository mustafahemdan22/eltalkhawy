import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-20 bg-[var(--bg-base)]">
      <SignUp />
    </div>
  );
}
