
import { CardData } from './types';

export const CARD_COUNT = 84; // High density wrap
export const SPHERE_RADIUS = 580; // Increased radius to prevent cards from overlapping too much
export const INERTIA_FRICTION = 0.96;
export const ROTATION_SENSITIVITY = 0.004;

// Mock data generation
export const MOCK_CARDS: CardData[] = Array.from({ length: CARD_COUNT }, (_, i) => ({
  id: i,
  imageUrl: `https://picsum.photos/seed/${i + 120}/400/400`, // Square images
  title: `Archive Item ${i + 1}`,
  description: `Detailed exploration of Item ${i + 1}. This entry represents a unique node in the interactive 3D archive, demonstrating high-density data visualization and smooth spatial navigation.`,
}));
