'use client';

import {
	BadgeDelta,
	BarChart,
	BarList,
	Card,
	Flex,
	Grid,
	Icon,
	Metric,
	Text,
	Title
} from '@tremor/react';
import {
	TimerIcon,
	LightbulbIcon,
	PlusIcon,
	SparklesIcon,
	MessageSquareTextIcon,
	ZapIcon,
	SmileIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '#/components/ui/button';
import { CardContent } from '#/components/ui/card';
import { getDashboardStats } from '#/lib/data/user';
import background from '#/public/images/background.webp';
import { chartColors, formatNumberWithCommas, formatPercentageDelta } from '#/lib/utils';
import { useAffirmationModal } from '#/hooks/useAffirmationModal';
import { useUser, useUserData } from '#/components/contexts/UserContext';

const pieChartData = [
  { name: 'Positive', count: 8 },
  { name: 'Neutral', count: 3 },
  { name: 'Negative', count: 1 }
];

interface DashboardProps {
	randomTip: string;
	data: Awaited<ReturnType<typeof getDashboardStats>>;
};

const Dashboard = ({ randomTip, data }: DashboardProps) => {
	const user = useUser();
	const userData = useUserData();
	const [firstName] = `${user.name}`.split(' ');
	const affirmationModal = useAffirmationModal();
	
	return (
		<div className='max-w-[1560px] mx-auto p-4 flex flex-col gap-y-4'>
			<div className='flex flex-col sm:grid-cols-2 lg:grid lg:grid-cols-3 gap-4'>
				<div className='rounded-lg overflow-hidden border bg-card text-card-foreground shadow-sm w-full'>
					<Image
						src={background}
						alt='Abstract Purple Background'
						width={1920}
						height={1920}
						className='w-full h-16 object-cover'
						placeholder='blur'
					/>
					
					<CardContent className='pt-6 space-y-4'>
						<h2 className='text-2xl font-bold text-gray-900 dark:text-gray-50'>👋 Hi there, {firstName}!</h2>
						<p className='text-muted-foreground mb-2 leading-1.5'>Ready to take control of your mental well-being? Explore quick actions below.</p>

						<div className='flex flex-col gap-3 sm:flex-row lg:flex-col sm:gap-5 lg:gap-3'>
							<Link href='/chat' className='w-fit'>
								<Button className='mt-0 h-auto w-fit py-1 px-3 bg-core hover:bg-core-secondary text-white'>
									<SparklesIcon className='h-4 w-4 mr-2' />
									Chat With Gynora
								</Button>
							</Link>
							<Button onClick={affirmationModal.onOpen} variant='secondary' className='mt-0 h-auto w-fit py-1 px-3 bg-core hover:bg-core-secondary text-white'>
								<PlusIcon className='h-4 w-4 mr-2' />
								Create Affirmation
							</Button>
						</div>
					</CardContent>
				</div>

				<Grid numItemsSm={1} numItemsMd={2} className='md:col-span-2 gap-4'>
					{/* Total Chat Sessions Card */}
					<Card className='p-4 ring-0 bg-primary/5 dark:bg-primary/5 flex flex-col justify-between' decoration='top' decorationColor='blue' key='Total Chat Sessions'>
						<Flex alignItems='center' justifyContent='start' className='gap-2'>
							<Icon icon={MessageSquareTextIcon} className='rounded-full' color='blue' variant='light' size='xs' />
							<Text>Total Chat Sessions</Text>
						</Flex>
						<Metric className='truncate mt-2'>{formatNumberWithCommas(data.stats.totalChats)}</Metric>
						<div className='flex justify-start items-center space-x-2 mt-2'>
							<BadgeDelta deltaType={formatPercentageDelta(`${data.stats.chatSessionChange}`).deltaType} />
							<div className='flex justify-start space-x-1 truncate'>
								<Text color={chartColors[formatPercentageDelta(`${data.stats.chatSessionChange}`).deltaType] as any}>
									{formatPercentageDelta(`${data.stats.chatSessionChange}`).absoluteValue}%
								</Text>
								<Text>from previous month</Text>
							</div>
						</div>
					</Card>
					{/* Average Session Duration Card */}
					<Card className='p-4 ring-0 bg-primary/5 dark:bg-primary/5 flex flex-col justify-between' decoration='top' decorationColor='green' key='Average Session Duration'>
						<Flex alignItems='center' justifyContent='start' className='gap-2'>
							<Icon icon={TimerIcon} className='rounded-full' color='green' variant='light' size='xs' />
							<Text>Average Session Duration</Text>
						</Flex>
						<Metric className='truncate mt-2'>{data.stats.averageSessionDuration.toFixed(2)} <span className='text-sm text-muted-foreground font-normal'>min</span></Metric>
						<div className='flex justify-start items-center space-x-2 mt-2'>
							<BadgeDelta deltaType={formatPercentageDelta(`${data.stats.averageSessionDurationChange}`).deltaType} />
							<div className='flex justify-start space-x-1 truncate'>
								<Text color={chartColors[formatPercentageDelta(`${data.stats.averageSessionDurationChange}`).deltaType] as any}>
									{formatPercentageDelta(`${data.stats.averageSessionDurationChange}`).absoluteValue}%
								</Text>
								<Text>from previous month</Text>
							</div>
						</div>
					</Card>
					{/* User Satisfaction Card */}
					<Card className='p-4 ring-0 bg-primary/5 dark:bg-primary/5 flex flex-col justify-between' decoration='top' decorationColor='fuchsia' key='User Satisfaction'>
						<Flex alignItems='center' justifyContent='start' className='gap-2'>
							<Icon icon={SmileIcon} className='rounded-full' color='fuchsia' variant='light' size='xs' />
							<Text>User Satisfaction</Text>
						</Flex>
						<Metric className='truncate mt-2'>
							{data.stats.userSatisfaction}% <span className='text-sm text-muted-foreground font-normal'>positive</span>
						</Metric>
						<div className='flex justify-start items-center space-x-2 mt-2'>
							<BadgeDelta deltaType={formatPercentageDelta(`${data.stats.satisfactionChange}`).deltaType} />
							<div className='flex justify-start space-x-1 truncate'>
								<Text color={chartColors[formatPercentageDelta(`${data.stats.satisfactionChange}`).deltaType] as any}>
									{formatPercentageDelta(`${data.stats.satisfactionChange}`).absoluteValue}%
								</Text>
								<Text>from previous month</Text>
							</div>
						</div>
					</Card>
					{/* Total Affirmations Generated Card */}
					<Card className='p-4 ring-0 bg-primary/5 dark:bg-primary/5 flex flex-col justify-between' decoration='top' decorationColor='yellow' key='Total Affirmations Generated'>
						<Flex alignItems='center' justifyContent='start' className='gap-2'>
							<Icon icon={ZapIcon} className='rounded-full' color='yellow' variant='light' size='xs' />
							<Text>Total Affirmations Generated</Text>
						</Flex>
						<Metric className='truncate mt-2'>{formatNumberWithCommas(data.stats.totalAffirmations)}</Metric>
						<div className='flex justify-start items-center space-x-2 mt-2'>
							<BadgeDelta deltaType={formatPercentageDelta(`${data.stats.affirmationChange}`).deltaType} />
							<div className='flex justify-start space-x-1 truncate'>
								<Text color={chartColors[formatPercentageDelta(`${data.stats.affirmationChange}`).deltaType] as any}>
									{formatPercentageDelta(`${data.stats.affirmationChange}`).absoluteValue}%
								</Text>
								<Text>from previous month</Text>
							</div>
						</div>
					</Card>
				</Grid>
			</div>
			
			<div className='bg-core border-l-4 border-primary/20 p-2.5 rounded-lg'>
				<div className='flex'>
					<div className='flex-shrink-0'>
						<LightbulbIcon className='h-4 w-4 text-white' aria-hidden='true' />
					</div>
					<span className='ml-1 text-sm font-bold text-white'>
						Mental Health Tip
					</span>
				</div>
				<p className='mt-1 text-sm text-white'>
					{randomTip}
				</p>
			</div>

			<div className='flex flex-col md:grid md:grid-cols-2 gap-4'>
				<Card className='p-4 ring-0 bg-primary/5 dark:bg-primary/5 flex flex-col justify-between'>
					<Title className='mb-4'>Chat Sessions This Week</Title>
					<BarList
						className='h-64'
						data={data.charts.chatSessionsThisWeek}
						sortOrder='none'
						showAnimation
						color={['core']}
					/>
				</Card>
				{/* <Card className='p-4 ring-0 bg-primary/5 dark:bg-primary/5 flex flex-col justify-between'>
					<Title className='mb-4'>User Satisfaction</Title>
					<ProgressCircle className='h-64' color='green' size='xl' value={85} radius={100}>
						<span className='text-4xl font-bold text-gray-900 dark:text-gray-50'>85%</span>
					</ProgressCircle>
				</Card> */}
				<Card className='p-4 ring-0 bg-primary/5 dark:bg-primary/5 flex flex-col justify-between'>
					<Title className='mb-4'>Affirmations This Week</Title>
					<BarChart
						className='h-64'
						data={data.charts.affirmationsThisWeek}
						index='date'
						categories={['value']}
						colors={['fuchsia']}
						yAxisWidth={40}
						showLegend={false}
					/>
				</Card>
			</div>
		</div>
	);
}

export default Dashboard;
