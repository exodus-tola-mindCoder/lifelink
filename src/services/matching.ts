import type { AppUser, BloodType, Coordinates, UrgencyLevel } from "../types/models";

const earthRadiusKm = 6371;

const donorCompatibility: Record<BloodType, BloodType[]> = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]
};

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

export function getDistanceKm(from: Coordinates, to: Coordinates): number {
  const dLat = toRad(to.latitude - from.latitude);
  const dLng = toRad(to.longitude - from.longitude);
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export function isCompatibleDonor(donorType: BloodType, patientType: BloodType): boolean {
  return donorCompatibility[patientType].includes(donorType);
}

export function getMatchingDonors(params: {
  donors: AppUser[];
  requestedBloodType: BloodType;
  hospitalLocation?: Coordinates;
  radiusKm: number;
}): AppUser[] {
  const { donors, requestedBloodType, hospitalLocation, radiusKm } = params;

  return donors.filter((donor) => {
    if (donor.role !== "donor" || !donor.availability || !donor.bloodType) {
      return false;
    }

    if (!isCompatibleDonor(donor.bloodType, requestedBloodType)) {
      return false;
    }

    if (!hospitalLocation || !donor.location) {
      return false;
    }

    return getDistanceKm(donor.location, hospitalLocation) <= radiusKm;
  });
}

export function calculateSuggestedCost(distanceKm: number, urgency: UrgencyLevel): number {
  const urgencyMultiplier: Record<UrgencyLevel, number> = {
    low: 0.9,
    medium: 1,
    high: 1.25,
    critical: 1.5
  };

  const base = 200;
  const perKm = 35;
  const amount = Math.round((base + distanceKm * perKm) * urgencyMultiplier[urgency]);
  return Math.max(200, Math.min(amount, 2500));
}

export function generateTransactionId(): string {
  const part = Math.floor(100000 + Math.random() * 900000);
  return `LLX${part}`;
}
