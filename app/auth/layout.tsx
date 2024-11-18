import Image from 'next/image';
import { ReactNode, Suspense } from 'react';
import background from '#/public/images/background.webp';

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense>
      <div className='flex h-svh bg-white dark:bg-black items-center justify-center'>
        {/* Left Pane  */}
        <div className='hidden lg:flex fixed top-0 left-0 w-1/2 h-full'>
          <Image
            src={background}
            alt='Abstract Purple Background'
            width={1920}
            height={1920}
            className='w-full h-full object-cover'
            placeholder='blur'
          />
        </div>

        {/* Right Pane */}
        <div className='w-full lg:w-1/2 fixed top-0 right-0 h-full overflow-y-auto'>
          <Image
            src={background}
            alt='Abstract Purple Background'
            width={1920}
            height={1920}
            className='w-full h-48 md:h-32 object-cover block lg:hidden'
            placeholder='blur'
          />
          {children}
        </div>
      </div>
    </Suspense>
  );
};

export default AuthLayout;
