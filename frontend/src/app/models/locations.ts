// Office locations as a city -> areas cascade.
// office_campus is stored as "City - Area" (e.g. "Chennai - Siruseri").

export const LOCATIONS: Record<string, string[]> = {
  Chennai: ['Siruseri', 'Sholinganallur', 'Tambaram'],
  Pune: ['Hinjewadi', 'Wakad', 'Baner'],
  Bengaluru: ['Electronic City', 'Whitefield', 'Bellandur']
};

export const CITIES = Object.keys(LOCATIONS);

/** Build the stored office_campus string from a city + area. */
export function toCampus(city: string, area: string): string {
  return `${city} - ${area}`;
}

export const API_ORIGIN = 'http://localhost:8081';
