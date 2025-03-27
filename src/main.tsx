import { Devvit, useWebView } from '@devvit/public-api';

// Configure Devvit to use Redis for data storage
Devvit.configure({ redditAPI: true });

// Create a custom post type for the emoji puzzle game
Devvit.addCustomPostType({
  name: 'Emoji Puzzle Game',
  description: 'Guess the phrase from the emojis!',
  render: (context) => {
    // Use the useWebView hook to manage the web view
    const { mount, postMessage } = useWebView({
      url: 'page.html',
      onMessage: async (message, webView) => {
        if (message.type === 'webViewReady') {
          // Send initial data when web view is ready
          const savedBestScore = await context.redis.get(`bestScore_${context.postId}`);
          webView.postMessage({ 
            type: 'initialData', 
            data: { bestScore: savedBestScore ? Number(savedBestScore) : 0 } 
          });
        }
        
        if (message.type === 'updateScore') {
          // Save the best score to Redis
          await context.redis.set(`bestScore_${context.postId}`, message.data.bestScore.toString());
        }
        
        if (message.type === 'newPuzzle') {
          // Store new puzzles in Redis
          const puzzlesKey = `puzzles_${context.postId}`;
          const existingPuzzles = await context.redis.get(puzzlesKey);
          const puzzles = existingPuzzles ? JSON.parse(existingPuzzles) : [];
          puzzles.push(message.data);
          await context.redis.set(puzzlesKey, JSON.stringify(puzzles));
        }
      },
      
      // Optional cleanup when web view is closed
      onUnmount: () => {
        console.log('Web view closed');
      },
    });

    return (
      <blocks height="regular">
        <vstack padding="medium" alignment="center middle" gap="medium">
          <text style="heading" size="xlarge">Emoji Puzzle Game</text>
          <text>Guess the phrase from the emojis!</text>
          <button onPress={mount} appearance="primary">Play Game</button>
        </vstack>
      </blocks>
    );
  },
});

// Add a menu item to create the game post
Devvit.addMenuItem({
  location: 'subreddit',
  label: 'Create Emoji Puzzle Game',
  onPress: async (_event, context) => {
    const subreddit = await context.reddit.getCurrentSubreddit();
    await context.reddit.submitPost({
      title: 'Emoji Puzzle Game',
      subredditName: subreddit.name,
      preview: (
        <vstack alignment="center middle" padding="medium">
          <text>Loading Emoji Puzzle Game...</text>
        </vstack>
      ),
    });
    context.ui.showToast('Created Emoji Puzzle Game post!');
  },
});

export default Devvit;
