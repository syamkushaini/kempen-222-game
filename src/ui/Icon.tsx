import {
  AdjustmentsHorizontalIcon,
  ArchiveBoxIcon,
  BanknotesIcon,
  BellIcon,
  BoltIcon,
  BookOpenIcon,
  BuildingLibraryIcon,
  ChartBarIcon,
  ChatBubbleLeftIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  FlagIcon,
  FolderIcon,
  HandThumbDownIcon,
  HandThumbUpIcon,
  HeartIcon,
  HomeIcon,
  InboxIcon,
  LockClosedIcon,
  MapIcon,
  MapPinIcon,
  MegaphoneIcon,
  MicrophoneIcon,
  MoonIcon,
  MusicalNoteIcon,
  PlayIcon,
  PlusIcon,
  PresentationChartBarIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  StarIcon,
  SunIcon,
  TrophyIcon,
  TvIcon,
  UsersIcon,
  ViewfinderCircleIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { ComponentType, SVGProps } from 'react';

/**
 * The small line icons the interface uses. Most are Heroicons (outline, 24-point grid, MIT licence: tailwindlabs/heroicons). Heroicons has no
 * crown or coffee cup, so those two are drawn here on the same grid with the same stroke. They are never the only label: a word or a name goes with each.
 */
const HERO = {
  flag: FlagIcon,
  landmark: BuildingLibraryIcon,
  people: UsersIcon,
  intel: ChartBarIcon,
  sun: SunIcon,
  moon: MoonIcon,
  auto: ComputerDesktopIcon,
  sliders: AdjustmentsHorizontalIcon,
  speaker: SpeakerWaveIcon,
  muted: SpeakerXMarkIcon,
  music: MusicalNoteIcon,
  inbox: InboxIcon,
  thumbUp: HandThumbUpIcon,
  thumbDown: HandThumbDownIcon,
  ballot: ArchiveBoxIcon,
  megaphone: MegaphoneIcon,
  compass: MapIcon,
  play: PlayIcon,
  plus: PlusIcon,
  folder: FolderIcon,
  trophy: TrophyIcon,
  target: ViewfinderCircleIcon,
  book: BookOpenIcon,
  gear: Cog6ToothIcon,
  lock: LockClosedIcon,
  back: ChevronLeftIcon,
  check: CheckIcon,
  chevron: ChevronRightIcon,
  tv: TvIcon,
  phone: DevicePhoneMobileIcon,
  board: PresentationChartBarIcon,
  bolt: BoltIcon,
  coins: BanknotesIcon,
  home: HomeIcon,
  mic: MicrophoneIcon,
  heart: HeartIcon,
  star: StarIcon,
  doc: DocumentTextIcon,
  tool: WrenchScrewdriverIcon,
  chat: ChatBubbleLeftIcon,
  walk: MapPinIcon,
  close: XMarkIcon,
  bell: BellIcon,
} satisfies Record<string, ComponentType<SVGProps<SVGSVGElement>>>;

const OWN = {
  crown: 'M4 18h16 M4 18L3 8l5 4 4-7 4 7 5-4-1 10',
  coffee: 'M5 9h11v5a5 5 0 01-5 5h-1a5 5 0 01-5-5V9z M16 10h2a2 2 0 010 4h-2 M8 3v3 M12 3v3',
} as const;

export type IconName = keyof typeof HERO | keyof typeof OWN;
export const ICON_NAMES = [...Object.keys(HERO), ...Object.keys(OWN)] as IconName[];

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const Hero: ComponentType<SVGProps<SVGSVGElement>> | undefined = (HERO as Record<string, ComponentType<SVGProps<SVGSVGElement>>>)[name];
  if (Hero) return <Hero className="icon" width={size} height={size} aria-hidden="true" />;
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {OWN[name as keyof typeof OWN].split(' M').map((d, i) => <path key={i} d={i === 0 ? d : `M${d}`} />)}
    </svg>
  );
}
