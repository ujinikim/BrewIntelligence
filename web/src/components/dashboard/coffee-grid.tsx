import { CoffeeReview } from '@/utils/supabase-data';
import { ReviewCard } from '@/components/shared/review-card';

export function CoffeeGrid({ data }: { data: CoffeeReview[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {data.map((bean, idx) => (
        <ReviewCard key={bean.id} bean={bean} idx={idx} />
      ))}
    </div>
  );
}
