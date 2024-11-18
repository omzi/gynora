'use client';

import { JSX, SVGProps, useRef } from 'react';
import NavBar from '#/components/shared/NavBar';
import { ArrowDownIcon, BarChartIcon, BellIcon, GoalIcon, HeartIcon, SmileIcon } from 'lucide-react';

interface HomeProps {
  isAuthenticated: boolean;
};

const features = [
  {
    name: 'Chat-Based Therapist',
    description: 'Engage in conversations with an AI therapist for support and guidance.',
    icon: SmileIcon
  },
  {
    name: 'Personalized Affirmations',
    description: 'Receive AI-generated affirmations that are tailored to your unique personality and emotional needs.',
    icon: HeartIcon
  },
  {
    name: 'Goal Setting',
    description: 'Set and track personal mental health goals to foster growth and accountability.',
    icon: GoalIcon
  },
  {
    name: 'Progress Dashboard',
    description: 'Visualize your mental health journey with insights from chats, affirmations, and more.',
    icon: BarChartIcon
  }
];

const navigation = [
  {
    name: 'Twitter',
    href: 'https://link.omzi.dev/twitter',
    icon: (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
      <svg fill='currentColor' viewBox='0 0 24 24' {...props}>
        <path d='M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' />
      </svg>
    )
  },
  {
    name: 'GitHub',
    href: 'https://link.omzi.dev/github',
    icon: (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
      <svg fill='currentColor' viewBox='0 0 24 24' {...props}>
        <path fillRule='evenodd' d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z' clipRule='evenodd' />
      </svg>
    )
  }
];

const Home = ({
  isAuthenticated
}: HomeProps) => {
  const howItWorksRef = useRef<HTMLElement>(null);

  const scrollToHowItWorks = () => {
    if (howItWorksRef.current) {
      const yOffset = -100;
      const y = howItWorksRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <>
      <NavBar isAuthenticated={isAuthenticated} isPublicLayout />

      <section className='flex flex-col items-center justify-center relative gap-6 w-full min-h-[80svh] lg:min-h-[75svh] z-[5] dark:bg-core'>
        <h1 className='text-center text-4xl sm:text-6xl lg:text-7xl px-4 text-core dark:text-white mt-8 max-w-prose font-bold'>
          Your personalized mental health companion
        </h1>
        <h2 className='text-center text-xl text-black/90 dark:text-white/90 max-w-sm px-4'>
          Gynora is a mental health companion designed to fit your unique personality and needs.
        </h2>
        <button
          onClick={scrollToHowItWorks}
          className='flex items-center justify-center gap-x-1 p-1.5 rounded-full text-white bg-core dark:bg-white/20 shadow-sm'
        >
          <span className='pl-4'>Learn more</span>
          <ArrowDownIcon className='w-10 h-8 ml-2 py-1.5 px-2 rounded-full bg-white/25 text-white' />
        </button>
      </section>

      <div className='pb-6 text-center text-6xl text-black dark:bg-core'>✦</div>

      <section ref={howItWorksRef} className='bg-muted dark:bg-black'>
        <div className='max-w-screen-xl px-4 py-8 mx-auto sm:py-16 lg:px-6'>
          <div className='flex flex-col items-center justify-between mb-8 lg:flex-row text-center lg:text-start'>
            <h2 className='mb-4 text-4xl sm:text-6xl lg:text-7xl text-core font-bold'>Features</h2>
            <p className='max-w-xl text-gray-500 sm:text-lg dark:text-gray-400'>
              Gynora is your AI-powered mental health companion, offering personalized insights and affirmations tailored to your unique needs.
            </p>
          </div>

          <dl className='space-y-10 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8'>
            {features.map(feature => (
              <div key={feature.name} className='p-8 border border-gray-800 rounded-2xl'>
                <dt>
                  <div className='flex items-center justify-center h-12 w-12 rounded-full bg-core text-white'>
                    <feature.icon className='h-6 w-6' aria-hidden='true' />
                  </div>
                  <p className='mt-6 text-3xl leading-10 font-bold text-black dark:text-white'>{feature.name}</p>
                </dt>
                <dd className='mt-6 text-lg text-gray-500 dark:text-gray-400'>{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <footer className='bg-core'>
        <div className='max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8'>
          <div className='flex justify-center space-x-6 md:order-2'>
            {navigation.map(item => (
              <a key={item.name} href={item.href} target='_blank' className='text-white hover:text-purple-300'>
                <span className='sr-only'>{item.name}</span>
                <item.icon className='h-8 w-8' aria-hidden='true' />
              </a>
            ))}
          </div>
          <div className='mt-8 md:mt-0 md:order-1'>
            <p className='text-center text-lg text-white'>&copy; 2024 Gynora, Inc. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Home;
