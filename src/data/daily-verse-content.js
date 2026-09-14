const dailyVerseContent = {
  'John 1:5': {
    title: 'Light that darkness cannot overcome',
    explanation: 'Jesus is not presented as a temporary guide who disappears when life becomes difficult. His light remains present and gives hope in places where fear, sin, and confusion seem strongest.',
  },
  'John 1:14': {
    title: 'God comes near in Jesus',
    explanation: 'The Christian message is not only that God speaks from a distance. In Jesus, God’s grace and truth are made visible in a human life that can be seen, heard, and known.',
  },
  'John 3:16': {
    title: 'Love gives before it demands',
    explanation: 'This verse places God’s love at the center of salvation. Trusting Jesus is an invitation to receive life as a gift, not a claim that we can earn God’s acceptance by our own record.',
  },
  'John 8:12': {
    title: 'Follow the light',
    explanation: 'Jesus offers more than information about God; He calls people to follow Him. His light gives direction for the next faithful step, even when the whole road is not yet visible.',
  },
  'John 10:10': {
    title: 'Life in its fullness',
    explanation: 'Jesus contrasts His purpose with voices that exploit and destroy. His promise is not a life without hardship, but a life made whole through knowing the Shepherd who gives Himself for His people.',
  },
  'John 11:25': {
    title: 'Hope is a person',
    explanation: 'Jesus does not merely teach a theory about resurrection. He identifies Himself as the source of resurrection life, so Christian hope rests on trusting Him rather than on human strength.',
  },
  'John 14:6': {
    title: 'Come to the Father through Jesus',
    explanation: 'Jesus makes a direct claim about His identity and mission. Christianity invites an honest response to Him as the living way to the Father, not simply admiration for one more prophet or teacher.',
  },
  'John 15:9': {
    title: 'Remain in Christ’s love',
    explanation: 'Jesus describes discipleship as remaining in His love. Obedience is therefore a response to love already given, not a performance intended to persuade God to care for us.',
  },
  'John 16:33': {
    title: 'Peace in a troubled world',
    explanation: 'Jesus is honest that His followers will face trouble. He offers courage because He has overcome the world’s power to define our future, our worth, or our final hope.',
  },
  'John 20:31': {
    title: 'Read in order to trust',
    explanation: 'The Gospel of John records signs and teachings with a purpose: that readers may recognize Jesus as the Christ and receive life through trusting Him.',
  },
  'Luke 4:18': {
    title: 'Good news for the broken',
    explanation: 'Jesus announces a mission of freedom, healing, and good news. His kingdom is not indifferent to the poor, captive, wounded, or overlooked; His mercy moves toward them.',
  },
  'Luke 15:20': {
    title: 'The Father welcomes the returning heart',
    explanation: 'Jesus portrays repentance as coming home to a compassionate Father. The returning person is not met with humiliation, but with mercy that restores relationship.',
  },
  'Luke 19:10': {
    title: 'Jesus seeks the lost',
    explanation: 'Jesus’ mission is directed toward people who know they are far from God. You do not have to make yourself worthy before turning toward Him; He came to seek and save the lost.',
  },
  'Luke 24:6': {
    title: 'The empty tomb changes everything',
    explanation: 'The resurrection is the center of Christian hope. Jesus is not remembered only as a martyr or teacher; He is proclaimed as alive, and His victory opens the promise of life with God.',
  },
  'Matthew 11:28': {
    title: 'Bring your burden to Jesus',
    explanation: 'Jesus invites the weary rather than demanding that they hide their exhaustion. His rest is the relief of coming under His care and learning from His gentle, trustworthy character.',
  },
  'Matthew 22:37': {
    title: 'Love God with your whole self',
    explanation: 'Jesus gathers faithful living around love for God—heart, soul, and mind. This is not empty ritual; it is a whole-person response to the God who has first made Himself known.',
  },
  'Matthew 28:20': {
    title: 'Jesus stays with His people',
    explanation: 'The risen Jesus does not send His followers into the world alone. His presence gives courage for learning, obedience, witness, and ordinary faithfulness each day.',
  },
  'Mark 10:45': {
    title: 'The King who serves',
    explanation: 'Jesus defines greatness through self-giving service. His death is not an accident at the edge of His mission; He willingly gives Himself to bring redemption to others.',
  },
  'Mark 12:29': {
    title: 'The one God is worthy of love',
    explanation: 'Jesus affirms Israel’s confession that God is one. Christian belief in the Father, Son, and Holy Spirit is meant to protect that truth while taking seriously the Bible’s revelation of Jesus.',
  },
  'Romans 5:8': {
    title: 'Love meets us in our sin',
    explanation: 'God’s love is demonstrated while people are still sinners, not after they have repaired themselves. The cross shows grace moving toward us when we have no achievement to offer.',
  },
  'Romans 8:1': {
    title: 'No condemnation in Christ',
    explanation: 'For those who are in Christ Jesus, guilt is not the final word. Forgiveness is grounded in what Jesus has done, giving freedom to turn from sin without living under hopeless shame.',
  },
  'Romans 8:39': {
    title: 'Nothing can separate you from God’s love',
    explanation: 'Christian assurance does not rest on changing feelings or perfect circumstances. God’s love in Christ is stronger than suffering, fear, failure, and every created power.',
  },
  'Romans 10:9': {
    title: 'Trust and speak openly',
    explanation: 'Faith is a personal response to Jesus’ death and resurrection. Confessing Him is not a secret achievement; it is openly entrusting your life to the risen Lord.',
  },
  'Ephesians 2:8': {
    title: 'Salvation is grace',
    explanation: 'Paul removes the pressure to purchase salvation through religious performance. We are saved by God’s grace through faith, so gratitude—not self-congratulation—becomes the foundation of new life.',
  },
  '2 Corinthians 5:17': {
    title: 'A new creation begins',
    explanation: 'Coming to Christ is not merely adding a label to an unchanged life. Jesus begins a renewing work that gives a new identity and a new direction, even while growth remains a process.',
  },
  'Galatians 2:20': {
    title: 'Christ lives in the believer',
    explanation: 'Christian faith joins a person to Jesus in a life of trust. The goal is not self-erasure, but a new center: the Son of God loved me and gave Himself for me.',
  },
  '1 Peter 5:7': {
    title: 'Give your anxiety to God',
    explanation: 'God’s care is personal enough to receive the burdens we carry. Prayer can begin with honest surrender: naming the worry and trusting that the Father is not indifferent to it.',
  },
  '1 John 4:9': {
    title: 'God’s love is made visible',
    explanation: 'God’s love is not left as an abstract idea. He sends His Son so that people can know what divine love looks like: sacrificial, purposeful, and directed toward life.',
  },
  'Psalms 23:1': {
    title: 'The Lord is a shepherd',
    explanation: 'A shepherd guides, protects, and provides for the sheep. This ancient image prepares us to understand Jesus as the Good Shepherd who knows His people and lays down His life for them.',
  },
  'Psalms 34:18': {
    title: 'God draws near to the crushed',
    explanation: 'Brokenness does not make a person invisible to God. Scripture gives permission to bring a crushed heart honestly before Him, trusting that His nearness is compassion rather than condemnation.',
  },
  'Psalms 119:105': {
    title: 'Scripture gives the next step',
    explanation: 'God’s word may not answer every question at once, but it gives light for faithful movement. Read slowly, ask what it reveals about God, and practice the next clear step.',
  },
  'Isaiah 53:5': {
    title: 'The suffering servant brings peace',
    explanation: 'Isaiah describes a servant who suffers for the healing of others. Christians see this promise fulfilled in Jesus, whose wounds and sacrifice become the ground of reconciliation with God.',
  },
  default: {
    title: 'Read slowly and respond honestly',
    explanation: 'Let the passage show you what God is like, what Jesus has done, and what a faithful next step could be. Understanding grows as Scripture is read in context and lived with honesty.',
  },
};

export default dailyVerseContent;
