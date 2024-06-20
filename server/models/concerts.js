// Mock concert data
const concerts = [
  {
    id: 1,
    artist: "The Weeknd",
    date: "2022-07-01",
    location: "Toronto, ON",
    venue: "Rogers Centre",
  },
  {
    id: 2,
    artist: "Billie Eilish",
    date: "2022-08-01",
    location: "Los Angeles, CA",
    venue: "Staples Center",
  },
  {
    id: 3,
    artist: "Drake",
    date: "2022-09-01",
    location: "Toronto, ON",
    venue: "Scotiabank Arena",
  },
];

module.exports = {
  getAll: () => concerts,
  getById: (id) => concerts.find((concert) => concert.id === id),
};
