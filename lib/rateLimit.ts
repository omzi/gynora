import { NextRequest, NextResponse } from 'next/server';

const TIME_WINDOW = 30 * 1000; // 30 seconds
const REQUEST_LIMIT = 5; // 5 requests per 30 seconds

// Map to store request counts
let requestCounter = new Map<string, number>();
let resetTimer: NodeJS.Timeout;

const resetCounters = (): void => {
  requestCounter.clear();
  clearTimeout(resetTimer);
  resetTimer = setTimeout(resetCounters, TIME_WINDOW);
};

// Start the timer initially
resetCounters();

const rateLimit = async (req: NextRequest, res: NextResponse): Promise<boolean | null> => {
  const ipHeader = req.headers.get('x-forwarded-for');
  const [ip] = ipHeader?.match(/[^,]+/) ?? ['127.0.0.1'];
  
  const requestCount = requestCounter.get(ip) || 0;

  if (requestCount >= REQUEST_LIMIT) {
    return true; // Rate limit exceeded 🚫
  } else {
    requestCounter.set(ip, requestCount + 1);
    console.log('Request count for IP:', ip, '=', requestCount + 1);
    return null; // Proceed with the request ✅
  }
};

export default rateLimit;
