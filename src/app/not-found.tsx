import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#F8FAFC] p-6 text-center">
      <div className="flex max-w-2xl flex-col items-center justify-center space-y-8">

        {/* Massive Fancy 404 Text */}
        <h1 className="text-[150px] leading-none font-black tracking-tighter text-[#072E28]/5 select-none">
          404
        </h1>

        <div className="space-y-4 relative -mt-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] font-inter tracking-tight">
            Page not found
          </h2>
          <p className="text-[17px] text-[#64748B] font-medium leading-relaxed max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist, has been moved, or you don&apos;t have permission to view it.
          </p>
        </div>

        <Link
          href="/"
          className="group mt-6 flex items-center justify-center gap-2.5 rounded-full bg-[#072E28] px-8 py-4 text-[16px] font-semibold text-white shadow-lg transition-all hover:bg-[#0a423a] hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1 duration-300" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
