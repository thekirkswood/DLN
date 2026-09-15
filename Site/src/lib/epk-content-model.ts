export type EpkStory = {
  id: string;
  title: string;
  body: string;
  imageHref?: string;
  createdAt: string;
  updatedAt?: string;
  seeded?: boolean;
  live?: boolean;
};

export type EpkPromo = {
  id: string;
  title: string;
  body: string;
  imageHref?: string;
  createdAt: string;
  updatedAt?: string;
  codeHash?: string;
  live?: boolean;
};

export type KitCover = {
  logos?: string;
  product?: string;
  founder?: string;
  campaigns?: string;
};

export type KitShown = {
  logos?: boolean;
  banners?: boolean;
  people?: boolean;
  files?: boolean;
  stories?: boolean;
  promos?: boolean;
};

export type KitContent = {
  kit: string;
  overview: string[];
  stories: EpkStory[];
  promos: EpkPromo[];
  cover: KitCover;
  shown: KitShown;
};

export function isShown(shown: KitShown | undefined, key: keyof KitShown): boolean {
  return shown?.[key] !== false;
}

export function liveStories(content: KitContent): EpkStory[] {
  return content.stories.filter((s) => s.live !== false);
}

export function livePromos(content: KitContent): EpkPromo[] {
  return content.promos.filter((p) => p.live !== false);
}

export function storyById(content: KitContent, id: string): EpkStory | undefined {
  return content.stories.find((s) => s.id === id);
}

export function promoById(content: KitContent, id: string): EpkPromo | undefined {
  return content.promos.find((p) => p.id === id);
}
