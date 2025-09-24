export const COUNTRIES = [
  { code: "global", name: "Global", flag: "🌎" },
  { code: "us", name: "United States", flag: "🇺🇸" },
  { code: "gb", name: "United Kingdom", flag: "🇬🇧" },
  { code: "ca", name: "Canada", flag: "🇨🇦" },
  { code: "au", name: "Australia", flag: "🇦🇺" },
  { code: "de", name: "Germany", flag: "🇩🇪" },
  { code: "fr", name: "France", flag: "🇫🇷" },
  { code: "jp", name: "Japan", flag: "🇯🇵" },
  { code: "br", name: "Brazil", flag: "🇧🇷" },
  { code: "in", name: "India", flag: "🇮🇳" },
  { code: "mx", name: "Mexico", flag: "🇲🇽" },
  { code: "es", name: "Spain", flag: "🇪🇸" },
  { code: "it", name: "Italy", flag: "🇮🇹" },
  { code: "ru", name: "Russia", flag: "🇷🇺" },
  { code: "cn", name: "China", flag: "🇨🇳" },
  { code: "kr", name: "South Korea", flag: "🇰🇷" },
  { code: "nl", name: "Netherlands", flag: "🇳🇱" },
  { code: "se", name: "Sweden", flag: "🇸🇪" },
  { code: "no", name: "Norway", flag: "🇳🇴" },
  { code: "dk", name: "Denmark", flag: "🇩🇰" },
]

// Sample tracks for demo
export const SAMPLE_TRACKS = [
  {
    id: "1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    albumArt: "https://i.scdn.co/image/ab67616d0000b273c5649add07ed3720be9d5526",
    preview_url: "https://p.scdn.co/mp3-preview/8b637ecd5334a3e9b31f9be1ce5a7f4cf668a7df",
  },
  {
    id: "2",
    title: "Dance Monkey",
    artist: "Tones and I",
    albumArt: "https://i.scdn.co/image/ab67616d0000b273c6f7af36eccd256b4d13cdee",
    preview_url: "https://p.scdn.co/mp3-preview/5c5a3a1b3df4e1b8e2c8e40c968e7ee5a0e6cf2b",
  },
  {
    id: "3",
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    albumArt: "https://i.scdn.co/image/ab67616d0000b273da5d5aeeabacacc1263c0f4b",
    preview_url: "https://p.scdn.co/mp3-preview/9babd7414d7cbf339a2863a9e68d8c335b19d244",
  },
  {
    id: "4",
    title: "Bad Guy",
    artist: "Billie Eilish",
    albumArt: "https://i.scdn.co/image/ab67616d0000b273d55016065669a5a151b46b5d",
    preview_url: "https://p.scdn.co/mp3-preview/7e8f1ecaa2ff71ecd3679f8672c85d0f10394be0",
  },
  {
    id: "5",
    title: "Levitating",
    artist: "Dua Lipa",
    albumArt: "https://i.scdn.co/image/ab67616d0000b273bd26ede1ae69327010d49946",
    preview_url: "https://p.scdn.co/mp3-preview/3b5610b9e1df3cc3bccb5bfc18c3c8e0ea37b5ca",
  },
]

export type Friend = {
  id: string
  name: string
  online: boolean
  avatar?: string
}
