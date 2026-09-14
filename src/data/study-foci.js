const studyFoci = [
  {
    id: 'meet-jesus',
    label: 'Meet Jesus',
    description: 'Begin with the Gospel portrait of Jesus: His words, His compassion, His authority, and His invitation to follow Him.',
    icon: 'sunrise',
    tone: 'gold',
    steps: [
      { id: 'meet-jesus-article', type: 'article', target: 'who-is-jesus', label: 'Begin with “Who is Jesus?”', detail: 'A short, honest introduction to the person at the center of Christianity.' },
      { id: 'meet-jesus-bible', type: 'bible', target: 'John 1:1–18', label: 'Read John 1', detail: 'Look closely at what John says about the Word who became flesh.' },
      { id: 'meet-jesus-path', type: 'path', target: 'meet-jesus', label: 'Follow the portrait of Jesus', detail: 'Use the source-linked Facts & Info path to go deeper at your own pace.' },
    ],
  },
  {
    id: 'understand-gospel',
    label: 'Understand the Gospel',
    description: 'Explore sin, grace, the Cross, resurrection, forgiveness, and the new life Jesus offers.',
    icon: 'cross',
    tone: 'violet',
    steps: [
      { id: 'gospel-article', type: 'article', target: 'what-is-the-gospel', label: 'Read “What is the Gospel?”', detail: 'Start with the good news Christians announce about Jesus.' },
      { id: 'gospel-bible', type: 'bible', target: '1 Corinthians 15:1–8', label: 'Read the earliest Gospel summary', detail: 'Examine the death, burial, resurrection, and witnesses named by Paul.' },
      { id: 'gospel-path', type: 'path', target: 'mercy-atonement-and-life', label: 'Study mercy and new life', detail: 'Consider how justice, grace, repentance, and hope fit together.' },
    ],
  },
  {
    id: 'trust-scripture',
    label: 'Trust Scripture',
    description: 'Learn how to read carefully and examine questions about manuscripts, transmission, translation, and the biblical witness.',
    icon: 'scroll',
    tone: 'blue',
    steps: [
      { id: 'scripture-article', type: 'article', target: 'bible-reliable', label: 'Read “Is the Bible reliable?”', detail: 'Separate manuscript evidence, translation, interpretation, and faith.' },
      { id: 'scripture-bible', type: 'bible', target: 'Luke 1:1–4', label: 'Read Luke’s introduction', detail: 'Notice the care Luke describes in investigating and recording the testimony.' },
      { id: 'scripture-path', type: 'path', target: 'trust-the-bible', label: 'Work through Bible questions', detail: 'Take a structured look at corruption claims, councils, the Injil, and Paul.' },
    ],
  },
  {
    id: 'pray-and-follow',
    label: 'Pray and follow',
    description: 'Move from information toward a quiet relationship with God through prayer, Scripture, courage, and wise next steps.',
    icon: 'hands',
    tone: 'green',
    steps: [
      { id: 'prayer-article', type: 'article', target: 'how-to-pray', label: 'Read “How do I pray?”', detail: 'Begin speaking honestly with God, without needing perfect words.' },
      { id: 'prayer-bible', type: 'bible', target: 'Matthew 6:9–13', label: 'Read Jesus’ pattern for prayer', detail: 'Listen to how Jesus teaches His followers to approach the Father.' },
      { id: 'prayer-open', type: 'view', target: 'prayer', label: 'Try a guided prayer', detail: 'Choose a private prayer prompt or write an entry that stays on this device.' },
    ],
  },
  {
    id: 'work-through-questions',
    label: 'Work through questions',
    description: 'Take one difficult question at a time, compare positions fairly, and return to the claims of Jesus and Scripture.',
    icon: 'dialogue',
    tone: 'gold',
    steps: [
      { id: 'questions-article', type: 'article', target: 'why-did-jesus-pray', label: 'Explore why Jesus prayed', detail: 'A common Muslim question examined through Christian explanation and Scripture.' },
      { id: 'questions-bible', type: 'bible', target: 'John 17:1–5', label: 'Read Jesus’ prayer in context', detail: 'Consider relationship, mission, humanity, and glory together.' },
      { id: 'questions-path', type: 'path', target: 'one-god-and-trinity', label: 'Study one God and the Trinity', detail: 'Keep Christian monotheism and the distinction of Father, Son, and Spirit in view.' },
    ],
  },
];

export default studyFoci;
