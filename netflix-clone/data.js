const TITLES = [
  { id: 1, title: "Neon Harbor", type: "series", year: 2024, rating: "16+", match: 97, genres: ["Sci-Fi", "Thriller"], seasons: 3, hue: 280, desc: "In a flooded megacity, a dockside detective uncovers a conspiracy that reaches beyond the sea wall." },
  { id: 2, title: "The Last Cartographer", type: "movie", year: 2023, rating: "13+", match: 94, genres: ["Adventure", "Drama"], runtime: "2h 11m", hue: 30, desc: "A retired mapmaker is pulled back for one final expedition to chart a place that shouldn't exist." },
  { id: 3, title: "Midnight Kitchen", type: "series", year: 2022, rating: "PG", match: 91, genres: ["Comedy", "Drama"], seasons: 4, hue: 10, desc: "Four misfit chefs run the only restaurant open after midnight, serving secrets with every plate." },
  { id: 4, title: "Static", type: "movie", year: 2024, rating: "18+", match: 88, genres: ["Horror", "Thriller"], runtime: "1h 42m", hue: 200, desc: "A night-shift radio host starts receiving calls from listeners who are already gone." },
  { id: 5, title: "Orbit Academy", type: "series", year: 2025, rating: "13+", match: 95, genres: ["Sci-Fi", "Teen"], seasons: 2, hue: 220, desc: "Teenagers from twelve worlds compete for a place on humanity's first interstellar crew." },
  { id: 6, title: "Paper Tigers", type: "movie", year: 2021, rating: "13+", match: 86, genres: ["Action", "Comedy"], runtime: "1h 58m", hue: 45, desc: "Three washed-up stuntmen reunite to pull off one last, wildly legal heist." },
  { id: 7, title: "Salt & Ember", type: "series", year: 2023, rating: "16+", match: 92, genres: ["Drama", "Romance"], seasons: 2, hue: 350, desc: "Rival bakers in a small coastal town find that sweetness and ruin share the same recipe." },
  { id: 8, title: "Deep Signal", type: "movie", year: 2025, rating: "13+", match: 93, genres: ["Sci-Fi", "Adventure"], runtime: "2h 24m", hue: 175, desc: "A lone researcher on the ocean floor decodes a message that was meant for someone else." },
  { id: 9, title: "Crown of Ash", type: "series", year: 2024, rating: "18+", match: 96, genres: ["Fantasy", "Drama"], seasons: 5, hue: 0, desc: "Five houses, one throne, and a prophecy written in the ashes of the last war." },
  { id: 10, title: "Laugh Track", type: "series", year: 2022, rating: "PG", match: 84, genres: ["Comedy"], seasons: 6, hue: 55, desc: "The writers' room of a failing sitcom is funnier than anything they put on air." },
  { id: 11, title: "Quiet Planet", type: "movie", year: 2020, rating: "PG", match: 90, genres: ["Documentary", "Nature"], runtime: "1h 33m", hue: 130, desc: "A breathtaking look at the world when the loudest species finally goes silent." },
  { id: 12, title: "Redline", type: "movie", year: 2024, rating: "16+", match: 89, genres: ["Action", "Thriller"], runtime: "1h 51m", hue: 15, desc: "A getaway driver has ninety minutes to cross the city with the wrong passenger." },
  { id: 13, title: "Moonlight Syndicate", type: "series", year: 2025, rating: "16+", match: 94, genres: ["Crime", "Drama"], seasons: 1, hue: 250, desc: "A courier for a secret society discovers she is the one being delivered." },
  { id: 14, title: "Paper Planes", type: "movie", year: 2022, rating: "PG", match: 87, genres: ["Family", "Adventure"], runtime: "1h 36m", hue: 195, desc: "Two siblings fold their way across a continent to bring a lost kite home." },
  { id: 15, title: "Hollow Pines", type: "series", year: 2023, rating: "16+", match: 90, genres: ["Horror", "Mystery"], seasons: 3, hue: 150, desc: "Every winter, one resident of Hollow Pines disappears. This year, the town decides to fight back." },
  { id: 16, title: "Beat Street", type: "series", year: 2021, rating: "13+", match: 85, genres: ["Music", "Drama"], seasons: 3, hue: 310, desc: "An underground crew turns a condemned theater into the city's loudest stage." }
];

const ROWS = [
  { name: "Trending Now", ids: [9, 1, 5, 13, 8, 12, 3, 7] },
  { name: "Top Picks for You", ids: [8, 2, 15, 16, 4, 6, 11, 10] },
  { name: "Sci-Fi & Fantasy", filter: t => t.genres.some(g => ["Sci-Fi", "Fantasy"].includes(g)) },
  { name: "Thrillers & Horror", filter: t => t.genres.some(g => ["Thriller", "Horror", "Mystery", "Crime"].includes(g)) },
  { name: "Feel-Good Comedies & Family", filter: t => t.genres.some(g => ["Comedy", "Family", "Romance"].includes(g)) }
];
