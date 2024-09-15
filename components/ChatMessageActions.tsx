'use client';

import { cn } from '#/lib/utils';
import { ComponentProps } from 'react';
import { type Message } from '@ai-sdk/react';
import { Button } from '#/components/ui/button';
import { useTextToSpeech } from '#/hooks/useTextToSpeech';
import { useCopyToClipboard } from '#/hooks/useCopyToClipboard';
import { CheckIcon, CopyIcon, StopCircleIcon, Volume2Icon } from 'lucide-react';

interface ChatMessageActionsProps extends ComponentProps<'div'> {
  message: Message;
};

export function ChatMessageActions({ message, className, ...props }: ChatMessageActionsProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });
  const { start, stop, isReading } = useTextToSpeech(message.content);

  const onCopy = () => {
    if (isCopied) return;
    copyToClipboard(message.content);
  };

  return (
    <div
      className={cn(
        'flex gap-x-1 items-center justify-end bg-secondary rounded-t-2xl p-1 transition-opacity group-hover:opacity-100 absolute right-2 -top-8 opacity-0',
        className
      )}
      {...props}
    >
      <Button variant='outline' size='icon' className='rounded-full p-1 w-7 h-7' onClick={isReading ? stop : start}>
        {isReading ? <StopCircleIcon size={14} /> : <Volume2Icon size={14} />}
        <span className='sr-only'>Read message</span>
      </Button>
      <Button variant='outline' size='icon' className='rounded-full p-1 w-7 h-7' onClick={onCopy}>
        {isCopied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
        <span className='sr-only'>Copy message</span>
      </Button>
    </div>
  )
};
