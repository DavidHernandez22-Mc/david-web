// Datos que no dependen del idioma: demos, colores de sector y precios.

export type SectorId = 'general' | 'odontologia' | 'estetica' | 'veterinaria' | 'inmobiliaria' | 'restaurante' | 'otro';
export type DemoId = 'odontologia' | 'estetica' | 'veterinaria' | 'inmobiliaria' | 'restaurante';
export type PackageId = 'esencial' | 'profesional' | 'premium';

export interface DemoMeta {
  id: DemoId;
  name: string;
  url: string;
  /** false = la demo no está en línea; la tarjeta no abre nada y ofrece pedirla por WhatsApp. */
  live: boolean;
  /** false = la demo no permite iframe; se abre directo en pestaña nueva. */
  iframe: boolean;
  bg: string;
  ink: string;
  btn: string;
  btnInk: string;
}

// Para volver a encender Lumen: publícala en esa URL y cambia live a true.
export const DEMOS: DemoMeta[] = [
  { id: 'odontologia', name: 'Clínica Dental Chicó', url: 'https://odontologiademo1.netlify.app', live: true, iframe: true, bg: '#1c2b27', ink: '#f1f1ec', btn: '#ebebe7', btnInk: '#14211d' },
  { id: 'restaurante', name: 'La Plancha 70', url: 'https://restauranteejemplodc.netlify.app', live: true, iframe: true, bg: '#c81e12', ink: '#ffffff', btn: '#f7b91c', btnInk: '#1b110c' },
  { id: 'inmobiliaria', name: 'Altamira Propiedades', url: 'https://altamira-demo.vercel.app', live: true, iframe: true, bg: '#dedad3', ink: '#0f0f0d', btn: '#235a4c', btnInk: '#ffffff' },
  { id: 'veterinaria', name: 'Arrayán Clínica Veterinaria', url: 'https://arrayan-vet-demo.vercel.app', live: true, iframe: true, bg: '#15291f', ink: '#f3f4ee', btn: '#d6f07a', btnInk: '#13251b' },
  { id: 'estetica', name: 'Lumen Clínica Estética', url: 'https://lumen-estetica-demo.vercel.app', live: false, iframe: true, bg: '#133621', ink: '#f6f3e6', btn: '#f4d96c', btnInk: '#133621' },
];

export const SECTOR_THEME: Record<SectorId, { bg: string; ink: string; btn: string; btnInk: string }> = {
  general: { bg: '#ff7a1f', ink: '#050f16', btn: '#050f16', btnInk: '#ffffff' },
  odontologia: { bg: '#1c2b27', ink: '#f1f1ec', btn: '#ebebe7', btnInk: '#14211d' },
  estetica: { bg: '#133621', ink: '#f6f3e6', btn: '#f4d96c', btnInk: '#133621' },
  veterinaria: { bg: '#15291f', ink: '#f3f4ee', btn: '#d6f07a', btnInk: '#13251b' },
  inmobiliaria: { bg: '#dedad3', ink: '#0f0f0d', btn: '#235a4c', btnInk: '#ffffff' },
  restaurante: { bg: '#c81e12', ink: '#ffffff', btn: '#f7b91c', btnInk: '#1b110c' },
  otro: { bg: '#050f16', ink: '#ffffff', btn: '#ff7a1f', btnInk: '#050f16' },
};

export const COP_PRICES: Record<PackageId, number> = { esencial: 1600000, profesional: 2900000, premium: 4900000 };
export const COP_MAINTENANCE = 150000;
// 1 USD = 3.160 COP, redondeado a una cifra limpia.
export const USD_PRICES: Record<PackageId, number> = { esencial: 510, profesional: 920, premium: 1550 };
export const USD_MAINTENANCE = 48;

export const wa = (number: string, message: string) => `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

export const demoSrcset = (id: DemoId, view: 'mobile' | 'desktop') =>
  (view === 'mobile' ? [260, 390, 560] : [640, 960, 1440]).map((w) => `/demos/${id}-${view}-${w}.webp ${w}w`).join(', ');
