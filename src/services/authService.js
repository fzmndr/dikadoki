import { supabase } from "../lib/supabase";

export const getCurrentAdminSession = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
};

export const loginAdmin = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data.session;
};

export const logoutAdmin = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  return true;
};