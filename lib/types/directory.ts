export interface ResidentProfile {
  id: string
  firstName: string | null
  lastName: string | null
  displayName: string | null
  bio: string | null
  phone: string | null
  profilePictureUrl: string | null
  occupation: string | null
  moveInDate: string | null
  residencyStatus: string | null
  languagesSpoken: string[] | null
  unit: {
    id: string
    unitNumber: string
    floor: number
  } | null
  socialMediaLinks: Record<string, string> | null
  skills: string[] | null
  interests: string[] | null
  communityInvolvement: string[] | null
}

export interface DirectoryFiltersState {
  search: string | null
  floor: number | null
}

export type SocialMediaPlatform = 'LinkedIn' | 'Twitter' | 'Instagram' | 'Facebook' | 'GitHub' | string