# UI Rendering Delay Fix (First Question)

## The Issue
When a tester started an assessment, they experienced a noticeable delay—described as feeling like the system was "slowly uploading" the component. The central item image and the 4 waste bins took a second to fully appear on the screen.

## The Root Cause
The lag was not caused by a network delay or the Supabase database. The root cause was a combination of two artificial UI animations built directly into the React codebase that accidentally bottlenecked the screen drawing (painting):

1. **CSS Fade-In Overhead (`animate-fade-in`)**: 
   The `DraggableItem` component was natively wrapped in an `animate-fade-in` CSS class rule. This forced the browser GPU to paint the item entirely invisible at `0% opacity` and spend an artificial 400-milliseconds slowly ramping it up to 100% visibility.
   
2. **React Event Transition Constraint**: 
   A secondary React hook (`useEffect`) inside `DraggableItem.jsx` was keeping the specific item image completely hidden until the browser fired an `onLoad` event, manually triggering an additional `200ms transition` fade constraint.

Because testers often click the "Got It" button on the instructions screen extremely quickly, these two consecutive fade animations heavily punished the UI's perceived speed. To the eye, it looked as if the components were struggling to load.

## The Solution

1. **Stripped CSS Paint Delays**: 
   Completely removed the `animate-fade-in` class binding from `DraggableItem.jsx`, ensuring the DOM draws the layout block without CSS timing rules.
   
2. **Force Instant Exposure**: 
   Removed the `opacity: 0` initial phase and the `transition: opacity 0.2s` rule, hardcoding the rendering engine to expose the image at `opacity: 1` unconditionally the moment React finishes calculating the component tree.
   
3. **Synchronized Preloader Keys**: 
   Updated the background network preloader in `App.jsx` to process URLs using the specific `resolveImageUrl()` utility. This guarantees the browser's background cache key perfectly identical matches the URL path that the quiz subsequently requests, eliminating any secondary fetching or caching latency.
