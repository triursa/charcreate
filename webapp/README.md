# D&D 5e Data Viewer

A modern, responsive webapp for browsing and exploring Dungeons & Dragons 5th Edition content including spells, races, classes, items, backgrounds, adventures, and feats.

## Features

- 🔍 **Powerful Search** - Search across all content types with fuzzy matching
- 🎯 **Advanced Filtering** - Filter by source, level, rarity, school, and more
- 🔗 **Cross-References** - Navigate between related content seamlessly
- 🌙 **Dark/Light Mode** - Toggle between themes with system preference detection
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ⚡ **Fast Performance** - Built with Next.js 14 for optimal speed
- 🎨 **Modern UI** - Clean, sleek interface with Tailwind CSS

## Content Types

- **Spells** - Complete spell compendium with level, school, and class filtering
- **Races** - Character races with traits, abilities, and proficiencies
- **Classes** - All classes and subclasses with features and progression
- **Items** - Equipment, weapons, armor, and magic items
- **Backgrounds** - Character backgrounds with skills and equipment
- **Adventures** - Published adventure modules and campaigns
- **Feats** - Character feats and special abilities

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd charcreate/webapp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Data Structure

The webapp reads D&D 5e content from JSON files in the `../data` directory. The data includes:

- Official content from Player's Handbook, Dungeon Master's Guide, Xanathar's Guide to Everything, Tasha's Cauldron of Everything, and more
- Cross-referenced content with clickable links between related items
- Rich text formatting with proper spell/item/creature references

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Search**: Fuse.js for fuzzy search
- **Icons**: Lucide React
- **Data**: Static JSON files from official D&D sources

## Features in Detail

### Search System
- Full-text search across all content types
- Fuzzy matching for typos and partial matches
- Relevance scoring and sorting
- Search within specific categories or across all content

### Filtering
- **Source filtering** - Filter by sourcebook (PHB, DMG, XGE, etc.)
- **Level filtering** - For spells (Cantrip, 1st-9th level)
- **Rarity filtering** - For items (Common, Uncommon, Rare, etc.)
- **School filtering** - For spells (Abjuration, Conjuration, etc.)

### Cross-References
- Clickable links within descriptions
- Navigate from spells mentioned in items
- Jump from class features to related spells
- Explore connected content seamlessly

### Responsive Design
- Mobile-first approach
- Collapsible sidebar navigation
- Touch-friendly interface
- Optimized for all screen sizes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for educational and personal use. All D&D content is property of Wizards of the Coast.

## Acknowledgments

- Wizards of the Coast for Dungeons & Dragons
- The D&D community for maintaining data sources
- Open source contributors for tools and libraries used