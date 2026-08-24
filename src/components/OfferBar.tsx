import { createClient } from "@/utils/supabase/server";
import OfferBarClient from "./OfferBarClient";

export default async function OfferBar() {
  const supabase = await createClient();
  
  // Fetch active carousel offers
  const { data: offers, error } = await supabase
    .from('carousel_offers')
    .select('message')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // If no carousel offers, fallback to static offer if exists
  if (error || !offers || offers.length === 0) {
    const { data: staticOffer } = await supabase
      .from('offers')
      .select('message, is_active')
      .eq('id', 1)
      .single();
      
    if (staticOffer && staticOffer.is_active && staticOffer.message) {
      return <OfferBarClient messages={[staticOffer.message]} />;
    }
    return null;
  }

  const messages = offers.map(o => o.message).filter(Boolean);
  if (messages.length === 0) return null;

  return <OfferBarClient messages={messages} />;
}
