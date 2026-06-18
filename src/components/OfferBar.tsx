import { createClient } from "@/utils/supabase/server";
import OfferBarClient from "./OfferBarClient";

export default async function OfferBar() {
  const supabase = await createClient();
  const { data: offer, error } = await supabase
    .from('offers')
    .select('message, is_active')
    .eq('id', 1)
    .single();

  if (error || !offer || !offer.is_active || !offer.message) return null;

  return <OfferBarClient message={offer.message} />;
}
