import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface ClassProfile {
  id?: string;
  grade_label?: string | null;
  class_label?: string | null;
  student_count?: number | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  whatsapp_link?: string | null;
  instagram_handle?: string | null;
  group_link?: string | null;
  updated_at?: string | null;
}

export const defaultClassProfile: ClassProfile = {
  grade_label: 'X',
  class_label: '-5',
  student_count: 49,
  contact_name: 'Pengurus kelas',
};

let cachedProfile: ClassProfile | null = null;
let pendingRequest: Promise<ClassProfile> | null = null;

const fetchClassProfile = async (): Promise<ClassProfile> => {
  const { data, error } = await supabase
    .from('class_profile')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    console.warn('Using default class profile. Reason:', error?.message ?? 'No data');
    return defaultClassProfile;
  }

  return {
    ...defaultClassProfile,
    ...data,
  };
};

const buildClassDisplayName = (profile: ClassProfile) => {
  const parts = [profile.grade_label?.trim(), profile.class_label?.trim()].filter(Boolean);
  return parts.length ? `Kelas ${parts.join(' ')}` : 'Kelas X-5';
};

export const useClassProfile = () => {
  const [profile, setProfile] = useState<ClassProfile>(cachedProfile ?? defaultClassProfile);

  useEffect(() => {
    let mounted = true;

    if (cachedProfile) {
      setProfile(cachedProfile);
      return () => {
        mounted = false;
      };
    }

    if (!pendingRequest) {
      pendingRequest = fetchClassProfile().finally(() => {
        pendingRequest = null;
      });
    }

    pendingRequest
      ?.then((result) => {
        if (mounted) {
          cachedProfile = result;
          setProfile(result);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch class profile:', error);
        if (mounted) {
          setProfile(defaultClassProfile);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const displayName = buildClassDisplayName(profile);
  const studentCount =
    typeof profile.student_count === 'number' ? profile.student_count : defaultClassProfile.student_count!;
  const contactName = profile.contact_name || defaultClassProfile.contact_name!;

  return {
    profile,
    displayName,
    studentCount,
    contactName,
  };
};

export const resetClassProfileCache = () => {
  cachedProfile = null;
};
