# .cursorrules - TypeScript/JavaScript Development Guidelines

## ROLE: I am developing a modern web application with strict quality standards

# The rules from .cursorrules.md apply as default
# Additional rules for TypeScript/JavaScript/React/Next.js development:

# SECTION 1: TYPE SAFETY (STRICT)

################################################################################

## TypeScript Configuration
- **MUST** use TypeScript strict mode (`"strict": true` in tsconfig.json)
- **MUST** never use `any` type without explicit justification
- **MUST** type all function parameters and return values
- **MUST** use interfaces for object types
- **MUST** use `type` for unions and intersections

## Type Definitions
```typescript
// BAD: No types
function processVideo(video) {
  return video.duration;
}

// GOOD: Explicit types
interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
}

function processVideo(video: VideoMetadata): number {
  return video.duration;
}
```

## Null/Undefined Handling
```typescript
// BAD: Ignoring potential undefined
const user = users[0];
console.log(user.name);

// GOOD: Proper null checking
const user = users[0];
if (user) {
  console.log(user.name);
}

// OR use optional chaining
const userName = users[0]?.name;
```

################################################################################

# SECTION 2: REACT/COMPONENT DEVELOPMENT

################################################################################

## Component Structure
```typescript
// Component file organization
// 1. Imports (external, internal, types, styles)
// 2. Type definitions
// 3. Component implementation
// 4. Exports

import React from 'react';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import type { VideoMetadata } from '@/types/video';

interface VideoPlayerProps {
  videoUrl: string;
  onPlay?: () => void;
  onPause?: () => void;
  autoplay?: boolean;
}

export const VideoPlayerContainer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  onPlay,
  onPause,
  autoplay = false,
}) => {
  // Component logic
  return <VideoPlayer src={videoUrl} />;
};
```

## Hooks Usage
```typescript
// BAD: Hooks in conditions
if (condition) {
  const [state, setState] = useState(0);
}

// GOOD: Hooks at top level
const [state, setState] = useState(0);
if (condition) {
  // Use state here
}

// ALWAYS provide dependencies array
useEffect(() => {
  // Effect logic
}, [dependency]); // Required!
```

## State Management
```typescript
// PREFER useState for local state
const [isPlaying, setIsPlaying] = useState(false);

// PREFER useReducer for complex state
type State = { count: number; error: string | null };
type Action = { type: 'increment' } | { type: 'decrement' } | { type: 'error'; error: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1 };
    case 'decrement':
      return { ...state, count: state.count - 1 };
    case 'error':
      return { ...state, error: action.error };
    default:
      return state;
  }
};
```

################################################################################

# SECTION 3: ASYNC/AWAIT PATTERNS

################################################################################

## Error Handling
```typescript
// BAD: Unhandled promises
fetch('/api/videos')
  .then(res => res.json());

// GOOD: Proper error handling
async function fetchVideos(): Promise<Video[]> {
  try {
    const response = await fetch('/api/videos');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch videos:', error);
    throw error; // Re-throw or handle appropriately
  }
}
```

## Promise Patterns
```typescript
// ALWAYS handle promise rejections
Promise.all([promise1, promise2])
  .then(([result1, result2]) => {
    // Success
  })
  .catch((error) => {
    // Handle error
    console.error('Promise.all failed:', error);
  });

// OR use async/await with try/catch
try {
  const [result1, result2] = await Promise.all([promise1, promise2]);
} catch (error) {
  console.error('Promise.all failed:', error);
}
```

################################################################################

# SECTION 4: NEXT.JS SPECIFIC

################################################################################

## App Router Structure
- **MUST** use App Router (not Pages Router)
- **MUST** use `async` server components when fetching data
- **MUST** use client components with `'use client'` directive
- **MUST** place components in `components/` directory

## Server vs Client Components
```typescript
// Server Component (default in app/)
async function VideoList() {
  const videos = await fetchVideos();
  return (
    <div>
      {videos.map(video => <VideoCard key={video.id} {...video} />)}
    </div>
  );
}

// Client Component (when using hooks or browser APIs)
'use client';

import { useState, useEffect } from 'react';

export function VideoPlayer({ src }: { src: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Browser API usage
    const video = document.querySelector('video');
    // ...
  }, []);

  return <video src={src} />;
}
```

## API Routes
```typescript
// app/api/videos/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const videos = await getVideos();
    return NextResponse.json({ videos });
  } catch (error) {
    console.error('GET /api/videos failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const video = await createVideo(body);
    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    console.error('POST /api/videos failed:', error);
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    );
  }
}
```

################################################################################

# SECTION 5: IMPORTS AND ORGANIZATION

################################################################################

## Import Order
1. React and Next.js
2. Third-party libraries
3. Internal components
4. Utilities and helpers
5. Types
6. Styles

```typescript
// 1. React/Next.js
import React from 'react';
import { NextApiRequest, NextApiResponse } from 'next';
import Image from 'next/image';

// 2. Third-party
import { fabric } from 'fabric';
import * as THREE from 'three';
import axios from 'axios';

// 3. Internal components
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { Button } from '@/components/ui/button';

// 4. Utilities
import { formatDuration } from '@/lib/utils';

// 5. Types
import type { VideoMetadata } from '@/types/video';

// 6. Styles
import './styles.css';
```

## Absolute Imports
- **USE** `@/` prefix for internal imports
- **USE** relative imports only for same-directory files

```typescript
// GOOD: Absolute imports
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { formatDate } from '@/lib/utils/dates';
import type { User } from '@/types/user';

// GOOD: Relative imports (same directory)
import { VideoCard } from './VideoCard';
import styles from './VideoList.module.css';
```

################################################################################

# SECTION 6: CODE QUALITY

################################################################################

## Naming Conventions
```typescript
// Components: PascalCase
export const VideoPlayer = () => {};

// Functions/Variables: camelCase
function fetchVideoData() {}
const userName = 'John';

// Constants: UPPER_SNAKE_CASE
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const DEFAULT_FPS = 30;

// Types/Interfaces: PascalCase
interface VideoMetadata {}
type UserRole = 'admin' | 'user';

// Files: kebab-case for pages, PascalCase for components
// video-upload.tsx (page)
// VideoPlayer.tsx (component)
```

## Functions
- **MUST** be pure when possible (no side effects)
- **MUST** have single responsibility
- **MUST** be under 50 lines
- **SHOULD** have descriptive names

```typescript
// BAD: Too long, multiple responsibilities
async function processVideo(videoFile: File) {
  // Upload, process, analyze, notify, etc.
}

// GOOD: Single responsibility
async function uploadVideo(videoFile: File): Promise<string> {
  const formData = new FormData();
  formData.append('video', videoFile);

  const response = await fetch('/api/videos/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  return data.videoUrl;
}
```

################################################################################

# SECTION 7: TESTING REQUIREMENTS

################################################################################

## Unit Tests
```typescript
// components/__tests__/VideoPlayer.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoPlayer } from '../VideoPlayer';

describe('VideoPlayer', () => {
  it('renders video element', () => {
    render(<VideoPlayer src="/test-video.mp4" />);
    expect(screen.getByRole('application')).toBeInTheDocument();
  });

  it('handles play event', () => {
    const onPlay = jest.fn();
    render(<VideoPlayer src="/test-video.mp4" onPlay={onPlay} />);

    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);

    expect(onPlay).toHaveBeenCalledTimes(1);
  });
});
```

## Test Requirements
- **MUST** test user interactions
- **MUST** test error cases
- **SHOULD** test edge cases
- **MUST** have >80% code coverage

################################################################################

# SECTION 8: SECURITY

################################################################################

## Input Validation
```typescript
// ALWAYS validate user input
function uploadVideo(file: File): void {
  const MAX_SIZE = 100 * 1024 * 1024; // 100MB
  const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  if (file.size > MAX_SIZE) {
    throw new Error('File too large');
  }
}
```

## Sensitive Data
- **NEVER** commit API keys, secrets, or credentials
- **NEVER** expose sensitive data to client
- **ALWAYS** use environment variables

```typescript
// BAD: Hardcoded API key
const API_KEY = 'sk-1234567890abcdef';

// GOOD: Environment variable
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
if (!API_KEY) {
  throw new Error('API_KEY not configured');
}
```

################################################################################

# SECTION 9: PERFORMANCE

################################################################################

## Code Splitting
```typescript
// ALWAYS lazy load heavy components
import dynamic from 'next/dynamic';

const VideoEditor = dynamic(() => import('@/components/editor/VideoEditor'), {
  loading: () => <div>Loading editor...</div>,
  ssr: false, // If component doesn't need SSR
});
```

## Image Optimization
```typescript
// ALWAYS use Next.js Image component
import Image from 'next/image';

<Image
  src="/thumbnail.jpg"
  alt="Video thumbnail"
  width={640}
  height={360}
  priority // For above-the-fold images
/>
```

################################################################################

# SECTION 10: DOCUMENTATION

################################################################################

## Component Documentation
```typescript
/**
 * VideoPlayer - Displays and controls video playback
 *
 * @component
 * @param {object} props - Component props
 * @param {string} props.src - Video source URL
 * @param {function} [props.onPlay] - Callback when video plays
 * @param {boolean} [props.autoplay=false] - Auto-play video
 * @returns {JSX.Element} Video player element
 *
 * @example
 * <VideoPlayer
 *   src="/video.mp4"
 *   onPlay={() => console.log('Playing')}
 *   autoplay
 * />
 */
export const VideoPlayer = ({ src, onPlay, autoplay }: VideoPlayerProps) => {
  // Implementation
};
```

## Function Documentation
```typescript
/**
 * Fetches video metadata from API
 *
 * @async
 * @param {string} videoId - Unique video identifier
 * @returns {Promise<VideoMetadata>} Video metadata object
 * @throws {Error} If video not found or network error
 *
 * @example
 * const video = await fetchVideoMetadata('abc123');
 * console.log(video.duration);
 */
async function fetchVideoMetadata(videoId: string): Promise<VideoMetadata> {
  // Implementation
}
```

################################################################################

# SECTION 11: BUNDLE SIZE & PERFORMANCE

################################################################################

## Tree Shaking
- **USE** named imports when possible
- **AVOID** importing entire libraries

```typescript
// BAD: Import entire library
import _ from 'lodash';

// GOOD: Import specific functions
import { debounce } from 'lodash-es';
```

## Environment-Specific Code
```typescript
// Server-only code
if (process.env.NODE_ENV === 'production') {
  // Production-specific code
}

// Client-only code
if (typeof window !== 'undefined') {
  // Browser API usage
}
```

################################################################################

# END WEB DEVELOPMENT RULES
