import { Avatar, AvatarImage } from '#/components/ui/avatar';

const ChatAvatarBot = () => {
	return (
		<Avatar className='w-6 h-6'>
			<AvatarImage src={'/images/logo.png'} />
		</Avatar>
	)
}

export default ChatAvatarBot;
