/**
 * About copy. Everything outside `example` is confirmed by Parsa and safe to publish.
 * `example` holds placeholder text: it shows in development and is left out of production
 * builds (see SHOW_EXAMPLES in lib/content.ts) until replaced with real facts.
 */
export const about = {
  statement: 'Software developer building for the web, mobile and AI.',
  bio: [
    'I’m Parsa Alizadeh, a software developer. I started learning programming in 2021, and since 2024 I have been taking on projects as a freelance developer.',
    'I build web and mobile applications, and I work with artificial intelligence to make software more useful. This site is where I collect my projects, write about what I build and learn, and where you can get in touch.'
  ],
  interests: ['Web development', 'Mobile development', 'Software engineering', 'Programming', 'Artificial intelligence'],

  /** Career as a version history, newest first. Confirmed by Parsa. */
  timeline: [
    { version: 'v1.0', year: '2024', title: 'Freelance developer', text: 'Started taking on projects as a freelance developer.' },
    { version: 'v0.1', year: '2021', title: 'Started programming', text: 'Began learning to program.' }
  ],

  example: {
    story: [
      'I started programming by taking apart small games and websites to see how they worked. That curiosity turned into a habit of building things end to end: the database, the API, the interface, and the details in between.',
      'Lately I spend a lot of time on AI features: not chat boxes for their own sake, but models that quietly make an existing product faster or easier to use.'
    ]
  }
};
