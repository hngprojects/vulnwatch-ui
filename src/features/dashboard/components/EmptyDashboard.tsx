import Link from 'next/link';
import { StepIndicator } from './StepIndicator';
import Image from 'next/image';
import { CirclePlus, ArrowRight } from 'lucide-react';

export function EmptyDashboard() {
  return (
    <div className='flex flex-col items-center justify-center min-h-[calc(100vh-260px)] px-4 py-4 text-center'>
      {/* Illustration */}
      <div className='mb-6'>
        <Image
          src='/images/dashboard-empty.png'
          alt='No scans yet'
          width={200}
          height={200}
          className='h-auto w-48'
        />
      </div>

      {/* Heading */}
      <h2 className='text-xl font-bold text-[#111827] mb-2'>No scans yet</h2>
      <p className='text-sm text-[#6B7280] max-w-sm mb-6 leading-relaxed'>
        Get started by verifying your domain and running your first security
        scan
      </p>

      {/* Steps */}
      <div className='w-full mb-6 flex justify-center'>
        <StepIndicator />
      </div>

      {/* CTA */}
      <Link
        data-tour="add-domain"
        href="/domain?add=true"
        className='inline-flex items-center justify-center gap-2 px-8 py-[15px] bg-[#072E28] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity w-full max-w-[320px] md:w-auto md:h-12 md:py-0 whitespace-nowrap'
      >
        <CirclePlus className='h-5 w-5' />
        Add your first domain
        <ArrowRight className='h-5 w-5 md:hidden ml-auto' />
      </Link>
    </div>
  );
}