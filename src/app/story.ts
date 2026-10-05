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
    protected: 'Encrypted before sending',
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
      {
        icon: 'people',
        title: 'Your team or class',
        example: '“What could we do differently next time?”',
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
      'Sometimes the useful thought is the one we hesitate to say. Give it a little room.',
    comparisonLabel: 'Why a private response can help',
    identified: {
      title: 'With your name attached',
      quote: '“Will this make things awkward?”',
      steps: [
        { icon: 'profile', title: 'Identity visible' },
        { icon: 'thought', title: 'Second thoughts' },
        { icon: 'pause', title: 'Feedback held back' },
      ],
    },
    private: {
      title: 'With a Nibhrito link',
      quote: '“Here’s something that might help.”',
      steps: [
        { icon: 'profile', title: 'Name not shown' },
        { icon: 'message', title: 'Room to speak' },
        { icon: 'idea', title: 'A useful perspective' },
      ],
    },
    qualifier:
      'An illustration of how feedback can feel. Privacy cannot remove every risk or social pressure.',
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
  boundaries: {
    eyebrow: 'An honest account',
    title: 'What Nibhrito does, and what it cannot do.',
    intro:
      'Privacy here is a safety measure for honest, constructive feedback. It is not a promise of invisibility, and it is not a licence to hurt someone.',
    providesLabel: 'What it does',
    provides: [
      'Keeps a sender’s name away from the person receiving the feedback.',
      'Encrypts each message in the sender’s browser before it is uploaded.',
      'Leaves you in control of expiry, pausing and deletion.',
      'States its limits plainly instead of promising anonymity.',
    ],
    cannotLabel: 'What it cannot do',
    cannot: [
      'Make a sender untraceable to the network that carries the message.',
      'Prove who a sender is, or stop someone misusing the space.',
      'Read or moderate the content of an encrypted message.',
      'Recover a lost recovery code on your behalf.',
    ],
    note: 'These limits are structural, not temporary.',
    noteLink:
      'Read the security model before you rely on this for anything sensitive.',
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
    stepsLink: 'See how Nibhrito works',
  },
  setup: {
    label: 'What you are creating',
    steps: [
      {
        icon: 'message',
        title: 'Your invitation',
        shortTitle: 'Invite',
        body: 'A name and question people can see.',
      },
      {
        icon: 'link',
        title: 'Your personal link',
        shortTitle: 'Share',
        body: 'One link to share with others.',
      },
      {
        icon: 'inbox',
        title: 'Your private inbox',
        shortTitle: 'Receive',
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
    guidance: 'Be honest. Be considerate. Be specific.',
  },
  delivery: {
    label: 'Private delivery',
    steps: [
      {
        icon: 'lock',
        title: 'Encrypted here',
        body: 'Before it left this browser.',
      },
      {
        icon: 'inbox',
        title: 'In their inbox',
        body: 'Opened only with their private key.',
      },
    ],
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
        shortTitle: 'Save code',
        body: 'Save it separately in a place only you can access.',
      },
      {
        icon: 'device',
        title: 'Use a trusted browser',
        shortTitle: 'New device',
        body: 'Enter your link name and saved code on Restore.',
      },
      {
        icon: 'inbox',
        title: 'Return to your inbox',
        shortTitle: 'Restore',
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
