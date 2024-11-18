import { FC } from 'react';
import { generateDefaultAvatar } from '#/lib/utils';
import { Avatar, AvatarImage } from '#/components/ui/avatar';

interface ChatAvatarUserProps {
	username: string;
}

const ChatAvatarUser: FC<ChatAvatarUserProps> = ({ username }) => {
	return (
		<Avatar className='w-6 h-6 bg-black/10 dark:bg-white/10'>
			<AvatarImage src={generateDefaultAvatar(username)} />
		</Avatar>
	)
}

export default ChatAvatarUser;
