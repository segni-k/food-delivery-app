import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderService } from '../services/orderService';

const reviewSchema = z.object({
  restaurant_rating: z.coerce.number().min(1).max(5),
  delivery_rating: z.coerce.number().min(1).max(5),
  comment: z.string().max(400).optional().or(z.literal('')),
});

const ratingOptions = [5, 4, 3, 2, 1];

const OrderReviewForm = ({ orderId, onSubmitted }) => {
  const [apiError, setApiError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      restaurant_rating: 5,
      delivery_rating: 5,
      comment: '',
    },
  });

  const onSubmit = async (values) => {
    setApiError('');
    setIsSubmitting(true);

    try {
      const review = await orderService.submitReview({
        order_id: orderId,
        restaurant_rating: values.restaurant_rating,
        delivery_rating: values.delivery_rating,
        comment: values.comment || undefined,
      });

      if (typeof onSubmitted === 'function') {
        onSubmitted(review);
      }
      reset(values);
    } catch (error) {
      setApiError(error?.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-2xl border border-neutral-200 bg-white/95 p-4 dark:border-neutral-700 dark:bg-neutral-900/95">
      <h3 className="text-base font-bold">Rate your order</h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Restaurant rating</label>
          <select
            {...register('restaurant_rating')}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-orange-500 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950"
          >
            {ratingOptions.map((rating) => (
              <option key={`restaurant-rating-${rating}`} value={rating}>
                {rating} / 5
              </option>
            ))}
          </select>
          {errors.restaurant_rating ? <p className="mt-1 text-xs text-red-600">{errors.restaurant_rating.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Delivery partner rating</label>
          <select
            {...register('delivery_rating')}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-orange-500 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950"
          >
            {ratingOptions.map((rating) => (
              <option key={`delivery-rating-${rating}`} value={rating}>
                {rating} / 5
              </option>
            ))}
          </select>
          {errors.delivery_rating ? <p className="mt-1 text-xs text-red-600">{errors.delivery_rating.message}</p> : null}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Comment (optional)</label>
        <textarea
          {...register('comment')}
          rows={3}
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-orange-500 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950"
          placeholder="Tell us about your food and delivery experience"
        />
        {errors.comment ? <p className="mt-1 text-xs text-red-600">{errors.comment.message}</p> : null}
      </div>

      {apiError ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{apiError}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Submitting review...' : 'Submit review'}
      </button>
    </form>
  );
};

export default OrderReviewForm;

