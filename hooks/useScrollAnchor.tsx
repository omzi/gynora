import { useCallback, useEffect, useRef, useState } from 'react';

export const useScrollAnchor = () => {
  const messagesRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const scrollToBottom = useCallback(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (messagesRef.current) {
      if (isAtBottom && !isVisible) {
        messagesRef.current.scrollIntoView({
          block: 'end',
          behavior: 'smooth'
        });
      }
    }
  }, [isAtBottom, isVisible]);

  useEffect(() => {
    const { current } = messagesRef;

    if (current) {
      const handleScroll = (event: Event) => {
        const target = event.target as HTMLDivElement;
        const offset = 25;
        const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - offset;

        setIsAtBottom(isAtBottom);
      }

      current.addEventListener('scroll', handleScroll, {
        passive: true
      });

      return () => {
        current.removeEventListener('scroll', handleScroll);
      }
    }
  }, []);

  useEffect(() => {
    if (messageEndRef.current) {
      let observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setIsVisible(true)
            } else {
              setIsVisible(false)
            }
          });
        },
        {
          rootMargin: '0px 0px -150px 0px'
        }
      )

      observer.observe(messageEndRef.current);

      return () => {
        observer.disconnect();
      }
    }
  });

  return {
    messagesRef,
    messageEndRef,
    scrollToBottom,
    isAtBottom,
    isVisible
  }
}
