// The words that go to an image model for each decision, so that its pictures can stand in for the drawn ones. Written from the
// same text the player reads, with the look of the game's art asked for in a paragraph of its own. `scripts/make-art.mjs` sends
// them; they are kept in `scripts/art/prompts.json`, which a test keeps in step with this file and with the events' own words.

/** The look asked for, the same for every picture. */
export const STYLE = [
  'A premium indie game scenario illustration for a satirical political strategy game, in a high-quality hand-drawn digital ink sketch style.',
  'Art style: editorial political cartoon, detailed digital ink sketching with sharp, expressive cross-hatched linework and subtle stippling textures for shadows; organic, imperfect, hand-inked linework with varying stroke weights.',
  'Colour: a sophisticated, desaturated palette on a warm vintage cream paper texture; sharp charcoal-black outlines; fills like light, semi-transparent watercolour washes, with strategic pops of deep royal blue, vibrant campaign red and emerald green against muted earthy tones.',
  'Culture: grounded accurately in contemporary Malaysian political and everyday culture: batik shirts with rolled-up sleeves, loose-fitting songkoks, headscarves, casual local clothing, glasses of teh tarik, plastic chairs, kampung houses on stilts, shophouses, satirical campaign posters with caricatured faces.',
  'Composition: wide-angle cinematic 16:9 framing, a clean composition with one clear focal point and two to six expressive characters, suitable as a standalone story event card in a video game.',
].join(' ');

/** What is never to appear in a picture. */
export const AVOID = 'Do not include any text, letters, numbers, captions, logos, watermarks or interface elements. Do not depict any real or recognisable person, real party emblem or real flag; all characters and parties are fictional.';

/** The decisions that are not events, in a line each. */
export const KIND_SCENES: Record<string, { title: string; body: string }> = {
  pactOffer: { title: 'An offer from another party', body: 'The leader of another party calls with an offer of a pact: seats to stand aside in, seats in return. Two leaders at a table with glasses of teh tarik, a handshake half offered.' },
  poach: { title: 'A rival tries to take a seat', body: 'A rival party is trying to lure away a sitting member at night, an envelope on the table, a hotel lobby behind.' },
  summons: { title: 'A summons to the Palace', body: 'Evening, a golden-domed Palace behind, a party leader arriving by car to be asked who can command a majority in the House.' },
  unityAdvice: { title: 'The Palace advises unity', body: 'A ruler on a throne chair advising three party leaders in sashes to explore a government of national unity.' },
  vote: { title: 'A vote in the House', body: 'The House is about to vote on a bill: a party leader whipping members, a ballot box, a gavel, members waving and wavering.' },
  houseVote: { title: 'A vote called by another party', body: 'Members of the House in a crowd, waiting to see how a vote the leader of another party has called will fall, a ballot box in front.' },
  agenda: { title: 'A state asks for something', body: 'A village headman and townsfolk outside a kampung house and shophouses, putting a question to the new leader.' },
  partyPoll: { title: "The party's own election", body: "A party assembly: delegates in sashes around a ballot box, a stage in party colours behind, rival camps watching each other." },
  redraw: { title: 'The boundaries are drawn again', body: 'Officials and a politician over a large map of constituencies, a pencil, papers, a kampung and shophouses behind.' },
};

/** How a decision is put to the model: the look, then the moment, then what to avoid. The script puts it together the same way. */
export const LEAD = 'The moment to draw, called';
export const TAIL = 'Show it as a single visual story, not a diagram: who is doing what, where, with a little satire in the details.';
const LONGEST = 520;

/** The part of a decision's text that is sent: its first few sentences. */
export const trimmed = (body: string): string => (body.length > LONGEST ? `${body.slice(0, LONGEST).replace(/\s+\S*$/, '')}…` : body);

/** The words for one decision, given its title and what it says. */
export const promptFor = (title: string, body: string): string => `${STYLE}\n\n${LEAD} "${title}": ${trimmed(body)}\n${TAIL}\n${AVOID}`;
