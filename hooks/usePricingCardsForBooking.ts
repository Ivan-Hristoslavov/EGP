import { useState, useEffect } from 'react';

export type BookingService = {
  id: string;
  name: string;
  description: string;
  price: string;
  icon: string;
  type: 'pricing_card';
};

export function usePricingCardsForBooking() {
  const [services, setServices] = useState<BookingService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPricingCards = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/pricing-cards');
      
      if (!response.ok) {
        throw new Error('Failed to fetch pricing cards');
      }
      
      const data = await response.json();
      const pricingCards = data.pricingCards || [];
      
      // Convert pricing cards to booking services format
      const bookingServices: BookingService[] = pricingCards.map((card: any) => {
        // Get the first price from table_rows if available
        let price = 'Contact for quote';
        if (card.table_rows && card.table_rows.length > 0) {
          const firstRow = card.table_rows[0];
          // Look for price-like fields in the row
          const priceField = Object.values(firstRow).find((value: any) => 
            typeof value === 'string' && 
            (value.includes('£') || value.includes('€') || value.includes('$') || 
             /^\d+(\.\d{2})?$/.test(value))
          );
          if (priceField) {
            price = priceField.toString();
          }
        }

        return {
          id: `pricing_${card.id}`,
          name: card.title,
          description: card.subtitle || 'Professional service',
          price: price,
          icon: '💆', // Default icon for aesthetic services
          type: 'pricing_card' as const
        };
      });
      
      setServices(bookingServices);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingCards();
  }, []);

  return {
    services,
    isLoading,
    error,
    refetch: fetchPricingCards,
  };
} 