// import { Message } from 'ai';
import { cn } from '#/lib/utils';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { type Message } from '@ai-sdk/react';
import { CodeBlock } from '#/components/ui/codeblock';
import ChatAvatarBot from '#/components/ChatAvatarBot';
import ChatAvatarUser from '#/components/ChatAvatarUser';
import { MemoizedReactMarkdown } from '#/components/Markdown';
import { Children, ReactElement, isValidElement } from 'react';
import { ChatMessageActions } from '#/components/ChatMessageActions';

export interface ChatMessageProps {
  message: Message;
  username: string;
};

export const ChatMessage = ({ message, username, ...props }: ChatMessageProps) => {
  console.log('Message Content :>>', message);
  return (
    <div className={cn('flex flex-row gap-x-2 mb-2 sm:gap-x-4 py-4 px-2 sm:px-4 group',
      message.role !== 'user' && 'rounded-xl bg-secondary'
    )}>
      {message.role === 'user' ? <ChatAvatarUser username={username} /> : <ChatAvatarBot />}
      
      <div className='flex-1 flex items-center relative'>
        {message.role !== 'user' && <ChatMessageActions message={message} />}

        <MemoizedReactMarkdown
          className='prose break-words prose-p:leading-relaxed prose-pre:p-0'
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            p({ children }) {
              return <p className='mb-2 last:mb-0'>{children}</p>
            },
            img({ node, ...props }) {
              // eslint-disable-next-line @next/next/no-img-element
              return <img className='max-w-[65%]' alt='...' {...props} />
            },
            code({ node, className, children, ...props }) {
              const childArray = Children.toArray(children);
              const [firstChild] = childArray as ReactElement[];
              const firstChildAsString = isValidElement(firstChild)
                ? (firstChild as ReactElement).props.children
                : firstChild;

              if (firstChildAsString === '▍') {
                return <span className='mt-1 animate-pulse cursor-default'>▍</span>;
              }

              if (typeof firstChildAsString === 'string') {
                childArray[0] = firstChildAsString.replace('`▍`', '▍');
              }

              const match = /language-(\w+)/.exec(className || '');

              if (typeof firstChildAsString === 'string' && !firstChildAsString.includes('\n')) {
                return (
                  <code className={className} {...props}>
                    {childArray}
                  </code>
                )
              }

              return (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ''}
                  value={String(childArray).replace(/\n$/, '')}
                  {...props}
                />
              )
            }
          }}
        >
          {message.content}
        </MemoizedReactMarkdown>
      </div>
    </div>
  )
};
