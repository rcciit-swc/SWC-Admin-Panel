import * as z from 'zod';

export const eventSchema = z.object({
  name: z.string().min(2, 'Event name must be at least 2 characters'),
  registration_fees: z.coerce
    .number()
    .min(0, 'Registration fee must be at least 0'),
  prize_pool: z.coerce.number().min(0, 'Prize pool must be at least 0'),
  image_url: z.string().optional().nullable(),
  min_team_size: z.coerce
    .number()
    .min(1, 'Minimum team size must be at least 1'),
  max_team_size: z.coerce
    .number()
    .min(1, 'Maximum team size must be at least 1'),
  schedule: z.string().optional().default(''),
  description: z.string().optional().default(''),
  rules: z.string().optional().default(''),
  coordinators: z
    .array(
      z.object({
        name: z.string(),
        phone: z.string(),
      })
    )
    .optional(),
  links: z
    .array(
      z.object({
        title: z.string(),
        url: z.string().url(),
      })
    )
    .optional(),
  // event_category_id: z.string().min(5, 'Please select a category'),
  reg_status: z.boolean(),
});
