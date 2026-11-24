/** Kompakte, API-unabhängige Form eines Swarm-Check-ins. */
export interface Checkin {
  id: string;
  /** Unix-Sekunden (UTC) */
  createdAt: number;
  /** Zeitzonen-Versatz des Check-ins in Minuten */
  tzOffset: number;
  shout?: string;
  venueId?: string;
  venueName: string;
  lat?: number;
  lng?: number;
  address?: string;
  city?: string;
  country?: string;
  category?: string;
  photoCount: number;
  commentCount: number;
}

export interface CheckinComment {
  author?: string;
  text: string;
  createdAt?: number;
}

export interface CheckinDetail extends Checkin {
  comments: CheckinComment[];
  photos: string[];
}

export interface Place {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
  address?: string;
  city?: string;
  postcode?: string;
  country?: string;
  category?: string;
  distance?: number;
  website?: string;
}

export interface CategoryNode {
  id: string;
  name: string;
  children?: CategoryNode[];
}

export interface SessionInfo {
  /** OAuth-App konfiguriert? */
  configured: boolean;
  /** Service Key für die Ortssuche konfiguriert? */
  placesConfigured: boolean;
  loggedIn: boolean;
}
