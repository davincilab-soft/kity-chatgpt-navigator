export function detectAdapterAlias(url: URL): string {
  const host = url.hostname;

  // ChatGPT
  if (host.endsWith('chat.openai.com') || host === 'chatgpt.com') {
    return 'gpt';
  }

  // Claude
  if (host === 'claude.ai' || host.endsWith('.claude.ai')) {
    return 'claude';
  }

  // Gmail
  if (host === 'mail.google.com') {
    return 'gmail';
  }

  // Google Drive
  if (host === 'drive.google.com') {
    return 'gdrive';
  }

  // Wikipedia
  if (host.endsWith('.wikipedia.org')) {
    return 'wpedia';
  }

  // Amazon
  const amazonDomains = [
    '.amazon.com',
    '.amazon.co.uk',
    '.amazon.de',
    '.amazon.co.jp',
    '.amazon.ca',
    '.amazon.in',
    '.amazon.fr',
    '.amazon.it',
    '.amazon.es',
    '.amazon.com.au',
  ];
  if (amazonDomains.some((domain) => host.endsWith(domain))) {
    return 'amazon';
  }

  // Google Search and other google.com pages
  if (host === 'www.google.com' || host === 'google.com' || host.endsWith('.google.com')) {
    return 'google';
  }

  return 'generic';
}
