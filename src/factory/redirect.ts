// Placeholder for actual Factory SDK
// In a real implementation, this would be: import { ui } from '@factory/sdk';
const ui = {
  sendMessage: (messages: any[]) => {
    console.log('Factory SDK message:', messages);
  },
  renderTag: ({ label, href, variant }: { label: string; href: string; variant: string }) => {
    return {
      type: 'tag',
      label,
      href,
      variant
    };
  }
};

export const CODE_DROID_URL = '/new?persona=code-droid&via=tutorial';

/**
 * Detects if a message contains keywords indicating real work requests
 * @param message The user message to check
 * @returns True if the message appears to be asking for real work
 */
export function isRealWork(message: string) {
  return /migrate|auth|billing|db|production|deploy|feature\[- \]flag|refactor/i.test(message);
}

/**
 * Redirects the user to Code Droid for real development work
 */
export function sendCodeDroidRedirect() {
  ui.sendMessage([
    ui.renderTag({ label: 'Open Code Droid', href: CODE_DROID_URL, variant: 'action' }),
    { type: 'text', text: 'This session is a quick demo. Let's switch over so we can work on your real code!' }
  ]);
}
