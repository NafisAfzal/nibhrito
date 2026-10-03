// Public product explanations and fictional examples. Never populate with inbox data.
export const story = {
  whyLink: 'Why Nibhrito',
  example: {
    label: 'An example of your space',
    ask: 'You ask',
    question: 'What could I improve in my next project?',
    share: 'Share your link',
    reply: 'Someone responds privately',
    response:
      'Your ideas were clear. A few more examples would help people follow along.',
    read: 'You read it in your inbox',
  },
  uses: {
    eyebrow: 'Everyday reasons to ask',
    title: 'A fresh perspective can help.',
    items: [
      {
        icon: 'work',
        title: 'Your work',
        body: 'Ask what worked. Find out what could be better.',
        example: '“How did my presentation feel?”',
      },
      {
        icon: 'idea',
        title: 'Your ideas',
        body: 'Give people room to share an honest reaction.',
        example: '“What would make this project more useful?”',
      },
      {
        icon: 'message',
        title: 'A thoughtful check-in',
        body: 'Invite encouragement, reflections or a different point of view.',
        example: '“What should I keep doing? What could I improve?”',
      },
    ],
  },
  steps: [
    {
      icon: 'link',
      title: 'Create your link',
      body: 'Choose a name and a question. Save your recovery code.',
    },
    {
      icon: 'share',
      title: 'Share it',
      body: 'People open your link and write without signing up.',
    },
    {
      icon: 'inbox',
      title: 'Receive private feedback',
      body: 'Open encrypted messages in your own inbox, in your own time.',
    },
  ],
  openness: {
    eyebrow: 'A little less social pressure',
    title: 'Make honesty easier to share.',
    intro:
      'Sometimes a useful thought goes unsaid because saying it feels awkward. A private invitation can make room for it.',
    items: [
      {
        icon: 'profile',
        title: 'No name attached',
        body: 'Nibhrito does not show a sender identity to the recipient.',
      },
      {
        icon: 'message',
        title: 'Room to think',
        body: 'A person can choose their words without being put on the spot.',
      },
      {
        icon: 'idea',
        title: 'Something to grow from',
        body: 'Invite specific, kind suggestions you can put to use.',
      },
    ],
    limits:
      'Anonymous to the recipient does not mean untraceable. Your words, device and network can still reveal information.',
  },
  privacy: {
    label: 'How a message stays private',
    steps: [
      {
        icon: 'device',
        title: 'Encrypted before it leaves',
        body: 'The sender’s browser turns the message into encrypted data.',
      },
      {
        icon: 'storage',
        title: 'Stored as encrypted data',
        body: 'Nibhrito’s server stores the message in this unreadable form.',
      },
      {
        icon: 'key',
        title: 'Opened with your key',
        body: 'Your browser uses your private key to read the message.',
      },
    ],
    note: 'Your working private key stays in your browser. A recovery copy is stored encrypted; your saved code opens it locally. Nibhrito never receives that code.',
    limits:
      'Encryption protects message content. It cannot protect a compromised device or malicious site code, and hosting providers still process network metadata.',
  },
  respect: {
    title: 'Honest can still be kind.',
    intro:
      'Use the space to help someone understand, reflect or improve. A little care makes a candid thought more useful.',
    items: [
      {
        icon: 'message',
        title: 'Be specific',
        body: 'Share an observation or a useful suggestion.',
      },
      {
        icon: 'heart',
        title: 'Be considerate',
        body: 'Talk about the idea or action. Respect the person.',
      },
      {
        icon: 'shield',
        title: 'Keep it safe',
        body: 'Leave out threats, harassment and someone else’s private information.',
      },
    ],
    link: 'Our respectful-use guidelines',
  },
  about: {
    eyebrow: 'Why Nibhrito exists',
    title: 'Good feedback needs room to breathe.',
    intro:
      'Nibhrito is a personal link for honest opinions, thoughtful feedback and open expression. Share a question. Let people respond privately, without an account or their name attached.',
    purpose:
      'Privacy is here to protect people and make honest communication easier. This is a space for constructive expression, not a licence to hurt someone.',
    bangla: 'সৎ মতামত, সম্মান রেখে।',
    finalTitle: 'Start with a thoughtful question.',
  },
  setup: {
    label: 'What you are creating',
    steps: [
      {
        icon: 'message',
        title: 'Your invitation',
        body: 'A name and question people can see.',
      },
      {
        icon: 'link',
        title: 'Your personal link',
        body: 'One link to share with others.',
      },
      {
        icon: 'inbox',
        title: 'Your private inbox',
        body: 'Feedback you open on your device.',
      },
    ],
  },
  share: {
    title: 'A link. An invitation. A fresh perspective.',
    label: 'From your link to your inbox',
    steps: [
      {
        icon: 'link',
        title: 'Copy the full link',
        body: 'Use the button above so its secure details stay intact.',
      },
      {
        icon: 'share',
        title: 'Invite a response',
        body: 'Send it with a question, or let someone scan the QR code.',
      },
      {
        icon: 'inbox',
        title: 'Come back to your inbox',
        body: 'Read the feedback privately when you are ready.',
      },
    ],
    tip: 'Try sharing it with a clear invitation: “What worked well? What could I do differently?”',
  },
  compose: {
    title: 'A helpful thought goes a long way.',
    body: 'Say what you noticed, what you appreciated, or what could improve. Keep it honest and considerate.',
    sent: 'Thank you for sharing a thoughtful perspective.',
  },
  empty: {
    invitation: 'Your link is the invitation.',
    label: 'Invite your first response',
    steps: [
      {
        icon: 'link',
        title: 'Share your link',
        body: 'Add a question you care about.',
      },
      {
        icon: 'message',
        title: 'Give people room',
        body: 'They can reply without signing up.',
      },
      {
        icon: 'inbox',
        title: 'Read it here',
        body: 'Messages open privately on this device.',
      },
    ],
  },
  recovery: {
    label: 'How recovery brings you back',
    steps: [
      {
        icon: 'key',
        title: 'Keep your code safe',
        body: 'Save it separately in a place only you can access.',
      },
      {
        icon: 'device',
        title: 'Use a trusted browser',
        body: 'Enter your link name and saved code on Restore.',
      },
      {
        icon: 'inbox',
        title: 'Return to your inbox',
        body: 'Your code opens your keys in that browser.',
      },
    ],
  },
  archive: {
    label: 'What you need to open a backup',
    steps: [
      {
        icon: 'note',
        title: 'Your encrypted file',
        body: 'Choose the Nibhrito backup you downloaded.',
      },
      {
        icon: 'key',
        title: 'Your saved code',
        body: 'The same recovery code from profile setup.',
      },
      {
        icon: 'device',
        title: 'Read on this device',
        body: 'The file opens here. Nothing is uploaded.',
      },
    ],
  },
  support:
    'Ask for help without sharing private messages, recovery codes or device keys.',
} as const;
