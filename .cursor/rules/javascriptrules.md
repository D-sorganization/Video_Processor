# JavaScript/TypeScript Development Rules

## ROLE: I am developing JavaScript/TypeScript code with strict quality standards

# The rules from .cursorrules.md apply as default
# Additional rules for JavaScript/TypeScript/Node.js/React/Next.js development:

################################################################################

# SECTION 1: TYPE SAFETY (STRICT)

################################################################################

## TypeScript Configuration
- **MUST** use TypeScript strict mode (`"strict": true` in tsconfig.json)
- **MUST** never use `any` type without explicit justification and comment
- **MUST** type all function parameters and return values
- **MUST** use interfaces for object types
- **MUST** use `type` for unions and intersections
- **MUST** enable `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`

```typescript
// BAD: No types
function processVideo(video) {
  return video.duration;
}

// GOOD: Explicit types with documentation
interface VideoMetadata {
  duration: number;  // [seconds] Video duration in seconds
  width: number;     // [pixels] Video width
  height: number;    // [pixels] Video height
  fps: number;       // [frames/second] Video frame rate per SMPTE ST 12-1:2014
}

function processVideo(video: VideoMetadata): number {
  if (video.duration <= 0) {
    throw new Error(`Duration must be positive, got ${video.duration} seconds`);
  }
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
if (!user) {
  throw new Error('User not found');
}
console.log(user.name);

// OR use optional chaining with fallback
const userName = users[0]?.name ?? 'Unknown';
```

## Type Guards
```typescript
// MUST use type guards for runtime type checking
function isVideoFile(file: unknown): file is File {
  return file instanceof File && file.type.startsWith('video/');
}

function uploadVideo(file: unknown): void {
  if (!isVideoFile(file)) {
    throw new TypeError('Expected a video file');
  }
  // TypeScript now knows file is File
  processVideo(file);
}
```

################################################################################

# SECTION 2: CONSTANTS AND MAGIC NUMBERS

################################################################################

## Constants MUST Be Explicit with Sources

```typescript
// BAD: Magic numbers
const maxSize = 50000000;  // What is this?
const fps = 30;  // Why 30?

// GOOD: Named constants with units and sources
const MAX_VIDEO_SIZE_BYTES: number = 500 * 1024 * 1024;  // [bytes] 500MB limit per RFC 7231 HTTP specification
const DEFAULT_FPS: number = 30;  // [frames/second] Standard video frame rate per SMPTE ST 12-1:2014

// For scientific computing values
const GRAVITY_M_S2: number = 9.80665;  // [m/s²] Standard gravity per ISO 80000-3:2006
const AIR_DENSITY_KG_M3: number = 1.225;  // [kg/m³] At sea level, 15°C, per ISA (International Standard Atmosphere)
```

## Enum Usage
```typescript
// PREFER const enums for better type safety
enum VideoFormat {
  MP4 = 'video/mp4',
  WEBM = 'video/webm',
  OGG = 'video/ogg',
}

// OR use const objects for better tree-shaking
const VideoFormat = {
  MP4: 'video/mp4' as const,
  WEBM: 'video/webm' as const,
  OGG: 'video/ogg' as const,
} as const;

type VideoFormat = typeof VideoFormat[keyof typeof VideoFormat];
```

################################################################################

# SECTION 3: REPRODUCIBILITY (CRITICAL FOR VIDEO ANALYSIS)

################################################################################

## Random Number Generation
```typescript
// MUST set seed for deterministic behavior
class SeededRandom {
  private seed: number;

  constructor(seed: number = 42) {  // [unitless] Reproducibility seed
    this.seed = seed;
  }

  // Linear Congruential Generator (LCG)
  // Source: Numerical Recipes in C, Press et al., 1992
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 2 ** 32;
    return this.seed / 2 ** 32;
  }

  reset(seed: number): void {
    this.seed = seed;
  }
}

// Usage
const rng = new SeededRandom(42);  // Fixed seed for reproducibility
const randomValue = rng.next();
```

## Date/Time Handling
```typescript
// MUST use ISO 8601 format for timestamps
const timestamp: string = new Date().toISOString();  // Format: YYYY-MM-DDTHH:mm:ss.sssZ

// For video timestamps, use high-resolution time
const startTime: number = performance.now();  // [milliseconds] High-resolution timestamp
```

################################################################################

# SECTION 4: ERROR HANDLING

################################################################################

## Async Error Handling
```typescript
// BAD: Unhandled promises
async function fetchVideo() {
  const response = await fetch('/api/video');
  return response.json();
}

// GOOD: Proper error handling with validation
interface FetchVideoOptions {
  videoId: string;
  timeout?: number;  // [milliseconds] Request timeout, default 5000ms
}

async function fetchVideo(options: FetchVideoOptions): Promise<VideoMetadata> {
  if (!options.videoId || typeof options.videoId !== 'string') {
    throw new TypeError(`videoId must be a non-empty string, got: ${typeof options.videoId}`);
  }

  const timeout = options.timeout ?? 5000;  // [milliseconds] Default timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`/api/videos/${options.videoId}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Validate response structure
    if (!data.duration || typeof data.duration !== 'number' || data.duration <= 0) {
      throw new Error(`Invalid duration in response: ${data.duration}`);
    }

    return data as VideoMetadata;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      console.error(`Failed to fetch video ${options.videoId}:`, error.message);
      throw error;
    }
    throw new Error('Unknown error occurred while fetching video');
  }
}
```

## Input Validation
```typescript
// MUST validate all inputs with clear error messages
function processVideoFrame(
  frameNumber: number,  // [frames] Frame index, must be >= 0
  fps: number,          // [frames/second] Frame rate, must be > 0
  totalFrames: number   // [frames] Total frames, must be > 0
): number {
  // Input validation with units
  if (frameNumber < 0 || !Number.isInteger(frameNumber)) {
    throw new RangeError(`frameNumber must be non-negative integer, got: ${frameNumber} frames`);
  }

  if (fps <= 0 || !Number.isFinite(fps)) {
    throw new RangeError(`fps must be positive finite number, got: ${fps} frames/second`);
  }

  if (totalFrames <= 0 || !Number.isInteger(totalFrames)) {
    throw new RangeError(`totalFrames must be positive integer, got: ${totalFrames} frames`);
  }

  if (frameNumber >= totalFrames) {
    throw new RangeError(`frameNumber (${frameNumber}) must be < totalFrames (${totalFrames})`);
  }

  // Calculate time in seconds
  const timeSeconds: number = frameNumber / fps;  // [seconds] Time = frame / frame_rate
  return timeSeconds;
}
```

################################################################################

# SECTION 5: REACT/COMPONENT DEVELOPMENT

################################################################################

## Component Structure Requirements
```typescript
// 1. Imports (external, internal, types, styles) - ALWAYS in this order
// 2. Type definitions
// 3. Constants
// 4. Component implementation
// 5. Helper functions
// 6. Exports

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fabric } from 'fabric';

import { VideoPlayer } from '@/components/video/VideoPlayer';
import { formatDuration } from '@/lib/utils/time';

import type { VideoMetadata } from '@/types/video';

// Constants
const MAX_VIDEO_SIZE_BYTES: number = 500 * 1024 * 1024;  // [bytes] 500MB limit
const DEFAULT_FPS: number = 30;  // [frames/second] Standard video frame rate

interface VideoPlayerContainerProps {
  videoUrl: string;
  onPlay?: () => void;
  onPause?: () => void;
  autoplay?: boolean;
  fps?: number;  // [frames/second] Frame rate, default 30
}

export const VideoPlayerContainer: React.FC<VideoPlayerContainerProps> = ({
  videoUrl,
  onPlay,
  onPause,
  autoplay = false,
  fps = DEFAULT_FPS,
}) => {
  // Component logic with proper typing
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    onPlay?.();
  }, [onPlay]);

  return <VideoPlayer ref={videoRef} src={videoUrl} onPlay={handlePlay} />;
};
```

## Hooks Usage Rules
```typescript
// MUST provide all dependencies in dependency arrays
// MUST NOT conditionally call hooks
// MUST use useCallback/useMemo for expensive operations

// BAD: Missing dependencies
useEffect(() => {
  fetchVideo(videoId);
}, []);  // Missing videoId dependency!

// GOOD: All dependencies included
useEffect(() => {
  if (!videoId) return;
  fetchVideo(videoId).catch((error) => {
    console.error('Failed to fetch video:', error);
  });
}, [videoId]);  // All dependencies listed

// BAD: Hooks in conditions
if (condition) {
  const [state, setState] = useState(0);  // ERROR!
}

// GOOD: Hooks at top level
const [state, setState] = useState<number>(0);
if (condition) {
  // Use state here
}
```

################################################################################

# SECTION 6: ASYNC/AWAIT PATTERNS

################################################################################

## Promise Patterns
```typescript
// MUST handle all promise rejections
// MUST use proper error types

async function processVideoFrames(
  frames: ArrayBuffer[],
  callback?: (progress: number) => void  // [unitless] Progress 0-1
): Promise<ProcessedFrame[]> {
  const results: ProcessedFrame[] = [];
  const totalFrames: number = frames.length;

  for (let i = 0; i < totalFrames; i++) {
    try {
      const processed = await processFrame(frames[i]);
      results.push(processed);

      // Report progress
      if (callback) {
        const progress: number = (i + 1) / totalFrames;  // [unitless] Progress 0-1
        callback(progress);
      }
    } catch (error) {
      console.error(`Failed to process frame ${i}:`, error);
      throw new Error(`Frame processing failed at index ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return results;
}
```

################################################################################

# SECTION 7: FILE ORGANIZATION

################################################################################

## Folder Structure
```
javascript/
├── src/
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helper functions
├── tests/
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── fixtures/          # Test data
└── utils/                 # Shared utilities
```

## File Naming
- Components: `PascalCase.tsx` (e.g., `VideoPlayer.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDuration.ts`)
- Types: `camelCase.ts` (e.g., `videoTypes.ts`)
- Tests: `*.test.ts` or `*.test.tsx` (e.g., `VideoPlayer.test.tsx`)

################################################################################

# SECTION 8: TESTING REQUIREMENTS

################################################################################

## Test Structure
```typescript
// tests/unit/utils/formatDuration.test.ts
import { describe, it, expect } from '@jest/globals';
import { formatDuration } from '@/lib/utils/time';

describe('formatDuration', () => {
  it('formats duration in seconds correctly', () => {
    const duration: number = 125.5;  // [seconds]
    const formatted = formatDuration(duration);
    expect(formatted).toBe('2:05.5');
  });

  it('handles zero duration', () => {
    const duration: number = 0;  // [seconds]
    const formatted = formatDuration(duration);
    expect(formatted).toBe('0:00.0');
  });

  it('throws error for negative duration', () => {
    const duration: number = -10;  // [seconds] Invalid
    expect(() => formatDuration(duration)).toThrow('Duration must be non-negative');
  });

  it('handles large durations', () => {
    const duration: number = 3600;  // [seconds] 1 hour
    const formatted = formatDuration(duration);
    expect(formatted).toBe('60:00.0');
  });
});
```

## Test Requirements
- **MUST** test happy path
- **MUST** test error cases
- **MUST** test edge cases (zero, negative, max values)
- **MUST** have >80% code coverage
- **MUST** include negative tests for validation

################################################################################

# SECTION 9: DOCUMENTATION

################################################################################

## Function Documentation
```typescript
/**
 * Calculates video frame number from time and frame rate
 *
 * @param timeSeconds - Video time in seconds, must be >= 0
 * @param fps - Frame rate in frames per second, must be > 0
 * @returns Frame number (integer), 0-indexed
 * @throws {RangeError} If timeSeconds < 0 or fps <= 0
 *
 * @example
 * const frame = calculateFrameNumber(1.5, 30);  // Returns 45
 */
function calculateFrameNumber(timeSeconds: number, fps: number): number {
  if (timeSeconds < 0) {
    throw new RangeError(`timeSeconds must be >= 0, got: ${timeSeconds}`);
  }
  if (fps <= 0 || !Number.isFinite(fps)) {
    throw new RangeError(`fps must be positive finite number, got: ${fps}`);
  }
  return Math.floor(timeSeconds * fps);
}
```

## Component Documentation
```typescript
/**
 * VideoPlayer - Displays and controls video playback
 *
 * @component
 * @param {VideoPlayerProps} props - Component props
 * @param {string} props.src - Video source URL (required)
 * @param {function} [props.onPlay] - Callback when video starts playing
 * @param {function} [props.onPause] - Callback when video pauses
 * @param {boolean} [props.autoplay=false] - Auto-play video on load
 * @param {number} [props.fps=30] - Video frame rate in frames/second
 *
 * @example
 * <VideoPlayer
 *   src="/video.mp4"
 *   fps={30}
 *   onPlay={() => console.log('Playing')}
 *   autoplay
 * />
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, ... }) => {
  // Implementation
};
```

################################################################################

# SECTION 10: NO PLACEHOLDERS RULE

################################################################################

## NEVER Use Placeholders
```typescript
// BAD: Placeholders
function processVideo() {
  // TODO: Implement this
  return null;
}

function analyzeFrame() {
  throw new Error('Not implemented yet');
}

// GOOD: Complete implementation
function processVideo(videoFile: File): Promise<VideoMetadata> {
  // Full implementation with error handling
  return new Promise((resolve, reject) => {
    // Implementation...
  });
}
```

## NEVER Use Magic Numbers
```typescript
// BAD: Magic numbers
if (file.size > 50000000) {  // What is 50000000?
  throw new Error('File too large');
}

// GOOD: Named constants
const MAX_VIDEO_SIZE_BYTES: number = 500 * 1024 * 1024;  // [bytes] 500MB limit per RFC 7231
if (file.size > MAX_VIDEO_SIZE_BYTES) {
  throw new Error(`File size (${file.size} bytes) exceeds maximum (${MAX_VIDEO_SIZE_BYTES} bytes)`);
}
```

################################################################################

# SECTION 11: PERFORMANCE CONSIDERATIONS

################################################################################

## Memory Management
```typescript
// MUST clean up resources
useEffect(() => {
  const videoElement = document.createElement('video');
  videoElement.src = videoUrl;

  // Cleanup
  return () => {
    videoElement.pause();
    videoElement.src = '';
    videoElement.load();  // Release memory
  };
}, [videoUrl]);
```

## Debouncing/Throttling
```typescript
// Use debouncing for frequent events
import { debounce } from 'lodash-es';

const DEBOUNCE_DELAY_MS: number = 300;  // [milliseconds] Delay for debounce

const handleSeek = debounce((time: number) => {
  // Handle seek
}, DEBOUNCE_DELAY_MS);
```

################################################################################

# END JAVASCRIPT/TYPESCRIPT RULES

# All code MUST follow these rules. If you cannot meet them, STOP and explain why.
