import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Verifying your account...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Handle the auth callback from the URL
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error processing auth callback:", error);
          setStatus("Error verifying your account. Redirecting to login...");
          setTimeout(() => {
            router.push("/auth/login?error=Unable to verify your account");
          }, 2000);
          return;
        }

        if (data.session) {
          // User is authenticated
          setStatus(
            "Account verified successfully! Redirecting to dashboard..."
          );
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        } else {
          // No session found, redirect to login
          setStatus("No active session found. Redirecting to login...");
          setTimeout(() => {
            router.push("/auth/login");
          }, 2000);
        }
      } catch (err) {
        console.error("Unexpected error during auth callback:", err);
        setStatus("An unexpected error occurred. Redirecting to login...");
        setTimeout(() => {
          router.push("/auth/login?error=Verification failed");
        }, 2000);
      }
    };

    // Check if we have URL parameters (for email confirmation)
    if (router.isReady) {
      handleCallback();
    }
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white shadow-lg rounded-lg max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Email Verification</h2>
        <p className="text-gray-600 mb-6">{status}</p>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
